/* GET /api/admin/traffic?days=30

   Visitor figures for the dashboard, from the site's own consented analytics.

   Every stage of the funnel is counted from the SAME population: visitors who
   accepted analytics. Paid orders from the orders table are deliberately not
   used here, because they include people who declined, and dividing them by
   consenting visits would overstate conversion.

   Returns ok:false when the period has no visits at all, so the dashboard shows
   nothing rather than a row of confident zeros. */

import { json, fail } from '../../_shared/http.js';
import { requireAdmin, requireDb } from '../../_shared/admin.js';

const ALLOWED_DAYS = [7, 30, 90];
const IST_TODAY = "date('now', '+330 minutes')";

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

  let daily, pages, refs, devs, funnel, prevFunnel;
  try {
    [daily, pages, refs, devs, funnel, prevFunnel] = await Promise.all([
      DB.prepare(`SELECT day, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS views
                    FROM page_views WHERE ${inPeriod} GROUP BY day ORDER BY day`).bind(since).all(),
      DB.prepare(`SELECT path, COUNT(*) AS views FROM page_views WHERE ${inPeriod}
                   GROUP BY path ORDER BY views DESC LIMIT 8`).bind(since).all(),
      /* First-touch: a visit belongs to wherever it ARRIVED from, its first page.
         Grouping every page view by referrer instead counted one visit under
         several sources (Instagram, then "Direct" for each page after), so the
         sources added up to more visits than there were. */
      DB.prepare(`SELECT COALESCE(referrer, 'Direct') AS source, COUNT(*) AS sessions FROM (
                    SELECT referrer, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY id) AS rn
                      FROM page_views WHERE ${inPeriod}
                  ) WHERE rn = 1 GROUP BY source ORDER BY sessions DESC LIMIT 6`).bind(since).all(),
      DB.prepare(`SELECT COALESCE(device, 'unknown') AS device, COUNT(DISTINCT session_id) AS sessions
                    FROM page_views WHERE ${inPeriod} GROUP BY device ORDER BY sessions DESC`).bind(since).all(),
      DB.prepare(`SELECT
           (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE ${inPeriod}) AS sessions,
           (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE event='begin_checkout' AND ${inPeriod}) AS checkouts,
           (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE event='purchase' AND ${inPeriod}) AS paid`)
        .bind(since, since, since).first(),
      DB.prepare(`SELECT
           (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE ${inPrev}) AS sessions,
           (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE event='purchase' AND ${inPrev}) AS paid`)
        .bind(prevSince, since, prevSince, since).first(),
    ]);
  } catch (_) {
    // The analytics tables are optional; without them there is simply no data yet.
    return json({ ok: false, reason: 'Visitor analytics is not set up yet.' });
  }

  if (!funnel || !funnel.sessions) return json({ ok: false, reason: 'No visitor data in this period yet.' });

  const byDay = Object.fromEntries((daily.results || []).map((r) => [r.day, r]));
  const totalDev = (devs.results || []).reduce((n, r) => n + r.sessions, 0) || 1;

  return json({
    ok: true,
    days,
    series: istDays(days).map((day) => ({
      day,
      sessions: byDay[day] ? byDay[day].sessions : 0,
      views: byDay[day] ? byDay[day].views : 0,
    })),
    topPages: pages.results || [],
    referrers: refs.results || [],
    devices: (devs.results || []).map((r) => ({ device: r.device, pct: Math.round((r.sessions / totalDev) * 100) })),
    funnel: { sessions: funnel.sessions, checkouts: funnel.checkouts, paid: funnel.paid },
    conversionPct: pct(funnel.paid, funnel.sessions),
    previousConversionPct: pct(prevFunnel.paid, prevFunnel.sessions),
    note: 'Counts only visitors who accepted analytics.',
  });
}
