/*
 * Cloudflare Turnstile, the free bot check, on checkout.
 *
 * Off until BOTH keys are set as Cloudflare secrets:
 *   TURNSTILE_SITE_KEY  public, handed to the page so it can draw the widget
 *   TURNSTILE_SECRET    private, used here to verify the token
 *
 * Requiring both is the point. With only the secret set, the page would have no
 * site key, would send no token, and every order would be refused: a checkout
 * broken by half a configuration. Tying enforcement to the pair makes that
 * state impossible.
 */

const VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileEnabled(env) {
  return !!(env && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET);
}

export function turnstileSiteKey(env) {
  return turnstileEnabled(env) ? env.TURNSTILE_SITE_KEY : null;
}

/* Returns true when the request may proceed. Only call when enabled. */
export async function verifyTurnstile(env, token, ip) {
  if (!token || typeof token !== 'string' || token.length > 4096) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip && ip !== 'unknown') form.append('remoteip', ip);
  try {
    const res = await fetch(VERIFY, { method: 'POST', body: form });
    const out = await res.json();
    return out && out.success === true;
  } catch (_) {
    /* If Cloudflare's own verifier is unreachable, refuse. Unlike the rate
       limiter, this is a check the owner switched on deliberately, so failing
       open would silently switch it back off. */
    return false;
  }
}
