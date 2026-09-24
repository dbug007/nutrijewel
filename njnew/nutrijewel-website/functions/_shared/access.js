/*
 * Cloudflare Access (Google sign in) for the admin.
 *
 * Off until both are set as Cloudflare environment variables:
 *   ACCESS_TEAM_DOMAIN  e.g. nutrijewel.cloudflareaccess.com
 *   ACCESS_AUD          the Application Audience tag from the Access app
 *
 * Once on, every admin request must carry a JWT that Cloudflare signed, checked
 * by functions/_shared/jwt.js against the keys Cloudflare publishes. This sits
 * alongside the admin token rather than replacing it: two independent locks, so
 * a misconfigured Access policy does not open the order list on its own.
 */

import { verifyAccessJwt } from './jwt.js';

let cache = { url: '', at: 0, jwks: null };
const TEN_MINUTES = 10 * 60 * 1000;

async function getJwks(teamDomain) {
  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  if (cache.jwks && cache.url === url && Date.now() - cache.at < TEN_MINUTES) return cache.jwks;
  const res = await fetch(url);
  if (!res.ok) throw new Error('could not fetch Access signing keys');
  const jwks = await res.json();
  cache = { url, at: Date.now(), jwks };
  return jwks;
}

export function accessConfigured(env) {
  return !!(env && env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD);
}

/* Returns the verified email, or throws. Only call when configured. */
export async function verifyAccessRequest(request, env) {
  const token = request.headers.get('cf-access-jwt-assertion');
  const jwks = await getJwks(env.ACCESS_TEAM_DOMAIN);
  const claims = await verifyAccessJwt(token, jwks, {
    audience: env.ACCESS_AUD,
    issuer: `https://${env.ACCESS_TEAM_DOMAIN}`,
  });
  return claims.email || claims.sub || 'access-user';
}
