# How this site runs

Start here. Plain answers to the questions that keep coming up, then links to the
detail. Last updated 2026-09-23.

- [Where the code lives](#where-the-code-lives)
- [Where we are right now](#where-we-are-right-now)
- [DNS: what actually needs to change](#dns-what-actually-needs-to-change)
- [Razorpay KYC and the website audit](#razorpay-kyc-and-the-website-audit)
- [How an order will work](#how-an-order-will-work)
- [Where you get notified](#where-you-get-notified)

---

## Where the code lives

**Still GitHub. Nothing moved.**

`https://github.com/dbug007/nutrijewel.git`, branch `main`. That has not changed
and is not going to.

What changed is **hosting**, which is a different thing from where the code
lives:

| | Before | Now |
|---|---|---|
| Code | GitHub `main` | GitHub `main`, unchanged |
| Built site | GitHub Pages (`gh-pages` branch) | Cloudflare Pages, and still `gh-pages` |
| What the public sees | nutrijewel.com from GitHub Pages | **still GitHub Pages** |

Cloudflare Pages is running at `https://nutrijewel.pages.dev` as a second copy.
Cloudflare already runs your DNS, and `nutrijewel.com` is already proxied through
Cloudflare, but its origin is still the old GitHub Pages build. Switching it to
the Pages project is one action in the dashboard. Both exist at once on purpose,
so the switch is a decision rather than an accident.

---

## Where we are right now

| Phase | State |
|---|---|
| 0. Security and payload cleanup | **done** |
| 1. Cloudflare Pages hosting | **done**. One dashboard click left to point the domain at it |
| 2. Checkout, pricing, database | **in progress** |
| 3. Live payments and order tracking | not started, blocked on Razorpay KYC |
| 4. Admin dashboard | not started |

Done so far:

- `.env` removed from git. It was tracked in a public repo, which is how a
  payment key ends up published.
- Source maps no longer shipped to production.
- Images cut from **183MB to 18MB**, nothing deleted (originals in `.claude/originals/`).
- Fixed a bug where every product gallery showed the same photo twice.
- Cloudflare Pages project `nutrijewel` live, with SPA routing and six security
  headers.
- D1 database `nutrijewel-orders` created, schema applied, 4 tables.
- **Server-side repricing written and tested**, 36 tests. This is the one that
  stops a customer editing the price in their browser and paying ₹1.

Not done: the checkout page, the payment endpoints, the tracking page, the admin.

### Which docs to read

| Doc | What it covers |
|---|---|
| **this file** | the overview, and the answers to your questions |
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | Cloudflare account, resources, config files |
| [../CLAUDE.md](../CLAUDE.md) | working rules for the repo, commands, traps |
| `.claude/plans/` | the approved plan for this whole project |

---

## DNS: what actually needs to change

**Correction, 2026-09-23.** An earlier version of this doc said the nameservers
were still Hostinger's and that moving them risked breaking your email. That was
wrong: the first lookup hit a stale local DNS cache. The authoritative answer,
checked against the `.com` delegation and against Cloudflare's own nameserver, is
below. Nothing in the old runbook needs doing.

### Where things actually stand

**Cloudflare is already your nameserver.** The `.com` delegation points to
`lila.ns.cloudflare.com` and `tosana.ns.cloudflare.com`, and the zone is active.

| Record | Value | State |
|---|---|---|
| NS | `lila` / `tosana.ns.cloudflare.com` | **already Cloudflare** |
| A (apex) | `104.21.64.212`, `172.67.187.224` | Cloudflare proxy IPs, origin is GitHub Pages |
| MX | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) | **already in Cloudflare** |
| TXT | `v=spf1 include:_spf.mail.hostinger.com ~all` | **already in Cloudflare** |

**Your email is not at risk.** The MX and SPF records are already served by
Cloudflare, which is exactly what the old runbook was trying to achieve. There is
nothing to copy across and no nameserver change to make at Hostinger.

`nutrijewel.com` and `www.nutrijewel.com` both answer with `server: cloudflare`
and a CF-Ray header, but neither carries our Content-Security-Policy, which
proves they are still being proxied through to the old GitHub Pages build rather
than served from the Pages project.

### Broken right now: DKIM is proxied

Found 2026-09-23 from the exported zone file. Five mail records are flagged
`cf-proxied:true` (the orange cloud), and three of them must not be.

| Record | Should be |
|---|---|
| `hostingermail-a._domainkey` | **DNS only** |
| `hostingermail-b._domainkey` | **DNS only** |
| `hostingermail-c._domainkey` | **DNS only** |
| `autoconfig` | **DNS only** |
| `autodiscover` | **DNS only** |

A proxied CNAME makes Cloudflare answer with its own IP addresses instead of
resolving the target. That is the whole point of the orange cloud for web
traffic, and it is wrong for mail records.

Verified: `hostingermail-a._domainkey.nutrijewel.com` currently resolves to
`104.21.64.212` and `172.67.187.224`, which are Cloudflare proxy IPs. The record
it is supposed to reach, `hostingermail-a.dkim.mail.hostinger.com`, holds
`v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...`.

**Consequence:** every email sent from `@nutrijewel.com` fails DKIM verification,
because receiving servers cannot fetch the public key. Combined with the SPF
record's `~all` softfail, that pushes mail towards spam folders. This has nothing
to do with the payments work and is worth fixing today.

`autoconfig` and `autodiscover` being proxied breaks automatic mailbox setup in
Outlook and Apple Mail for the same reason.

**Fix:** Cloudflare dashboard → **nutrijewel.com** → **DNS** → **Records**. For
each of the five, click the orange cloud so it turns grey and reads **DNS only**.
Save. Nothing else changes; the records keep their values.

Afterwards, send an email to a Gmail address, open it, choose "Show original" and
confirm `DKIM: PASS`.

> Rule of thumb: only records that serve web traffic on ports 80 and 443 should be
> proxied. Mail records (MX, DKIM, SPF, DMARC, autoconfig, autodiscover) are
> always DNS only. MX records cannot be proxied at all, which is why those two are
> already correct.

### The only step left

One action, in the dashboard, because the API token here has `zone (read)` but not
write, so this cannot be automated from the repo.

1. Cloudflare dashboard → **Workers & Pages** → the **nutrijewel** project →
   **Custom domains**.
2. **Set up a custom domain**, enter `nutrijewel.com`, activate.
3. Repeat for `www.nutrijewel.com`.

Cloudflare updates the apex record to point at the Pages project and issues the
certificate. Because Cloudflare already runs the DNS, this takes effect in
seconds, not hours.

### Verify

1. `https://nutrijewel.com` loads.
2. It carries a `Content-Security-Policy` header. That is the proof it is being
   served by the Pages project and not the old GitHub Pages origin, since that
   header only exists in `public/_headers`.
3. Send a test email to `hello@nutrijewel.com`. The MX records are untouched by
   this change, but confirm anyway.

### Rollback

The old GitHub Pages deployment is untouched on the `gh-pages` branch. Removing
the custom domain from the Pages project restores the previous record. Keep
`gh-pages` until the Pages version has run for a few days.

---

## Razorpay KYC and the website audit

Razorpay does review the live website before approving payments, and they do
reject sites. Here is what they look for and where you stand.

### You do not need a company, and you do not need a business PAN

NutriJewel is early and unregistered, and that is a normal way to start taking
payments in India. Razorpay's business types include **Individual** and **Sole
Proprietorship**, and both are onboarded on a **personal PAN**. There is no
requirement to register a company first.

Pick **Sole Proprietorship** if asked, since you trade under the name NutriJewel
and hold a licence in that name. **Individual** also works and is sometimes
quicker, but tends to carry lower transaction limits.

### Documents they will ask for

| Item | Status |
|---|---|
| **Personal PAN** | you have this. A business PAN is not needed |
| Bank account plus a cancelled cheque or statement | see the note below |
| Address proof (Aadhaar, utility bill, rent agreement) | personal address is fine |
| **FSSAI licence** (required for food) | **21524037004182**, already published on the site |
| GST certificate | **only if registered.** Not required below the turnover threshold |

**Your FSSAI licence is the strongest document you have.** It is government-issued
proof that a real, inspected food business exists, which is exactly the doubt an
underwriter is trying to resolve for a new unregistered merchant. It is already
published on the site and in the structured data, which helps.

**On the bank account:** Individual accounts can often settle to a personal
savings account. Proprietorship usually wants a current account in the business
name. If you only have a personal savings account today, start as Individual,
get live, and upgrade later. Do not delay the application over this.

**On GST:** not being registered is not a problem and is not a rejection reason.
GST registration is only compulsory above the turnover threshold. Answer honestly
that you are not registered. It also keeps invoices simpler: no tax line, no HSN
codes.

The name on the PAN, the bank account and the site's contact details should
agree. Mismatches are the most common rejection, and that is within your control.

**If Razorpay does decline an unregistered merchant**, Cashfree and Instamojo
both onboard individuals, and Instamojo in particular is aimed at small sellers.
The code does not care which gateway is used; only the payment endpoints would
change. Do not go looking for an alternative before trying Razorpay, though.

### What they check on the website

These must be live and reachable before you submit:

| Requirement | Status |
|---|---|
| Privacy Policy | **live** at `/privacy-policy` |
| Terms and Conditions | **live** at `/terms-and-conditions` |
| Refund and Cancellation Policy | **live** at `/refund-policy` |
| Shipping and Delivery Policy | **live** at `/shipping-policy` |
| Contact page with phone, email and address | **live** at `/contact` |
| Products with prices clearly shown in INR | **live** |
| Business name and FSSAI visible | **live** |
| A checkout that actually works | **not built yet** |

### Three things that will fail the audit today

These are the reason not to submit KYC before Phase 2 finishes.

1. **The site currently tells customers you do not take payment.** Three places
   say so in as many words, including "No payment is taken on the website" on
   every product page. An auditor reading that while approving you for online
   payments is a direct contradiction. These have to be rewritten first.
2. **There is no checkout.** Razorpay wants to see the flow a customer would
   actually use. Right now the button opens WhatsApp.
3. **The Shipping Policy promises a 7 day processing window and nationwide
   courier.** That has to match the delivery zones we set, or the policy is
   inaccurate, which is itself an audit problem. Confirm your real delivery areas
   and timelines and I will make the policy and the pricing agree.

### Recommended order

1. Create the Razorpay account and start KYC now, using **test mode** keys. KYC
   takes 2 to 7 working days and is the slowest part.
2. Meanwhile I finish the checkout and fix the three items above.
3. Submit the site for review once the checkout is live on a real URL.

---

## How an order will work

Once Phase 2 and 3 are done:

1. Customer fills the cart as they do now.
2. They open **/checkout** and enter name, phone, email, address and pincode.
3. The pincode is checked against the delivery zones. Unserviceable means no
   order, with an offer to message you on WhatsApp instead.
4. **The server recalculates every rupee** from the catalogue and ignores
   whatever the browser claims the prices are. An order row is written with
   status `created`.
5. Razorpay's payment window opens. Card, UPI, netbanking, wallets.
6. On success, two independent things happen:
   - the browser reports back, and the signature is verified
   - **Razorpay sends a webhook to the server**, which is what counts
7. The order flips to `paid`. Customer sees a confirmation with an order number
   like `NJ-2609-4F2A`.
8. You pack and ship it, moving the order through `confirmed`, `packed`,
   `shipped`, `delivered`.

The webhook matters because it is what saves you when a customer pays and then
closes the tab before the page can report back. Without it, that order is money
taken with nothing recorded. The database has a `webhook_events` table whose only
job is to make a repeated webhook harmless.

### Money handling

Every amount is stored in **paise as whole numbers**, never rupees as decimals.
The database refuses to store a row where the total does not equal items plus
shipping. That check is in the schema, not just in the code, so a future bug
cannot write a wrong total.

---

## Where you get notified

After a payment succeeds, four things happen without anyone doing anything:

| Channel | Who | Cost |
|---|---|---|
| Razorpay dashboard | you | free |
| Razorpay email and SMS receipt | the customer, automatically | free |
| Order row in the database | the system | free |
| Admin page listing new orders | you | free |

**The one to decide is how you get pinged in real time.** Options:

1. **Razorpay's own alerts.** Their mobile app pushes a notification on every
   payment, and they can email you. Zero build, zero cost, available immediately.
   Recommended to start.
2. **Email on each order**, branded and listing the items and address. Needs an
   email service; Resend's free tier covers 3,000 a month.
3. **WhatsApp message to you.** Sounds obvious and is not: it needs the WhatsApp
   Business API through a paid provider. Per-message cost, and approval. This is
   the expensive option, so it should be a deliberate choice.

My recommendation: start with option 1 since it costs nothing and exists today,
add option 2 when you want the order detail in your inbox, and only consider
option 3 if you are missing orders.

The admin page for moving orders through packed and shipped will sit behind
Cloudflare Access, free for up to 50 users, so only you can open it.

---

## What I need from you

1. **GST registration status.** Decides whether invoices show tax and whether
   products need HSN codes.
2. **Your real delivery areas, charges and timelines.** The current zones are
   placeholders: Pune ₹40, Maharashtra ₹80, rest of India ₹150. They are in
   `src/data/shippingZones.js` and marked as such.
3. **Razorpay account status.** Created? KYC submitted?
4. **How you want to be notified** of a new order, from the three options above.
