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
cannot be written even by buggy code. Schema lives in `migrations/0001_init.sql`.

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

Both live in `public/` so CRA copies them into `build/` verbatim.

- **`public/_redirects`** contains `/*  /index.html  200`. This is the SPA
  fallback. Pages serves a real file when one exists, so the per-product pages
  written by `scripts/create-static-routes.js` are still served as themselves
  with their own title, canonical and Product JSON-LD. Only paths with no file
  fall through to React. Verified: `/products/granola/` and
  `/products/rustic-ragi-bread/` return different byte counts from `/`, so they
  are the prerendered files and not the fallback.
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

Pages Functions live in `functions/`, deployed with the site by the same
`wrangler pages deploy`. Live now:

| Endpoint | Method | Job |
|---|---|---|
| `/api/serviceability` | GET | pincode to zone, rate and delivery window |
| `/api/checkout/quote` | POST | cart to authoritative totals |

Both import `src/utils/serverPricing.js`. That file is CommonJS and the Functions
runtime imports it cleanly, which was the main technical risk in this design:
it means the shop, the prerender script and the API all price from one file
instead of three implementations that drift.

**The client never sends a price.** It sends `{productId, weight, qty}` and the
server recomputes. Verified in production: the same cart with `unitPrice: 1`
injected returns the same total as the honest one.

## Still to do

- Payment endpoints: create-order, verify, and the Razorpay webhook
- `/checkout` page and `/orders/track`
- Admin dashboard behind Cloudflare Access
- Razorpay keys as Cloudflare encrypted environment variables, never in
  `REACT_APP_*`, because CRA inlines those into the public bundle
