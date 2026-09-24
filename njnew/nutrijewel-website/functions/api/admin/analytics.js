/* GET /api/admin/analytics?days=30

   Sales figures for the admin dashboard, from real orders in D1.

   Every date here is India time. Orders are stored in UTC, so grouping by the
   raw timestamp would put an order paid at 1am IST on the previous day, and the
   day-by-day chart would quietly disagree with the owner's own sense of "today".
   `+330 minutes` is IST (UTC+5:30); India has no daylight saving, so a fixed
   offset is exact rather than an approximation.

   Revenue counts only orders that took money and kept it: paid through
   delivered. Refunded, failed, cancelled and unpaid orders are excluded, so the
   figure is money actually in hand. */

import { json, fail } from '../../_shared/http.js';
import { requireAdmin, requireDb } from '../../_shared/admin.js';

const PAID = "('paid','confirmed','packed','shipped','delivered')";
const IST = "'+330 minutes'";
const ALLOWED_DAYS = [7, 30, 90];

/* The last `days` calendar dates in India, oldest first, as YYYY-MM-DD. */
function istDays(days) {
  const todayIst = new Date(Date.now() + 330 * 60000);
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(todayIst.getUTCFullYear(), todayIst.getUTCMonth(), todayIst.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function onRequestGet(ctx) {
  const denied = (await requireAdmin(ctx)) || requireDb(ctx.env);
  if (denied) return denied;

  const days = Number(new URL(ctx.request.url).searchParams.get('days') || 30);
  if (!ALLOWED_DAYS.includes(days)) return fail(`days must be one of ${ALLOWED_DAYS.join(', ')}.`, 400);

  const DB = ctx.env.DB;
  const since = `-${days - 1} days`;          // start of this period, inclusive
  const prevSince = `-${days * 2 - 1} days`;  // start of the period before it

  const [daily, cur, prev, top, statuses] = await Promise.all([
    DB.prepare(
      `SELECT date(paid_at, ${IST}) AS day, COUNT(*) AS orders, COALESCE(SUM(total_paise),0) AS revenue
         FROM orders
        WHERE status IN ${PAID} AND paid_at IS NOT NULL
          AND date(paid_at, ${IST}) >= date('now', ${IST}, ?)
        GROUP BY day ORDER BY day`
    ).bind(since).all(),
    DB.prepare(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total_paise),0) AS revenue
         FROM orders
        WHERE status IN ${PAID} AND paid_at IS NOT NULL
          AND date(paid_at, ${IST}) >= date('now', ${IST}, ?)`
    ).bind(since).first(),
    DB.prepare(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total_paise),0) AS revenue
         FROM orders
        WHERE status IN ${PAID} AND paid_at IS NOT NULL
          AND date(paid_at, ${IST}) >= date('now', ${IST}, ?)
          AND date(paid_at, ${IST}) <  date('now', ${IST}, ?)`
    ).bind(prevSince, since).first(),
    DB.prepare(
      `SELECT i.product_name AS name, SUM(i.line_paise) AS revenue, SUM(i.qty) AS units
         FROM order_items i JOIN orders o ON o.id = i.order_id
        WHERE o.status IN ${PAID} AND o.paid_at IS NOT NULL
          AND date(o.paid_at, ${IST}) >= date('now', ${IST}, ?)
        GROUP BY i.product_name ORDER BY revenue DESC LIMIT 8`
    ).bind(since).all(),
    DB.prepare(
      `SELECT status, COUNT(*) AS n FROM orders
        WHERE date(created_at, ${IST}) >= date('now', ${IST}, ?)
        GROUP BY status`
    ).bind(since).all(),
  ]);

  // Every day in the period gets a row, including the ones with no orders, or a
  // chart of a quiet week would silently skip the quiet days.
  const byDay = Object.fromEntries((daily.results || []).map((r) => [r.day, r]));
  const series = istDays(days).map((day) => ({
    day,
    orders: byDay[day] ? byDay[day].orders : 0,
    revenuePaise: byDay[day] ? byDay[day].revenue : 0,
  }));

  const aov = (o) => (o && o.orders ? Math.round(o.revenue / o.orders) : 0);

  return json({
    ok: true,
    days,
    timezone: 'Asia/Kolkata',
    current: { orders: cur.orders, revenuePaise: cur.revenue, aovPaise: aov(cur) },
    previous: { orders: prev.orders, revenuePaise: prev.revenue, aovPaise: aov(prev) },
    series,
    topProducts: (top.results || []).map((r) => ({ name: r.name, revenuePaise: r.revenue, units: r.units })),
    statuses: Object.fromEntries((statuses.results || []).map((r) => [r.status, r.n])),
  });
}
