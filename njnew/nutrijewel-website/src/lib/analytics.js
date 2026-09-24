/*
 * Analytics and consent, in one place.
 *
 * Nothing here runs until the visitor accepts analytics in the consent banner,
 * which is what India's DPDP Act expects for tracking. Declining is honoured
 * completely: no Google Analytics script is loaded, no first-party visit is
 * recorded, and the visit cookie is deleted.
 *
 * Two destinations, both gated on the same consent:
 *   1. Google Analytics 4, for the owner's GA dashboard and ecommerce funnel.
 *   2. The site's own /api/track, which feeds the admin dashboard's graphs.
 *
 * Essential things (the cart, the admin sign-in) do not depend on consent and
 * do not go through this file.
 */

const GA_ID = 'G-DH75XWLB6H'; // the only place the Measurement ID lives now
const CONSENT_KEY = 'nj_consent';
const SID_COOKIE = 'nj_sid';
const VISIT_SECONDS = 30 * 60; // a "visit" ends after 30 minutes of inactivity

// Only the real site is measured. Preview deployments on *.pages.dev share the
// production database, so counting them would pollute the owner's real figures.
const MEASURED_HOSTS = ['nutrijewel.com', 'www.nutrijewel.com', 'localhost', '127.0.0.1'];
const GA_HOSTS = ['nutrijewel.com', 'www.nutrijewel.com'];

const hasWindow = typeof window !== 'undefined';
const listeners = new Set();
let gaLoaded = false;

const host = () => (hasWindow ? window.location.hostname : '');
const measured = () => MEASURED_HOSTS.includes(host());
const isAdminPath = (p) => String(p || '').startsWith('/admin');

/* ---------- consent ---------- */

export function getConsent() {
  try { return window.localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
}

export function onConsentChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setConsent(value) {
  const v = value === 'granted' ? 'granted' : 'denied';
  try { window.localStorage.setItem(CONSENT_KEY, v); } catch (_) { /* private mode */ }
  if (v === 'granted') {
    startGa();
  } else {
    clearSid();
    if (hasWindow && window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }
  listeners.forEach((fn) => fn(v));
}

const granted = () => getConsent() === 'granted';

/* ---------- the visit cookie ---------- */

function randomSid() {
  const b = new Uint8Array(16);
  (window.crypto || window.msCrypto).getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/* A first-party session cookie. Random, linked to no person, and it expires after
   30 minutes without activity, so it counts visits rather than following anyone.
   Refreshed on every hit, which is what makes those 30 minutes a rolling window. */
function sid() {
  const m = document.cookie.match(/(?:^|;\s*)nj_sid=([a-f0-9]{24,40})/);
  const id = m ? m[1] : randomSid();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SID_COOKIE}=${id}; Max-Age=${VISIT_SECONDS}; Path=/; SameSite=Lax${secure}`;
  return id;
}

function clearSid() {
  if (hasWindow) document.cookie = `${SID_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/* ---------- Google Analytics 4 ---------- */

function startGa() {
  if (!hasWindow || gaLoaded || !GA_HOSTS.includes(host())) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  // Page views are sent by hand on each route change, since this is a single-page app.
  window.gtag('config', GA_ID, { send_page_view: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

function ga(...args) {
  if (granted() && gaLoaded && window.gtag) window.gtag(...args);
}

/* ---------- first-party beacon ---------- */

function beacon(payload) {
  if (!granted() || !measured()) return;
  const body = JSON.stringify({ ...payload, sid: sid() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch (_) { /* fall through to fetch */ }
  fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
    .catch(() => {});
}

/* ---------- public API ---------- */

/* Resume a previous "yes" on the next visit, without asking again. */
export function initAnalytics() {
  if (granted()) startGa();
}

export function trackPageview(path) {
  if (isAdminPath(path)) return; // the owner's own admin visits are not traffic
  beacon({ type: 'pageview', path, ref: document.referrer || '' });
  ga('event', 'page_view', { page_path: path, page_location: window.location.href });
}

/* GA4 ecommerce item from a catalogue product. Prices in rupees, as GA expects. */
const gaItem = (product, variant, qty = 1) => ({
  item_id: product.id,
  item_name: product.displayName || product.name,
  item_category: product.category,
  item_variant: (variant && variant.weight) || product.weight,
  price: (variant && variant.price != null) ? variant.price : product.price,
  quantity: qty,
});

export function trackViewItem(product, variant) {
  if (!product) return;
  const item = gaItem(product, variant);
  ga('event', 'view_item', { currency: 'INR', value: item.price, items: [item] });
}

export function trackAddToCart(product, variant, qty = 1) {
  if (!product) return;
  const item = gaItem(product, variant, qty);
  beacon({ type: 'event', event: 'add_to_cart' });
  ga('event', 'add_to_cart', { currency: 'INR', value: item.price * qty, items: [item] });
}

export function trackBeginCheckout(lines, totalPaise) {
  beacon({ type: 'event', event: 'begin_checkout' });
  ga('event', 'begin_checkout', {
    currency: 'INR',
    value: (totalPaise || 0) / 100,
    items: (lines || []).map((l) => ({ item_id: l.productId, item_name: l.name, item_variant: l.weight, price: l.unitPaise / 100, quantity: l.qty })),
  });
}

/* Amounts come from the server's quote, never recomputed in the browser. */
export function trackPurchase({ orderNumber, amountPaise, shippingPaise, lines }) {
  beacon({ type: 'event', event: 'purchase' });
  ga('event', 'purchase', {
    transaction_id: orderNumber,
    currency: 'INR',
    value: (amountPaise || 0) / 100,
    shipping: (shippingPaise || 0) / 100,
    items: (lines || []).map((l) => ({ item_id: l.productId, item_name: l.name, item_variant: l.weight, price: l.unitPaise / 100, quantity: l.qty })),
  });
}
