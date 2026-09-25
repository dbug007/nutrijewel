/* GET /api/admin/stats
   The numbers worth seeing on a phone before anything else. */

import { json } from '../../_shared/http.js';
import { requireAdmin, requireDb } from '../../_shared/admin.js';

export async function onRequestGet(ctx) {
  const denied = (await requireAdmin(ctx)) || requireDb(ctx.env);
  if (denied) return denied;

  const paidStates = "('paid','confirmed','packed','shipped','delivered')";

  const row = await ctx.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM orders WHERE status IN ${paidStates})                                  AS paid_orders,
       (SELECT COALESCE(SUM(total_paise),0) FROM orders WHERE status IN ${paidStates})              AS revenue_paise,
       (SELECT COUNT(*) FROM orders WHERE status IN ('paid','confirmed'))                           AS needs_action,
       -- A packed pickup is waiting at Lodha Belmondo, not waiting for a rider.
       (SELECT COUNT(*) FROM orders WHERE status = 'packed' AND fulfilment = 'delivery')             AS to_ship,
       (SELECT COUNT(*) FROM orders WHERE status = 'packed' AND fulfilment = 'pickup')               AS ready_for_pickup,
       (SELECT COUNT(*) FROM orders WHERE status IN ${paidStates}
          AND date(created_at) = date('now'))                                                       AS today_orders,
       (SELECT COALESCE(SUM(total_paise),0) FROM orders WHERE status IN ${paidStates}
          AND date(created_at) = date('now'))                                                       AS today_paise,
       -- Things that were recorded but never shown to anyone until now. Each
       -- is written by the webhook, verify or refund endpoints on the spot.
       (SELECT COUNT(*) FROM order_events WHERE detail LIKE 'amount mismatch%')                     AS amount_mismatches,
       (SELECT COUNT(*) FROM order_events WHERE detail = 'signature mismatch')                      AS signature_failures,
       (SELECT COUNT(*) FROM order_events WHERE detail LIKE 'refund failed%')                       AS refund_failures`
  ).first();

  return json({ ok: true, stats: row || {} });
}
