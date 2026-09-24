/*
 * Analytics and consent, in one place. Two destinations, held to different rules
 * because they are different things:
 *
 *   1. The site's own /api/track, which feeds the admin dashboard. Runs for every
 *      visitor, with no consent needed, because it collects nothing personal: no
 *      cookie, no identifier, no IP, nothing that links one page view to another.
 *      It counts visits the way Cloudflare Web Analytics does.
 *   2. Google Analytics 4, which sets cookies and sends data to Google. Nothing
 *      of it loads until the visitor taps Accept, which is what India's DPDP Act
 *      expects. Declining is honoured completely.
 *
 * Essential things (the cart, the admin sign-in) do not go through this file.
 */

const GA_ID = 'G-DH75XWLB6H'; // the only place the Measurement ID lives now
const CONSENT_KEY = 'nj_consent';
const OLD_SID_COOKIE = 'nj_sid'; // set by the earlier, consent-based counter; now only ever deleted

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
    if (hasWindow && window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }
  listeners.forEach((fn) => fn(v));
}

const granted = () => getConsent() === 'granted';

/* ---------- what makes a visit ---------- */

/* The first page of a page load is the start of a visit, unless the visitor came
   from one of this site's own pages (a link opened in a new tab, say). Every page
   after it, in this single-page app, is a page view within the same visit. The
   server checks the referrer again rather than trusting this. */
let firstPageOfLoad = true;

/* The shopping steps count once per page load, so a visitor tapping Add to Cart
   five times is still one visit that added to cart. */
const sentThisLoad = new Set();

function clearOldSid() {
  if (hasWindow) document.cookie = `${OLD_SID_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
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

/* No consent check here, on purpose: see the top of this file. Nothing sent
   identifies anyone. */
function beacon(payload) {
  if (!hasWindow || !measured()) return;
  const body = JSON.stringify(payload);
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
  clearOldSid();
  if (granted()) startGa();
}

function stepOncePerLoad(event) {
  if (sentThisLoad.has(event)) return;
  sentThisLoad.add(event);
  beacon({ type: 'event', event });
}

export function trackPageview(path) {
  if (isAdminPath(path)) return; // the owner's own admin visits are not traffic
  const entry = firstPageOfLoad;
  firstPageOfLoad = false;
  // Only the first page carries the referrer: after an in-app navigation,
  // document.referrer still names wherever the visit began.
  beacon({ type: 'pageview', path, entry, ref: entry ? (document.referrer || '') : '' });
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
  stepOncePerLoad('add_to_cart');
  ga('event', 'add_to_cart', { currency: 'INR', value: item.price * qty, items: [item] });
}

export function trackBeginCheckout(lines, totalPaise) {
  stepOncePerLoad('begin_checkout');
  ga('event', 'begin_checkout', {
    currency: 'INR',
    value: (totalPaise || 0) / 100,
    items: (lines || []).map((l) => ({ item_id: l.productId, item_name: l.name, item_variant: l.weight, price: l.unitPaise / 100, quantity: l.qty })),
  });
}

/* Amounts come from the server's quote, never recomputed in the browser. */
/* Only to GA. The dashboard's paid orders come from the orders table itself,
   which is exact and covers everyone. */
export function trackPurchase({ orderNumber, amountPaise, shippingPaise, lines }) {
  ga('event', 'purchase', {
    transaction_id: orderNumber,
    currency: 'INR',
    value: (amountPaise || 0) / 100,
    shipping: (shippingPaise || 0) / 100,
    items: (lines || []).map((l) => ({ item_id: l.productId, item_name: l.name, item_variant: l.weight, price: l.unitPaise / 100, quantity: l.qty })),
  });
}
