/* GET /api/admin/traffic?days=30

   Visitor figures for the dashboard, from the site's own cookie-free counts
   (migrations/0004_cookieless_visits.sql), which cover every visitor.

   Because visits now come from everyone, they can be set against the real paid
   orders in the orders table. The earlier consent-only counts could not be: they
   saw a small, self-selected slice of visitors, and dividing everyone's orders by
   that slice overstated conversion badly.

   A visit is a page load that arrived from outside the site. With no identifier
   there is no way to tell one person's two visits apart, so this is visits, not
   unique people, and the dashboard says so.

   Returns ok:false when the period has no page views at all, so the dashboard
   shows an empty state rather than a row of confident zeros. */

import { json, fail } from '../../_shared/http.js';
import { requireAdmin, requireDb } from '../../_shared/admin.js';

const ALLOWED_DAYS = [7, 30, 90];
const IST_TODAY = "date('now', '+330 minutes')";
/* The definition analytics.js uses for the "Paid orders" tile. */
const PAID = "('paid','confirmed','packed','shipped','delivered')";
const ORDER_DAY = "date(paid_at, '+330 minutes')";
/* Orders only count from the first day visits were counted. Without this, the
   first month after the counter went live divided a whole month of orders by a
   few days of visits and reported conversion far too high. Once the counter has
   run a full period, this changes nothing and the funnel's Paid matches the tile. */
const SINCE_COUNTING = `${ORDER_DAY} >= (SELECT MIN(day) FROM hits)`;

function istDays(days) {
  const t = new Date(Date.now() + 330 * 60000);
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - i)).toISOString().slice(0, 10));
  }
  return out;
}

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export async function onRequestGet(ctx) {
  const denied = (await requireAdmin(ctx)) || requireDb(ctx.env);
  if (denied) return denied;

  const days = Number(new URL(ctx.request.url).searchParams.get('days') || 30);
  if (!ALLOWED_DAYS.includes(days)) return fail(`days must be one of ${ALLOWED_DAYS.join(', ')}.`, 400);

  const DB = ctx.env.DB;
  const since = `-${days - 1} days`;
  const prevSince = `-${days * 2 - 1} days`;
  const inPeriod = `day >= date(${IST_TODAY}, ?)`;
  const inPrev = `day >= date(${IST_TODAY}, ?) AND day < date(${IST_TODAY}, ?)`;
  const orderInPeriod = `${ORDER_DAY} >= date(${IST_TODAY}, ?)`;
  const orderInPrev = `${ORDER_DAY} >= date(${IST_TODAY}, ?) AND ${ORDER_DAY} < date(${IST_TODAY}, ?)`;

  let daily, pages, refs, devs, countries, funnel, prev;
  try {
    [daily, pages, refs, devs, countries, funnel, prev] = await Promise.all([
      DB.prepare(`SELECT day, SUM(entry) AS visits, COUNT(*) AS views
                    FROM hits WHERE ${inPeriod} GROUP BY day ORDER BY day`).bind(since).all(),
      DB.prepare(`SELECT path, COUNT(*) AS views FROM hits WHERE ${inPeriod}
                   GROUP BY path ORDER BY views DESC LIMIT 8`).bind(since).all(),
      // Only entries carry a source, so each visit is counted once, where it arrived from.
      DB.prepare(`SELECT COALESCE(referrer, 'Direct') AS source, COUNT(*) AS visits
                    FROM hits WHERE entry = 1 AND ${inPeriod}
                   GROUP BY source ORDER BY visits DESC LIMIT 6`).bind(since).all(),
      DB.prepare(`SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS visits
                    FROM hits WHERE entry = 1 AND ${inPeriod}
                   GROUP BY device ORDER BY visits DESC`).bind(since).all(),
      DB.prepare(`SELECT COALESCE(country, '??') AS country, COUNT(*) AS visits
                    FROM hits WHERE entry = 1 AND ${inPeriod}
                   GROUP BY country ORDER BY visits DESC LIMIT 6`).bind(since).all(),
      DB.prepare(`SELECT
           (SELECT COUNT(*) FROM hits WHERE entry = 1 AND ${inPeriod}) AS visits,
           (SELECT COUNT(*) FROM hits WHERE ${inPeriod}) AS views,
           (SELECT COUNT(*) FROM hit_events WHERE event = 'add_to_cart' AND ${inPeriod}) AS carts,
           (SELECT COUNT(*) FROM hit_events WHERE event = 'begin_checkout' AND ${inPeriod}) AS checkouts,
           (SELECT COUNT(*) FROM orders WHERE status IN ${PAID} AND paid_at IS NOT NULL AND ${orderInPeriod} AND ${SINCE_COUNTING}) AS paid`)
        .bind(since, since, since, since, since).first(),
      DB.prepare(`SELECT
           (SELECT COUNT(*) FROM hits WHERE entry = 1 AND ${inPrev}) AS visits,
           (SELECT COUNT(*) FROM hits WHERE ${inPrev}) AS views,
           (SELECT COUNT(*) FROM orders WHERE status IN ${PAID} AND paid_at IS NOT NULL AND ${orderInPrev} AND ${SINCE_COUNTING}) AS paid`)
        .bind(prevSince, since, prevSince, since, prevSince, since).first(),
    ]);
  } catch (_) {
    // The tables arrive with migration 0004; without them there is simply no data yet.
    return json({ ok: false, reason: 'Visitor analytics is not set up yet.' });
  }

  if (!funnel || !funnel.views) return json({ ok: false, reason: 'No visitor data in this period yet.' });

  const byDay = Object.fromEntries((daily.results || []).map((r) => [r.day, r]));
  const totalDev = (devs.results || []).reduce((n, r) => n + r.visits, 0) || 1;

  return json({
    ok: true,
    days,
    series: istDays(days).map((day) => ({
      day,
      visits: byDay[day] ? byDay[day].visits || 0 : 0,
      views: byDay[day] ? byDay[day].views : 0,
    })),
    totals: { visits: funnel.visits, views: funnel.views },
    previous: { visits: prev.visits, views: prev.views },
    topPages: pages.results || [],
    referrers: refs.results || [],
    countries: countries.results || [],
    devices: (devs.results || []).map((r) => ({ device: r.device, pct: Math.round((r.visits / totalDev) * 100) })),
    funnel: { visits: funnel.visits, carts: funnel.carts, checkouts: funnel.checkouts, paid: funnel.paid },
    conversionPct: pct(funnel.paid, funnel.visits),
    previousConversionPct: pct(prev.paid, prev.visits),
  });
}
