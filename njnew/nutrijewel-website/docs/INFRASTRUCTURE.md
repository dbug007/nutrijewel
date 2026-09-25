# NutriJewel infrastructure

What runs where, what was changed on 2026-09-23, and how to finish the move.
Written for whoever maintains this next, including future me.

## Cloudflare account

**The account holds other brands' domains.** Only ever create or change things
named `nutrijewel*`, always pass the scope explicitly (`--project-name
nutrijewel`), and never run an unscoped delete or bulk operation. Wrangler
defaults to the account, not to a project.

| | |
|---|---|
| Account | `deepakpoddarhost@gmail.com` |
| Account ID | `e432df2cac34cbe1ba1500ebb22bdd06` |
| Auth | wrangler OAuth, already logged in on this machine |

Check with `npx wrangler whoami`. If it ever says logged out, run
`npx wrangler login` in a normal terminal, since it opens a browser.

## Resources created for NutriJewel

| Resource | Name | Identifier |
|---|---|---|
| Pages project | `nutrijewel` | serves `https://nutrijewel.pages.dev` |
| D1 database | `nutrijewel-orders` | `40fa6476-cc41-4d5f-b264-8cbeb420e80b` (region APAC) |

Nothing else in the account was touched.

The D1 database has its schema applied: `orders`, `order_items`, `webhook_events`
and `order_events`. Money columns are INTEGER paise, and `orders` carries a CHECK
constraint that `total_paise = items_paise + shipping_paise`, so a wrong total
cannot be written even by buggy code. Schema lives in `migrations/0001_init.sql`
and the numbered files after it (0005 adds `orders.fulfilment`, pickup or
delivery). A Porter/Rapido or courier fare is outside `total_paise` by design:
it never passes through Razorpay, so the constraint holds but the total is not
the full delivered cost for those orders.

Apply or re-apply it with:

```powershell
npx wrangler d1 execute nutrijewel-orders --remote --file migrations/0001_init.sql
```

## Hosting

The site is a Create React App build published to Cloudflare Pages by **direct
upload** from this machine, not by a git integration. That was deliberate:
connecting a git repo needs a GitHub OAuth grant that can only be done in the
dashboard, and direct upload keeps the existing "build locally, then publish"
shape of `deploy.ps1`.

```powershell
npm run build
npx wrangler pages deploy build --project-name nutrijewel --branch main
```

Every deployment gets a permanent unique URL (for example
`https://28ca45d3.nutrijewel.pages.dev`), which is the staging preview that the
old `nutrijewel-test` branch could never provide.

### Config files

It lives in `public/` so CRA copies it into `build/` verbatim.

- **No `_redirects` file, on purpose.** Pages treats a project with no
  top-level `404.html` as a single-page app and serves `index.html` for unmatched
  paths automatically. A `/* /index.html 200` rule used to live here; wrangler
  flags it as an infinite loop and ignores it, so it never did anything and was
  removed. Pages still serves a real file first, so the per-product pages from
  `scripts/create-static-routes.js` keep their own title, canonical and Product
  JSON-LD. Verified: `/products/granola/` and `/products/rustic-ragi-bread/`
  return different byte counts from `/`. **Never add a `404.html` to `public/`**,
  or the SPA fallback turns off and every deep link 404s.
- **`public/_headers`** sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` and a Content Security Policy, plus
  cache lifetimes: one year immutable for `/static/*` (hashed filenames), one day
  with stale-while-revalidate for `/images/*` and `/reels/*`.

### The CSP compromise

`script-src` includes `'unsafe-inline'`. This is not laziness. `public/index.html`
carries three inline blocks: the GA4 bootstrap, the Organization JSON-LD, and
until recently the SPA decoder. CRA provides no nonce mechanism. Removing
`'unsafe-inline'` means moving those to real files first. `style-src` needs it
too, because Framer Motion writes inline styles on every animated element.

`checkout.razorpay.com` and `api.razorpay.com` are already allowed so the policy
does not need editing when payments land.

## What was removed in the migration

- `public/404.html`, the GitHub Pages SPA redirect encoder
- The matching decoder script block in `public/index.html`
- `public/CNAME`, which is how GitHub Pages learned the custom domain.
  Cloudflare takes the domain from its own dashboard instead.

## DNS

Cloudflare is **already authoritative** for nutrijewel.com. The `.com` delegation
points to `lila.ns.cloudflare.com` and `tosana.ns.cloudflare.com`, the zone is
active, and the MX and SPF records for Hostinger email are already served from
there.

An earlier version of this file claimed the nameservers were still Hostinger's
and that a migration risked breaking email. That came from a stale local DNS
cache and was wrong. There is no nameserver change to make.

`nutrijewel.com` answers with `server: cloudflare` but without our
Content-Security-Policy header, so it is still proxying to the old GitHub Pages
origin rather than serving the Pages project.

**One step remains**, in the dashboard, because the wrangler token here has
`zone (read)` and no write: add `nutrijewel.com` and `www.nutrijewel.com` as
custom domains on the `nutrijewel` Pages project. The full walkthrough and the
verification are in [HOW-THIS-SITE-RUNS.md](HOW-THIS-SITE-RUNS.md).

## Deploying

See `deploy.ps1` and the Commands section of `CLAUDE.md`.

## API

Pages Functions in `functions/`, deployed with the site by `wrangler pages deploy`.

| Endpoint | Method | Guarded by | Job |
|---|---|---|---|
| `/api/serviceability` | GET | none | pincode to delivery method: a fixed fee, or a Porter/Rapido or courier fare confirmed on WhatsApp. No free threshold, no invented delivery window |
| `/api/checkout/quote` | POST | none | cart plus `fulfilment` (pickup or delivery) and pincode to authoritative totals; the delivery line says Free only for pickup |
| `/api/checkout/create-order` | POST | rate limit, Turnstile* | reprice, create Razorpay order, write D1 row |
| `/api/checkout/verify` | POST | Razorpay signature | browser reports a payment |
| `/api/webhooks/razorpay` | POST | webhook signature | Razorpay reports a payment, authoritative |
| `/api/orders/track` | POST | rate limit, phone match | customer order status |
| `/api/admin/orders` | GET, POST | token, Access* | list orders, move status |
| `/api/admin/stats` | GET | token, Access* | counts, revenue, alerts |
| `/api/admin/refund` | POST | token, Access* | full refund through Razorpay |
| `/api/admin/sweep` | POST | token, Access* | mark stale unpaid orders failed |

\* only once configured, see below.

**The client never sends a price.** It sends `{productId, weight, qty}` and
`src/utils/serverPricing.js` reprices. Verified in production: a cart with
`unitPrice: 1` injected is charged in full.

## Security layers, and what each was proven to do

Each of these was tested for real, not mocked. Where a claim could be falsified
it was: the code was sabotaged and the test confirmed it went red.

| Layer | Proven |
|---|---|
| Server pricing | tampered prices ignored, off-season and zero-priced items refused |
| Payment signature | genuine accepted; one changed character, forged, and empty all refused |
| Refunds | refunded via Razorpay's real API; a second refund refused by us **and** by Razorpay when our check is bypassed |
| Rate limit | exactly 20 tracking lookups allowed, 429 from the 21st with `Retry-After`; fails open when its table is missing |
| Turnstile | enforced only when both keys are set; half-configured cannot break checkout |
| Access JWT | 11 of 11 cases correct, including `alg: none`, HS256 confusion, and edited claims; removing the algorithm check lets HS256 confusion through |

## Switching on the two optional layers

Both are free and both stay off until configured. Neither can break checkout or
the admin by being half set up.

### Turnstile (bot check on checkout)

1. Cloudflare dashboard, **Turnstile**, add a widget for `nutrijewel.com`.
2. Set both as secrets, then redeploy:
   ```powershell
   npx wrangler pages secret put TURNSTILE_SITE_KEY --project-name nutrijewel
   npx wrangler pages secret put TURNSTILE_SECRET --project-name nutrijewel
   ```
It only enforces when **both** exist. The page learns the site key from the
server, so no rebuild is needed beyond the redeploy.

### Google sign in for the admin

Built into the admin directly, so there is no Cloudflare Zero Trust to set up.
`SESSION_SECRET` is **already set** on Cloudflare. Two values are left, and both
come from you:

1. **Create a Google OAuth client.** Google Cloud Console, APIs & Services,
   Credentials, Create credentials, OAuth client ID, type **Web application**.
   Under **Authorised JavaScript origins** add `https://nutrijewel.com` and
   `https://www.nutrijewel.com`. No redirect URI is needed. Copy the Client ID,
   which looks like `1234-abc.apps.googleusercontent.com`. It is public.
2. **Set both, then redeploy:**
   ```powershell
   npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name nutrijewel
   npx wrangler pages secret put ADMIN_EMAILS --project-name nutrijewel   # your Gmail; comma-separate several
   ```
From then on `/admin` shows a Google button, and **the old token stops working**:
Google replaces it, so it cannot be used to get round Google's two-step
verification. Removing an email from `ADMIN_EMAILS` locks that person out at
once, even mid-session.

**Break glass:** if Google ever locks you out, delete the `GOOGLE_CLIENT_ID`
secret and redeploy. The admin falls back to the token in `deepak-instructions/ADMIN-TOKEN.txt`.

Proven with real keys and a real server: 12 of 12 Google token cases (unverified
email, a token issued to another app, a look-alike issuer and a look-alike
allowlist entry all refused), 11 of 11 session forgeries refused, the old token
refused in Google mode, and an admin action from another site refused with 403.

Cloudflare Access (the JWT check in `functions/_shared/access.js`) remains
available as an optional extra layer on top; it is no longer needed for Google
sign in.

## Analytics and consent

| Piece | Where | What it does |
|---|---|---|
| Consent banner | `src/components/ConsentBanner.js` | asks about **GA4 only**. Accept and Decline, same size. Hidden on `/checkout` and `/admin`; on the homepage it waits until the hero has scrolled away |
| GA4 | `src/lib/analytics.js` | loads **only after Accept**, only on nutrijewel.com |
| Own visit counter | `/api/track`, tables `hits`, `hit_events` (migration 0004) | visits, page views, pages, sources, countries, devices, funnel. **Every visitor, no cookies, no consent needed** |
| Dashboard | `/admin`, Dashboard tab | sales and visitor graphs, India time |

The counter needs no consent because nothing it keeps is personal data: no
cookie, no session id, no IP address, no user-agent string, no name, phone or
email, no query strings, no full referrer URLs. Rows cannot be linked to each
other, let alone to a person. A visit is a page load that arrived from outside
the site (the Cloudflare Web Analytics definition), so the figures are visits,
not unique people. Rows older than about 13 months are deleted.

Rate limiting stores a keyed hash of the IP (secret `RATE_LIMIT_SECRET`), never
the IP itself, and deletes it within a day.

Declining sends **zero** requests to Google (verified in a real browser). The
tables from migration 0003 (`page_views`, `analytics_events`) belonged to the
earlier consent-only counter, which saw so few visitors that the dashboard was
nearly empty. They are no longer written and were left in place, not dropped.

## Still to do

- **Register the Razorpay webhook** (Live mode): URL
  `https://nutrijewel.com/api/webhooks/razorpay`, secret from
  `deepak-instructions/WEBHOOK-SECRET.txt`, events `payment.captured`, `payment.failed`,
  `order.paid`. The endpoint and secret are live; only the registration is missing.
- Delivery outside Pune: the owner has not decided. Currently courier at actual
  cost, confirmed on WhatsApp; one switch (`OUTSIDE_PUNE` in
  `src/data/shippingZones.js`) turns it off. The Pune rules are the owner's and
  live: free pickup at Lodha Belmondo, ₹66 to 412101, ₹149 to 411014 and
  411005, the Porter/Rapido fare elsewhere in Pune.
- Partial refunds. Only full refunds exist today.
