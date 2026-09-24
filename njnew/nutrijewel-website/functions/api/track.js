/* POST /api/track   { type: 'pageview', path, ref, entry }  |  { type: 'event', event }

   Cookie-free visitor counts, for every visitor. No consent is needed because
   nothing written here is personal data (see migrations/0004_cookieless_visits.sql):
     - no cookie, no session id, no identifier: rows cannot be linked together
     - no IP address is stored. The rate limiter sees a keyed hash of it, and
       that expires within a day (see _shared/rateLimit.js)
     - the user-agent is read to classify the device, then discarded
     - the path loses its query string and fragment
     - the referrer is reduced to its host
   Bots and crawlers are dropped so they do not inflate the owner's numbers.

   Always answers 204 and never reveals why something was dropped: this is a
   beacon, and a detailed error only helps someone trying to game the stats. */

import { rateLimit, clientIp } from '../_shared/rateLimit.js';

/* Paid orders are not an event here: they come from the orders table, which
   covers everyone, as these counts now do too. */
const EVENTS = ['add_to_cart', 'begin_checkout'];
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

/* The referring host, or null for "direct". `self` is true when the visitor came
   from one of this site's own pages, which is never the start of a visit. */
function referrer(ref) {
  if (!ref) return { host: null, self: false };
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase();
    if (!host) return { host: null, self: false };
    if (SELF_HOSTS.includes(host) || SELF_HOSTS.includes(`www.${host}`)) return { host: null, self: true };
    return { host: host.slice(0, 80), self: false };
  } catch (_) {
    return { host: null, self: false };
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return noContent();

  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT.test(ua)) return noContent();

  /* Generous for people, tight for anything flooding the stats. Its own bucket:
     sharing 'track' with /api/orders/track meant a shopper who browsed twenty
     pages was then refused when they looked up their order. */
  const limited = await rateLimit(env, { action: 'beacon', key: clientIp(request), limit: 150, windowSeconds: 600 });
  if (limited) return noContent();

  let body;
  try {
    const text = await request.text();
    if (text.length > 2048) return noContent();
    body = JSON.parse(text);
  } catch (_) {
    return noContent();
  }
  if (!body || typeof body !== 'object') return noContent();

  const day = istDay();

  try {
    if (body.type === 'pageview') {
      const path = cleanPath(body.path);
      if (!path) return noContent();
      /* The browser says whether this is the first page of the load; the server
         still refuses to call it the start of a visit if it came from our own
         pages. The source is only kept on entries, so it is first-touch. */
      const ref = referrer(body.ref);
      const entry = body.entry === true && !ref.self ? 1 : 0;
      const country = (request.cf && request.cf.country) ? String(request.cf.country).slice(0, 2) : null;
      await env.DB.prepare(
        'INSERT INTO hits (day, path, entry, referrer, device, country) VALUES (?,?,?,?,?,?)'
      ).bind(day, path, entry, entry ? ref.host : null, device(ua), country).run();

      // Keep about 13 months, then let it go. Housekeeping on roughly 1 hit in 200.
      if (Math.random() < 0.005) {
        env.DB.prepare("DELETE FROM hits WHERE day < date('now', '-400 days')").run().catch(() => {});
        env.DB.prepare("DELETE FROM hit_events WHERE day < date('now', '-400 days')").run().catch(() => {});
      }
    } else if (body.type === 'event' && EVENTS.includes(body.event)) {
      await env.DB.prepare('INSERT INTO hit_events (day, event) VALUES (?,?)').bind(day, body.event).run();
    }
  } catch (_) {
    // Analytics must never break the site. A write that fails is simply lost.
  }
  return noContent();
}

export const onRequest = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
