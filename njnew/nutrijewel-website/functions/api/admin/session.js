/* /api/admin/session

   GET     who is signed in, and the Google client id the page needs to draw the
           sign-in button. The client id is public by design.
   POST    { credential }  exchange a Google ID token for a session cookie
   DELETE  sign out

   This endpoint is how you sign in, so it is deliberately NOT behind
   requireAdmin. What protects it: Google's signature on the credential, the
   ADMIN_EMAILS allowlist, a rate limit, and an Origin check. */

import { json, fail, readJson } from '../../_shared/http.js';
import { googleConfigured, adminEmails, verifyGoogleIdToken } from '../../_shared/google.js';
import { signSession, verifySession, readCookie, sessionCookie, clearSessionCookie, SESSION_COOKIE } from '../../_shared/session.js';
import { rateLimit, clientIp } from '../../_shared/rateLimit.js';
import { sameOrigin } from '../../_shared/admin.js';

export async function onRequestGet({ request, env }) {
  if (!googleConfigured(env)) return json({ ok: true, googleSignIn: false });
  const session = await verifySession(env.SESSION_SECRET, readCookie(request, SESSION_COOKIE));
  const allowed = session && adminEmails(env).includes(session.email);
  return json({
    ok: true,
    googleSignIn: true,
    googleClientId: env.GOOGLE_CLIENT_ID,
    signedIn: !!allowed,
    email: allowed ? session.email : null,
  });
}

export async function onRequestPost({ request, env }) {
  if (!googleConfigured(env)) return fail('Google sign in is not configured.', 503);
  if (!sameOrigin(request)) return fail('Not authorised.', 403);

  const limited = await rateLimit(env, { action: 'signin', key: clientIp(request), limit: 10, windowSeconds: 600 });
  if (limited) return limited;

  const read = await readJson(request, { maxBytes: 8192 });
  if (!read.ok) return read.response;
  const { credential } = read.body || {};

  let email;
  try {
    email = await verifyGoogleIdToken(env, credential);
  } catch (_) {
    email = null;
  }

  /* One answer for "bad token" and "not an owner", so this endpoint never
     confirms which Google account is the owner's. */
  if (!email || !adminEmails(env).includes(email)) {
    return fail('That Google account is not allowed to open the admin.', 403);
  }

  const token = await signSession(env.SESSION_SECRET, { email });
  return json({ ok: true, email }, 200, { 'Set-Cookie': sessionCookie(token) });
}

export async function onRequestDelete({ request }) {
  if (!sameOrigin(request)) return fail('Not authorised.', 403);
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
