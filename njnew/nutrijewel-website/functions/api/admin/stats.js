/* GET /api/admin/stats
   The numbers worth seeing on a phone before anything else. */

import { json } from '../../_shared/http.js';
import { requireAdmin, requireDb } from '../../_shared/admin.js';

export async function onRequestGet(ctx) {
  const denied = requireAdmin(ctx) || requireDb(ctx.env);
  if (denied) return denied;

  const paidStates = "('paid','confirmed','packed','shipped','delivered')";

  const row = await ctx.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM orders WHERE status IN ${paidStates})                                  AS paid_orders,
       (SELECT COALESCE(SUM(total_paise),0) FROM orders WHERE status IN ${paidStates})              AS revenue_paise,
       (SELECT COUNT(*) FROM orders WHERE status IN ('paid','confirmed'))                           AS needs_action,
       (SELECT COUNT(*) FROM orders WHERE status = 'packed')                                        AS to_ship,
       (SELECT COUNT(*) FROM orders WHERE status IN ${paidStates}
          AND date(created_at) = date('now'))                                                       AS today_orders,
       (SELECT COALESCE(SUM(total_paise),0) FROM orders WHERE status IN ${paidStates}
          AND date(created_at) = date('now'))                                                       AS today_paise`
  ).first();

  return json({ ok: true, stats: row || {} });
}
