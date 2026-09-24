import { useEffect, useRef } from 'react';

/*
 * The "Sign in with Google" button, from Google Identity Services.
 *
 * Google renders the button and runs the sign-in; this component only hands the
 * resulting ID token (a JWT Google signed) to onCredential. The server checks
 * that signature, the audience, email_verified and the owner allowlist before
 * issuing a session. Nothing in the browser is trusted to decide who is allowed.
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client';

function loadGis() {
  if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let s = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (!s) { s = document.createElement('script'); s.src = GIS_SRC; s.async = true; document.head.appendChild(s); }
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('Could not load Google sign in.')));
  });
}

export default function GoogleSignIn({ clientId, onCredential, onError }) {
  const box = useRef(null);
  useEffect(() => {
    let cancelled = false;
    loadGis().then(() => {
      if (cancelled || !box.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => onCredential(resp.credential),
        auto_select: false,          // never sign in silently; the owner chooses
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });
      window.google.accounts.id.renderButton(box.current, {
        theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill',
        width: Math.min(320, box.current.offsetWidth || 320),
      });
    }).catch((e) => onError && onError(e.message));
    return () => { cancelled = true; };
  }, [clientId, onCredential, onError]);
  return <div ref={box} className="njad-google" />;
}

export function googleSignOut() {
  try { if (window.google && window.google.accounts) window.google.accounts.id.disableAutoSelect(); } catch (_) { /* ignore */ }
}
