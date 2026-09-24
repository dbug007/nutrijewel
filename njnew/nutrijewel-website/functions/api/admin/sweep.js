/* POST /api/admin/sweep

   An order sits at `created` from the moment we ask Razorpay for an order id
   until a payment is confirmed. Most of those are people who opened the payment
   window and changed their mind, and they pile up in the admin looking like
   work that needs doing.

   This marks the stale ones `failed`. It is deliberately conservative:

     - only `created` rows, never anything that reached `paid`
     - only rows older than the cutoff, default 6 hours, because a slow bank
       redirect or a retried UPI collect can legitimately take a while
     - never touches a row that has a razorpay_payment_id, since that means a
       payment did happen and a human should look at it

   Run by hand from the admin, or on a schedule later. */

import { json, fail } from '../../_shared/http.js';
import { requireAdmin, requireDb, accessIdentity } from '../../_shared/admin.js';

const DEFAULT_HOURS = 6;
const MAX_HOURS = 720;

export async function onRequestPost(ctx) {
  const denied = requireAdmin(ctx) || requireDb(ctx.env);
  if (denied) return denied;

  let hours = DEFAULT_HOURS;
  try {
    const body = await ctx.request.json();
    if (body && body.hours != null) hours = Number(body.hours);
  } catch (_) { /* no body is fine, use the default */ }

  if (!Number.isFinite(hours) || hours < 1 || hours > MAX_HOURS) {
    return fail(`Cutoff must be between 1 and ${MAX_HOURS} hours.`, 400);
  }

  const cutoff = `-${Math.floor(hours)} hours`;

  const { results } = await ctx.env.DB.prepare(
    `SELECT id, order_number FROM orders
      WHERE status = 'created'
        AND razorpay_payment_id IS NULL
        AND created_at < datetime('now', ?)`
  ).bind(cutoff).all();

  const stale = results || [];
  if (stale.length === 0) return json({ ok: true, swept: 0 });

  const who = accessIdentity(ctx.request) || 'admin';
  const statements = [];
  stale.forEach((o) => {
    statements.push(ctx.env.DB.prepare(
      "UPDATE orders SET status='failed', updated_at=datetime('now') WHERE id=? AND status='created' AND razorpay_payment_id IS NULL"
    ).bind(o.id));
    statements.push(ctx.env.DB.prepare(
      "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,'created','failed','admin',?)"
    ).bind(o.id, `swept as abandoned after ${Math.floor(hours)}h by ${who}`));
  });
  await ctx.env.DB.batch(statements);

  return json({ ok: true, swept: stale.length, orders: stale.map((o) => o.order_number) });
}
