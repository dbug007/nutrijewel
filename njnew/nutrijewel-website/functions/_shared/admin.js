/*
 * Admin authentication.
 *
 * The rule here is fail closed. If ADMIN_TOKEN is not configured, every admin
 * endpoint refuses rather than allowing access. The alternative, defaulting to
 * open when unconfigured, is how an order list ends up readable by anyone who
 * guesses the URL.
 *
 * Two layers are intended:
 *   1. Cloudflare Access in front of /admin and /api/admin/* (free up to 50
 *      users). It injects Cf-Access-Jwt-Assertion on every allowed request.
 *   2. This shared token, which also protects the endpoints if Access is ever
 *      misconfigured or removed.
 *
 * Set the token with:
 *   npx wrangler pages secret put ADMIN_TOKEN --project-name nutrijewel
 */

import { json } from './http.js';

/* Constant-time string compare. A plain === leaks how much of the token matched
   through timing, which is enough to recover a secret given enough attempts.
   The length check is deliberately not short-circuited into the loop. */
function timingSafeEqual(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) {
    diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  }
  return diff === 0;
}

/* Returns null when the request may proceed, or a Response to return as-is. */
export function requireAdmin({ request, env }) {
  const expected = env && env.ADMIN_TOKEN;

  if (!expected) {
    // Not configured means not available. Never means "let everyone in".
    return json({ ok: false, errors: ['Admin is not configured.'] }, 503);
  }

  const header = request.headers.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const supplied = bearer || request.headers.get('x-admin-token') || '';

  if (!supplied || !timingSafeEqual(supplied, expected)) {
    return json({ ok: false, errors: ['Not authorised.'] }, 401);
  }

  return null;
}

/* Cloudflare Access, when enabled, sets this header on every request it lets
   through. Presence is not proof on its own (the JWT would need verifying
   against the Access public keys), so it is recorded for the audit trail rather
   than trusted for authorisation. */
export function accessIdentity(request) {
  return request.headers.get('cf-access-authenticated-user-email') || null;
}

export function requireDb(env) {
  if (!env || !env.DB) {
    return json({ ok: false, errors: ['Database is not bound to this deployment.'] }, 503);
  }
  return null;
}
