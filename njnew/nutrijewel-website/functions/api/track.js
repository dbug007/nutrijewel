/* POST /api/track   { type: 'pageview' | 'event', path, ref, sid, event }

   First-party analytics, sent by the browser only after the visitor accepted
   analytics in the consent banner.

   Designed so nothing identifying is ever written:
     - the user-agent is read to classify the device, then discarded
     - no IP address is stored (it is used only for rate limiting, in memory)
     - the path loses its query string and fragment
     - the referrer is reduced to its host
   Bots and crawlers are dropped so they do not inflate the owner's numbers.

   Always answers 204 and never reveals why something was dropped: this is a
   beacon, and a detailed error only helps someone trying to game the stats. */

import { rateLimit, clientIp } from '../_shared/rateLimit.js';

/* `purchase` is here so conversion can be measured within ONE population. Paid
   orders come from everyone, including people who declined analytics, while
   visits come only from people who accepted. Dividing one by the other would
   overstate conversion badly. Counting purchases from consenting visits keeps
   every stage of the funnel on the same footing. */
const EVENTS = ['add_to_cart', 'begin_checkout', 'purchase'];
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|httpclient|axios/i;
const SELF_HOSTS = ['nutrijewel.com', 'www.nutrijewel.com', 'nutrijewel.pages.dev'];
const noContent = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

function istDay() {
  return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
}

function device(ua) {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

/* Only the path. Query strings and fragments can carry an email or an order
   number, so they are never kept. Unknown shapes collapse to a safe value. */
function cleanPath(p) {
  const raw = String(p || '').split('?')[0].split('#')[0].trim();
  if (!raw.startsWith('/') || raw.length > 120) return null;
  if (!/^[a-z0-9/_\-.]*$/i.test(raw)) return null;
  const trimmed = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  return trimmed || '/';
}

function referrerHost(ref) {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase();
    if (!host || SELF_HOSTS.includes(host) || SELF_HOSTS.includes(`www.${host}`)) return null;
    return host.slice(0, 80);
  } catch (_) {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return noContent();

  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT.test(ua)) return noContent();

  // Generous for people, tight for anything flooding the stats.
  const limited = await rateLimit(env, { action: 'track', key: clientIp(request), limit: 150, windowSeconds: 600 });
  if (limited) return noContent();

  let body;
  try {
    const text = await request.text();
    if (text.length > 2048) return noContent();
    body = JSON.parse(text);
  } catch (_) {
    return noContent();
  }

  const sid = String(body.sid || '');
  if (!/^[a-f0-9]{24,40}$/.test(sid)) return noContent();

  const day = istDay();

  try {
    if (body.type === 'pageview') {
      const path = cleanPath(body.path);
      if (!path) return noContent();
      const country = (request.cf && request.cf.country) ? String(request.cf.country).slice(0, 2) : null;
      await env.DB.prepare(
        'INSERT INTO page_views (day, path, session_id, referrer, device, country) VALUES (?,?,?,?,?,?)'
      ).bind(day, path, sid, referrerHost(body.ref), device(ua), country).run();

      // Keep about 13 months, then let it go. Housekeeping on roughly 1 hit in 200.
      if (Math.random() < 0.005) {
        env.DB.prepare("DELETE FROM page_views WHERE day < date('now', '-400 days')").run().catch(() => {});
        env.DB.prepare("DELETE FROM analytics_events WHERE day < date('now', '-400 days')").run().catch(() => {});
      }
    } else if (body.type === 'event' && EVENTS.includes(body.event)) {
      await env.DB.prepare(
        'INSERT INTO analytics_events (day, session_id, event) VALUES (?,?,?)'
      ).bind(day, sid, body.event).run();
    }
  } catch (_) {
    // Analytics must never break the site. A write that fails is simply lost.
  }
  return noContent();
}

export const onRequest = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
