/*
 * The admin session cookie.
 *
 * After a verified Google sign-in, the server issues this instead of making the
 * owner paste a token. It is:
 *   HttpOnly         page scripts cannot read it, so an injected script cannot steal it
 *   Secure           sent only over HTTPS
 *   SameSite=Strict  never sent on a request that started on another site
 *   Path=/api/admin  sent only to the admin API, never to the rest of the shop
 *   signed           HMAC-SHA256 with SESSION_SECRET, so it cannot be forged or edited
 *   12 hours         then the owner signs in again
 *
 * Free of imports, so it can be tested from Node with real HMAC keys.
 *
 * Format: v1.<base64url(json)>.<base64url(hmac)>
 */

export const SESSION_COOKIE = 'nj_admin_session';
export const SESSION_SECONDS = 12 * 60 * 60;

const enc = new TextEncoder();
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function b64uToBytes(s) {
  let t = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  const bin = atob(t);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret) {
  if (!secret || String(secret).length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSession(secret, { email, now }) {
  const at = Number.isFinite(now) ? now : Math.floor(Date.now() / 1000);
  const payload = b64u(enc.encode(JSON.stringify({ e: String(email).toLowerCase(), x: at + SESSION_SECONDS })));
  const body = `v1.${payload}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body));
  return `${body}.${b64u(sig)}`;
}

/* Returns { email } for a genuine, unexpired session, otherwise null. Never
   throws on bad input: a malformed cookie is simply not a session. */
export async function verifySession(secret, token, { now } = {}) {
  try {
    const at = Number.isFinite(now) ? now : Math.floor(Date.now() / 1000);
    const parts = String(token || '').split('.');
    if (parts.length !== 3 || parts[0] !== 'v1') return null;
    const body = `${parts[0]}.${parts[1]}`;
    // subtle.verify compares the MAC in constant time.
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64uToBytes(parts[2]), enc.encode(body));
    if (!ok) return null;
    const claims = JSON.parse(new TextDecoder().decode(b64uToBytes(parts[1])));
    if (typeof claims.x !== 'number' || claims.x <= at || !claims.e) return null;
    return { email: claims.e };
  } catch (_) {
    return null;
  }
}

export function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0`;
}
