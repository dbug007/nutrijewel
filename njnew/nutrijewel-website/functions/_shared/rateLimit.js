/*
 * Fixed-window rate limiting on D1.
 *
 * Why here rather than Cloudflare's WAF rate limiting: this costs nothing, lives
 * in the repo, and is scoped to exactly the endpoints that need it.
 *
 * Fails OPEN if the table is missing or D1 errors. That is a deliberate choice
 * for a shop: a broken limiter must never stop a genuine customer paying. The
 * limits are a speed bump against scripts, not the security boundary; pricing
 * is enforced by the server and payments by Razorpay's signature regardless.
 */

import { json } from './http.js';

/* The caller's address as Cloudflare saw it. CF-Connecting-IP is set by
   Cloudflare's edge and cannot be forged by the client, unlike X-Forwarded-For. */
export function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

/* The key (an IP address, usually) is never written as it is. It goes in as an
   HMAC under RATE_LIMIT_SECRET, which counts the same address the same way but
   cannot be turned back into it, and the row is deleted within a day. Without
   the secret it is still hashed, just with a public key, which only raises the
   bar rather than closing it; production sets the secret. */
async function hashedKey(env, key) {
  const secret = (env && env.RATE_LIMIT_SECRET) || 'nutrijewel-rate-limit';
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(String(key))));
  return Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

/* Returns null if the request may proceed, or a 429 Response. */
export async function rateLimit(env, { action, key, limit, windowSeconds }) {
  if (!env || !env.DB) return null;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  let bucket;
  try { bucket = `${action}:${await hashedKey(env, key)}`; } catch (_) { return null; } // fail open, see above

  let count;
  try {
    const row = await env.DB.prepare(
      `INSERT INTO rate_limits (bucket, window_start, count) VALUES (?, ?, 1)
         ON CONFLICT (bucket, window_start) DO UPDATE SET count = count + 1
       RETURNING count`
    ).bind(bucket, windowStart).first();
    count = row ? row.count : 1;
  } catch (_) {
    return null; // fail open, see above
  }

  // Housekeeping, on roughly 1 request in 50, so the table stays small without
  // needing a scheduled job.
  if (Math.random() < 0.02) {
    env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now - 86400).run().catch(() => {});
  }

  if (count > limit) {
    const retryAfter = windowStart + windowSeconds - now;
    return json(
      { ok: false, errors: ['Too many attempts. Please wait a few minutes and try again.'] },
      429,
      { 'Retry-After': String(Math.max(retryAfter, 1)) }
    );
  }
  return null;
}
