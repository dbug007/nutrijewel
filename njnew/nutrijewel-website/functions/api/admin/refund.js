/* POST /api/admin/refund   { orderId }

   Refunds an order in full through Razorpay.

   The rule this exists to enforce: money moves at Razorpay, and our status
   follows it. An order is only marked `refunded` after Razorpay has accepted the
   refund. There is deliberately no manual "mark refunded" transition in the
   admin, because a status that says refunded while the customer's money is
   still with you is worse than no status at all. */

import { json, fail, readJson } from '../../_shared/http.js';
import { requireAdmin, requireDb, accessIdentity } from '../../_shared/admin.js';
import { createRefund, razorpayConfigured } from '../../_shared/razorpay.js';

// Once money has been taken, it can be given back. Before that there is nothing
// to refund, and after a refund there is nothing left.
const REFUNDABLE = ['paid', 'confirmed', 'packed', 'shipped', 'delivered'];

export async function onRequestPost(ctx) {
  const denied = (await requireAdmin(ctx)) || requireDb(ctx.env);
  if (denied) return denied;
  if (!razorpayConfigured(ctx.env)) return fail('Payments are not configured.', 503);

  const read = await readJson(ctx.request);
  if (!read.ok) return read.response;
  const { orderId } = read.body || {};
  if (!orderId || typeof orderId !== 'string') return fail('Missing order.', 400);

  const order = await ctx.env.DB.prepare(
    'SELECT id, order_number, status, total_paise, razorpay_payment_id FROM orders WHERE id = ?'
  ).bind(orderId).first();
  if (!order) return fail('Order not found.', 404);

  if (order.status === 'refunded') return fail('This order has already been refunded.', 409);
  if (!REFUNDABLE.includes(order.status)) {
    return fail(`An order that is ${order.status} has no payment to refund.`, 409);
  }
  if (!order.razorpay_payment_id) {
    return fail('No Razorpay payment is recorded on this order, so it cannot be refunded here.', 409);
  }

  let refund;
  try {
    refund = await createRefund(ctx.env, {
      paymentId: order.razorpay_payment_id,
      amountPaise: order.total_paise,
      orderNumber: order.order_number,
    });
  } catch (e) {
    // Record the failed attempt so it is visible, and change nothing else.
    await ctx.env.DB.prepare(
      "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,?,?,'admin',?)"
    ).bind(order.id, order.status, order.status, `refund failed: ${String(e.message).slice(0, 180)}`).run().catch(() => {});
    return fail(`Razorpay did not accept the refund: ${e.message}`, e.status || 502);
  }

  const who = ctx.adminEmail || accessIdentity(ctx.request) || 'admin';
  await ctx.env.DB.batch([
    ctx.env.DB.prepare(
      "UPDATE orders SET status='refunded', updated_at=datetime('now') WHERE id=? AND status=?"
    ).bind(order.id, order.status),
    ctx.env.DB.prepare(
      "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,?,'refunded','admin',?)"
    ).bind(order.id, order.status, `${refund.id} for ${order.total_paise} paise by ${who}`),
  ]);

  return json({
    ok: true,
    orderNumber: order.order_number,
    refundId: refund.id,
    amountPaise: refund.amount,
    refundStatus: refund.status, // usually 'processed' or 'pending'
  });
}
