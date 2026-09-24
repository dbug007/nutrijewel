/* GET  /api/admin/orders?status=paid&limit=50
   POST /api/admin/orders   { orderId, toStatus }

   The owner's view of the shop. Protected by requireAdmin, which fails closed. */

import { json, fail, readJson } from '../../_shared/http.js';
import { requireAdmin, requireDb, accessIdentity } from '../../_shared/admin.js';

const STATUSES = ['created', 'paid', 'confirmed', 'packed', 'shipped', 'delivered', 'failed', 'cancelled', 'refunded'];

/* What the owner is allowed to do by hand. Payment states are deliberately
   absent: only Razorpay's webhook may set `paid`, so a stray click can never
   mark an unpaid order as paid. */
const MANUAL_TRANSITIONS = {
  paid:      ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed:    ['shipped', 'cancelled'],
  shipped:   ['delivered'],
  delivered: [],
  created:   ['cancelled'],
  failed:    [],
  cancelled: [],
  refunded:  [],
};

export async function onRequestGet(ctx) {
  const denied = (await requireAdmin(ctx)) || requireDb(ctx.env);
  if (denied) return denied;

  const url = new URL(ctx.request.url);
  const status = url.searchParams.get('status');
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 200);

  if (status && !STATUSES.includes(status)) return fail('Unknown status filter.', 400);

  const where = status ? 'WHERE o.status = ?' : '';
  const binds = status ? [status, limit] : [limit];

  const { results } = await ctx.env.DB.prepare(
    `SELECT o.id, o.order_number, o.status, o.items_paise, o.shipping_paise, o.total_paise,
            o.customer_name, o.customer_phone, o.customer_email,
            o.address_line, o.city, o.pincode, o.shipping_zone,
            o.razorpay_payment_id, o.paid_at, o.created_at,
            (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
       FROM orders o ${where}
      ORDER BY o.created_at DESC
      LIMIT ?`
  ).bind(...binds).all();

  const orders = results || [];

  /* Fetch the items for this page of orders in one query rather than one per
     order. A handful of orders is fine either way, but a busy festival week is
     not the moment to discover an N+1. */
  let itemsByOrder = {};
  if (orders.length) {
    const ids = orders.map((o) => o.id);
    const placeholders = ids.map(() => '?').join(',');
    const { results: items } = await ctx.env.DB.prepare(
      `SELECT order_id, product_name, weight, qty, line_paise
         FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`
    ).bind(...ids).all();
    (items || []).forEach((i) => {
      (itemsByOrder[i.order_id] = itemsByOrder[i.order_id] || []).push(i);
    });
  }

  return json({
    ok: true,
    orders: orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
      nextStatuses: MANUAL_TRANSITIONS[o.status] || [],
    })),
  });
}

export async function onRequestPost(ctx) {
  const denied = (await requireAdmin(ctx)) || requireDb(ctx.env);
  if (denied) return denied;

  const read = await readJson(ctx.request);
  if (!read.ok) return read.response;

  const { orderId, toStatus } = read.body || {};
  if (!orderId || typeof orderId !== 'string') return fail('Missing order.', 400);
  if (!STATUSES.includes(toStatus)) return fail('Unknown status.', 400);

  const order = await ctx.env.DB.prepare('SELECT id, status FROM orders WHERE id = ?').bind(orderId).first();
  if (!order) return fail('Order not found.', 404);

  const allowed = MANUAL_TRANSITIONS[order.status] || [];
  if (!allowed.includes(toStatus)) {
    return fail(`Cannot move an order from ${order.status} to ${toStatus}.`, 409);
  }

  const who = accessIdentity(ctx.request) || 'admin';

  await ctx.env.DB.batch([
    ctx.env.DB.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(toStatus, orderId),
    ctx.env.DB.prepare('INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?, ?, ?, ?, ?)')
      .bind(orderId, order.status, toStatus, 'admin', who),
  ]);

  return json({ ok: true, orderId, fromStatus: order.status, toStatus });
}
