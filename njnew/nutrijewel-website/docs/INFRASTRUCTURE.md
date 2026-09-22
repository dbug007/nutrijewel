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

The D1 database is created but **empty and unused**. It exists for the orders
work; no schema has been applied and nothing reads or writes it yet.

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

## DNS: not migrated, and why

As of 2026-09-23 the domain is in a **split state**:

| Record | Value | Meaning |
|---|---|---|
| NS | `ns1.dns-parking.com`, `ns2.dns-parking.com` | Hostinger is authoritative, not Cloudflare |
| A (apex) | `185.199.108-111.153` | GitHub Pages is still serving nutrijewel.com |
| www | a `2606:4700:…` address | already resolving through Cloudflare |
| MX | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) | **email is on Hostinger** |
| TXT | `v=spf1 include:_spf.mail.hostinger.com ~all` | SPF for that email |

**The live site is still served by GitHub Pages.** Cloudflare Pages is deployed
and working, but nothing points at it yet.

### The email trap

Moving nameservers to Cloudflare moves **all** DNS for the domain, not just the
website. If the MX and SPF records above are not recreated in Cloudflare before
the nameservers change, `hello@nutrijewel.com` stops receiving mail, and the
failure is silent: senders get bounces you never see.

### Cutover runbook

Do these in order. Steps 1 and 2 are at Cloudflare, step 3 is at the registrar.

1. In the Cloudflare dashboard, open the `nutrijewel.com` zone and confirm every
   record above exists there, especially both MX records and the SPF TXT. Add
   anything missing. Changing nothing yet is safe: Cloudflare is not
   authoritative until step 3.
2. Add `nutrijewel.com` and `www.nutrijewel.com` as custom domains on the
   `nutrijewel` Pages project. Cloudflare creates the records and issues a
   certificate.
3. At **Hostinger**, where the domain is registered, replace the nameservers with
   the two Cloudflare gave you. This is the only irreversible-feeling step and
   the only one with downtime risk. Propagation is usually minutes, worst case
   24 to 48 hours.
4. Verify: `nutrijewel.com` loads from Pages, `www` redirects to it, and **send a
   test email to `hello@nutrijewel.com` and confirm it arrives**.
5. Only once all of that is confirmed, retire the `gh-pages` branch.

Rollback at any point before step 5 is to put the Hostinger nameservers back.

## Deploying

See `deploy.ps1` and the Commands section of `CLAUDE.md`.

## Still to do

- Apply a schema to `nutrijewel-orders`; it is empty
- Pages Functions under `functions/api/` for checkout, none exist yet
- Razorpay keys as Cloudflare encrypted environment variables, never in
  `REACT_APP_*`, because CRA inlines those into the public bundle
