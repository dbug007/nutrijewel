/*
 * Verifying a Cloudflare Access JWT.
 *
 * Deliberately free of imports so it can be tested from Node with real keys and
 * real signatures, not mocks. Node 20 and the Workers runtime both provide
 * atob, TextEncoder/TextDecoder and crypto.subtle, which is all this needs.
 *
 * The checks, in the order that matters:
 *   1. The algorithm must be RS256 and nothing else. Accepting whatever the
 *      token's own header claims is the classic JWT hole: "alg": "none", or an
 *      HS256 token signed with the public key as if it were a shared secret.
 *   2. The signature must verify against the key Cloudflare published for that
 *      token's key id.
 *   3. Only then are the claims read and trusted: audience, issuer, expiry.
 */

function b64urlToBytes(s) {
  let t = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToJson(s) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));
}

/* Returns the verified claims, or throws with a short reason. */
export async function verifyAccessJwt(token, jwks, { audience, issuer, now, subtle } = {}) {
  const cryptoSubtle = subtle || crypto.subtle;
  const at = Number.isFinite(now) ? now : Math.floor(Date.now() / 1000);

  if (typeof token !== 'string' || token.length > 16384) throw new Error('no token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const [h, p, sig] = parts;

  let header;
  try { header = b64urlToJson(h); } catch (_) { throw new Error('malformed header'); }
  if (header.alg !== 'RS256') throw new Error('unexpected algorithm');

  const jwk = ((jwks && jwks.keys) || []).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('unknown signing key');

  const key = await cryptoSubtle.importKey(
    'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
  );
  const valid = await cryptoSubtle.verify(
    'RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`)
  );
  if (!valid) throw new Error('bad signature');

  let claims;
  try { claims = b64urlToJson(p); } catch (_) { throw new Error('malformed claims'); }

  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audience || !auds.includes(audience)) throw new Error('wrong audience');
  if (!issuer || claims.iss !== issuer) throw new Error('wrong issuer');
  if (typeof claims.exp !== 'number' || claims.exp <= at) throw new Error('expired');
  // A minute of grace for clock skew between Cloudflare and this worker.
  if (typeof claims.nbf === 'number' && claims.nbf > at + 60) throw new Error('not yet valid');

  return claims;
}
