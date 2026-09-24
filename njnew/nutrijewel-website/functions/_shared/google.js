/*
 * Verifying a "Sign in with Google" ID token.
 *
 * The signature check itself is functions/_shared/jwt.js, the same verifier used
 * for Cloudflare Access and attack-tested against alg:none, algorithm confusion
 * and edited claims. This adds only what is specific to Google:
 *
 *   - Google's published signing keys
 *   - its two issuer spellings
 *   - audience must be THIS site's OAuth client id, so a token Google issued to
 *     some other app cannot be replayed here
 *   - email_verified must be true. Without that, anyone could create an account
 *     that merely claims the owner's address.
 *
 * Whether that verified email is allowed in is decided by the caller, against
 * ADMIN_EMAILS. Being a real Google user is not the same as being the owner.
 */

import { verifyAccessJwt } from './jwt.js';

const CERTS = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];
let cache = { at: 0, jwks: null };

async function googleKeys() {
  if (cache.jwks && Date.now() - cache.at < 60 * 60 * 1000) return cache.jwks;
  const res = await fetch(CERTS);
  if (!res.ok) throw new Error('could not fetch Google signing keys');
  cache = { at: Date.now(), jwks: await res.json() };
  return cache.jwks;
}

export function googleConfigured(env) {
  return !!(env && env.GOOGLE_CLIENT_ID && env.ADMIN_EMAILS && env.SESSION_SECRET);
}

export function adminEmails(env) {
  return String((env && env.ADMIN_EMAILS) || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}

/* Returns the verified, lower-cased email. Throws on anything else. */
export async function verifyGoogleIdToken(env, credential, { jwks, now } = {}) {
  const keys = jwks || (await googleKeys());
  const claims = await verifyAccessJwt(credential, keys, {
    audience: env.GOOGLE_CLIENT_ID,
    issuer: ISSUERS,
    now,
  });
  if (claims.email_verified !== true && claims.email_verified !== 'true') throw new Error('email not verified');
  if (!claims.email) throw new Error('no email');
  return String(claims.email).toLowerCase();
}
