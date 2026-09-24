import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getConsent, setConsent, onConsentChange } from '../lib/analytics';
import './ConsentBanner.css';

/*
 * Analytics consent, as India's DPDP Act expects.
 *
 * Two rules this is held to, because they are where banners usually go wrong:
 *   - Declining is exactly as easy as accepting: same size, side by side. A tiny
 *     grey "decline" beside a big green "accept" is not freely given consent.
 *   - It never blocks buying. It is not shown on /checkout, where it could cover
 *     the Pay button, nor on /admin.
 *
 * Nothing is tracked until "Accept". The cart and admin sign-in are essential
 * and work either way.
 */

const HIDDEN_ON = ['/checkout', '/admin'];

export default function ConsentBanner() {
  const { pathname } = useLocation();
  const [choice, setChoice] = useState(() => getConsent());
  const ref = useRef(null);

  useEffect(() => onConsentChange(setChoice), []);

  // "Cookie settings" in the footer reopens this by clearing the stored answer.
  useEffect(() => {
    const reopen = () => setChoice(null);
    window.addEventListener('nj:consent-reopen', reopen);
    return () => window.removeEventListener('nj:consent-reopen', reopen);
  }, []);

  const visible = choice == null && !HIDDEN_ON.some((p) => pathname.startsWith(p));

  /* Lift the back-to-top button above the banner by exactly the banner's height,
     using the --nj-dock-h hook ScrollToTop already reads. */
  useLayoutEffect(() => {
    const body = document.body;
    if (!visible || !ref.current) { body.style.removeProperty('--nj-dock-h'); return undefined; }
    const set = () => body.style.setProperty('--nj-dock-h', `${ref.current.offsetHeight}px`);
    set();
    let ro;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(set); ro.observe(ref.current); }
    return () => { if (ro) ro.disconnect(); body.style.removeProperty('--nj-dock-h'); };
  }, [visible]);

  if (!visible) return null;

  return (
    <section ref={ref} className="njcb" role="dialog" aria-live="polite" aria-label="Cookie choice">
      <p className="njcb-text">
        We use cookies to see which pages people visit, so we can make the shop better.
        Your cart works either way. <a href="/privacy-policy">Privacy policy</a>
      </p>
      <div className="njcb-actions">
        <button type="button" className="njcb-btn" onClick={() => setConsent('denied')}>Decline</button>
        <button type="button" className="njcb-btn" onClick={() => setConsent('granted')}>Accept</button>
      </div>
    </section>
  );
}

/* For the footer's "Cookie settings" link. */
export function reopenConsent() {
  try { window.localStorage.removeItem('nj_consent'); } catch (_) { /* ignore */ }
  window.dispatchEvent(new Event('nj:consent-reopen'));
}
