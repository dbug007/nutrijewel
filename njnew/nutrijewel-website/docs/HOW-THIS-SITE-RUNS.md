# How this site runs

Start here. Plain answers to the questions that keep coming up, then links to the
detail. Last updated 2026-09-23.

- [Where the code lives](#where-the-code-lives)
- [Where we are right now](#where-we-are-right-now)
- [DNS: exactly what to change](#dns-exactly-what-to-change)
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
`nutrijewel.com` has not moved and will not until you change the nameservers.
Both exist at once on purpose, so the switch is a decision rather than an
accident.

---

## Where we are right now

| Phase | State |
|---|---|
| 0. Security and payload cleanup | **done** |
| 1. Cloudflare Pages hosting | **done**, but DNS not switched |
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
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | Cloudflare account, resources, config files, DNS runbook |
| [../CLAUDE.md](../CLAUDE.md) | working rules for the repo, commands, traps |
| `.claude/plans/` | the approved plan for this whole project |

---

## DNS: exactly what to change

**Read this whole section before touching anything.** There is one step that can
break your email, and it fails silently.

### Where things stand

Your domain is registered at **Hostinger**. Its nameservers are
`ns1.dns-parking.com` and `ns2.dns-parking.com`, which are Hostinger's. So
Cloudflare is **not** in charge of your DNS yet, even though the domain appears
in your Cloudflare dashboard.

Current live records:

| Type | Value | What it does |
|---|---|---|
| A | `185.199.108.153`, `.109`, `.110`, `.111` | points the site at GitHub Pages |
| MX | `mx1.hostinger.com` (priority 5) | **receives your email** |
| MX | `mx2.hostinger.com` (priority 10) | **backup mail server** |
| TXT | `v=spf1 include:_spf.mail.hostinger.com ~all` | stops your email being marked spam |

### The thing that can go wrong

Changing nameservers moves **all** DNS for the domain to Cloudflare, not just the
website. If the MX and TXT records above are not already in Cloudflare when you
flip the nameservers, `hello@nutrijewel.com` stops receiving email immediately.

It fails quietly. You will not get an error. People emailing you get a bounce you
never see, and you will assume nobody is writing to you.

### Step 1: add the email records to Cloudflare (safe, changes nothing yet)

Cloudflare is not authoritative yet, so nothing you add here goes live. This is
staging the records so they are ready.

1. Log in to Cloudflare, click the **nutrijewel.com** zone, then **DNS** in the
   left menu.
2. Check whether these already exist. Cloudflare often imports them
   automatically when a domain is added. Add only what is missing.
3. Add the first mail record: **Add record** → Type **MX**, Name `@`, Mail server
   `mx1.hostinger.com`, Priority `5`, TTL Auto. Save.
4. Add the second: Type **MX**, Name `@`, Mail server `mx2.hostinger.com`,
   Priority `10`, TTL Auto. Save.
5. Add the SPF record: Type **TXT**, Name `@`, Content exactly
   `v=spf1 include:_spf.mail.hostinger.com ~all`. Save.
6. Also check your Hostinger DNS panel for any other records you use: a DKIM TXT
   record (often named something like `hostingermail._domainkey`), a DMARC TXT
   record at `_dmarc`, or `autodiscover`. Copy across anything you find. If in
   doubt, copy it: an extra record is harmless, a missing one is not.

> MX and TXT records are never proxied. If you see an orange cloud toggle, it
> does not apply to these types.

### Step 2: point the website at Cloudflare Pages

Still in the Cloudflare dashboard:

1. Go to **Workers & Pages** → the **nutrijewel** project → **Custom domains**.
2. **Set up a custom domain** → enter `nutrijewel.com` → Activate.
3. Repeat for `www.nutrijewel.com`.

Cloudflare creates the records and issues the TLS certificate itself. Because
Cloudflare is not authoritative yet, these will sit as **pending** until step 3.
That is expected and correct.

### Step 3: switch the nameservers at Hostinger

This is the live cutover and the only irreversible-feeling step.

1. Cloudflare will have given you two nameservers on the zone's overview page,
   something like `lila.ns.cloudflare.com` and a second one. Copy both exactly.
2. Log in to **Hostinger**, find the domain `nutrijewel.com`, open its DNS or
   nameserver settings, choose **Use custom nameservers**, and replace what is
   there with the two from Cloudflare.
3. Save.

Propagation is usually a few minutes, occasionally up to 24 to 48 hours. During
the change some visitors see the old host and some the new one. Both work, so
there is no outage as long as step 1 was done.

### Step 4: verify, in this order

1. `https://nutrijewel.com` loads and looks right.
2. `https://www.nutrijewel.com` reaches the same site.
3. **Send an email from your phone to `hello@nutrijewel.com` and confirm it
   arrives.** Do not skip this. Do it again a few hours later.
4. Place a test order through the WhatsApp flow to confirm nothing else broke.

### If something goes wrong

Put the Hostinger nameservers back (`ns1.dns-parking.com`,
`ns2.dns-parking.com`). Everything returns to how it is today. Keep those two
names written down before you start.

Only once email and the site are both confirmed working should the `gh-pages`
branch be retired.

---

## Razorpay KYC and the website audit

Razorpay does review the live website before approving payments, and they do
reject sites. Here is what they look for and where you stand.

### Documents they will ask for

| Item | Status |
|---|---|
| Business PAN card | you have this |
| Bank account details plus a cancelled cheque | in your name or the business's |
| Address proof for the business | |
| **FSSAI licence** (required for food) | **21524037004182**, already published on the site |
| GST certificate | only if you are registered. Tell me either way, it changes invoices |

The name on the PAN, the bank account and the website must match. Mismatches are
the most common rejection.

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
