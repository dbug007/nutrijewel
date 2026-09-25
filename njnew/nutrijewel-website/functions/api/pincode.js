/* GET /api/pincode?pin=411014

   City, state and country for an Indian pincode, so checkout can fill them in
   and catch a pincode that does not exist. The data is India Post's, through
   the free public service at api.postalpincode.in.

   Called from our own origin rather than the browser, so the site's CSP stays
   tight and the customer's browser never talks to a third party. Answers are
   cached for 30 days: pincodes do not move.

   Fails soft, on purpose. If India Post is slow or down, the answer is
   { ok: true, unavailable: true } and checkout lets the customer type the city
   by hand. A third-party outage must never block a sale. Only a definite "no
   such pincode" from India Post is reported as not found.

   Response: { ok, found, city, state, country, areas } | { ok, found: false }
             | { ok, unavailable: true } */

import { json, fail, methodNotAllowed } from '../_shared/http.js';
import { rateLimit, clientIp } from '../_shared/rateLimit.js';

const UPSTREAM = (pin) => `https://api.postalpincode.in/pincode/${pin}`;
const CACHE_SECONDS = 30 * 24 * 3600;
const TIMEOUT_MS = 4000;

/* India Post's answer, reduced to what checkout needs. District is what people
   call the city here (411014 is "Pune", not the post office "Vadgaon Sheri"). */
export function summarise(body) {
  const first = Array.isArray(body) ? body[0] : null;
  if (!first || typeof first.Status !== 'string') return null;              // unexpected shape
  if (first.Status !== 'Success' || !Array.isArray(first.PostOffice) || !first.PostOffice.length) {
    return { found: false };
  }
  const offices = first.PostOffice;
  const pick = (k) => {
    const counts = {};
    offices.forEach((o) => { if (o && o[k]) counts[o[k]] = (counts[o[k]] || 0) + 1; });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || '';
  };
  return {
    found: true,
    city: pick('District'),
    state: pick('State'),
    country: pick('Country') || 'India',
    areas: [...new Set(offices.map((o) => o && o.Name).filter(Boolean))].slice(0, 12),
  };
}

export async function onRequestGet({ request, env }) {
  const pin = (new URL(request.url).searchParams.get('pin') || '').trim();
  if (!/^[1-9][0-9]{5}$/.test(pin)) return fail('Enter a valid 6 digit pincode.', 400);

  // Generous for a person typing, tight for anything using this as a free proxy.
  const limited = await rateLimit(env, { action: 'pincode', key: clientIp(request), limit: 60, windowSeconds: 600 });
  if (limited) return limited;

  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = new Request(`https://nutrijewel.com/__pincode/${pin}`);
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  let summary = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(UPSTREAM(pin), { signal: ctrl.signal, headers: { accept: 'application/json' } });
    clearTimeout(timer);
    if (res.ok) summary = summarise(await res.json());
  } catch (_) {
    summary = null;
  }

  if (!summary) return json({ ok: true, unavailable: true }); // never cached: try again next time

  const out = json({ ok: true, ...summary }, 200, { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` });
  if (cache) await cache.put(cacheKey, out.clone());
  return out;
}

export const onRequest = () => methodNotAllowed('GET');
