import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getConsent, setConsent, onConsentChange } from '../lib/analytics';
import './ConsentBanner.css';

/*
 * Consent for Google Analytics, as India's DPDP Act expects.
 *
 * Rules this is held to, because they are where banners usually go wrong:
 *   - Declining is exactly as easy as accepting: same size, side by side. A tiny
 *     grey "decline" beside a big green "accept" is not freely given consent.
 *   - It never blocks buying. It is not shown on /checkout, where it could cover
 *     the Pay button, nor on /admin.
 *   - It never covers the homepage hero, the first thing anyone sees. There it
 *     waits until the hero has scrolled clear of the bottom of the screen.
 *
 * Google Analytics (the only thing that sets tracking cookies) does not load
 * until "Accept". The site's own visit counter runs either way because it uses
 * no cookies and records nothing personal (see src/lib/analytics.js). The banner
 * itself is one short line; the privacy policy it links to names Google
 * Analytics and explains both.
 */

const HIDDEN_ON = ['/checkout', '/admin'];
const HERO = '.hero-section';

/* True while the homepage hero reaches into the bottom 30% of the screen, which
   is where the banner docks. Waits for the hero to render, and gives up (showing
   the banner) rather than hiding consent for good if it never appears. */
function useHeroCoversDock(active) {
  const [covers, setCovers] = useState(active);
  useEffect(() => {
    if (!active) { setCovers(false); return undefined; }
    setCovers(true);
    let io;
    let timer;
    let tries = 0;
    const attach = () => {
      const hero = document.querySelector(HERO);
      if (!hero) {
        if (tries < 20) { tries += 1; timer = setTimeout(attach, 250); } else setCovers(false);
        return;
      }
      if (typeof IntersectionObserver === 'undefined') { setCovers(false); return; }
      io = new IntersectionObserver(([e]) => setCovers(e.isIntersecting), { rootMargin: '-70% 0px 0px 0px' });
      io.observe(hero);
    };
    attach();
    return () => { clearTimeout(timer); if (io) io.disconnect(); };
  }, [active]);
  return covers;
}

export default function ConsentBanner() {
  const { pathname } = useLocation();
  const [choice, setChoice] = useState(() => getConsent());
  const ref = useRef(null);
  const heroCovers = useHeroCoversDock(pathname === '/' && choice == null);

  useEffect(() => onConsentChange(setChoice), []);

  // "Cookie settings" in the footer reopens this by clearing the stored answer.
  useEffect(() => {
    const reopen = () => setChoice(null);
    window.addEventListener('nj:consent-reopen', reopen);
    return () => window.removeEventListener('nj:consent-reopen', reopen);
  }, []);

  const visible = choice == null && !heroCovers && !HIDDEN_ON.some((p) => pathname.startsWith(p));

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
      {/* Kept to one short line on purpose (owner's call). What the cookies are
          and who sets them is spelled out on the privacy policy it links to. */}
      <p className="njcb-text">
        We use cookies to make the shop better. <a href="/privacy-policy">Learn more</a>
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
