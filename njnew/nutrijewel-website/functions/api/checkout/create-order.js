/* POST /api/checkout/create-order
   { lines: [{productId, weight, qty}], customer: {name, phone, email, address, city, pincode} }

   Reprices the basket from the catalogue, writes a `created` order row, asks
   Razorpay for an order id, and hands the browser only what the payment modal
   needs. The browser's idea of the price is never read. */

import { json, fail, methodNotAllowed, readJson } from '../../_shared/http.js';
import { createRazorpayOrder, razorpayConfigured } from '../../_shared/razorpay.js';
import pricing from '../../../src/utils/serverPricing.js';
import { rateLimit, clientIp } from '../../_shared/rateLimit.js';
import { turnstileEnabled, verifyTurnstile } from '../../_shared/turnstile.js';

const { repriceCart } = pricing;

/* NJ-YYMM-XXXX. Short enough to read out on the phone, with 4 random base32
   characters so order numbers cannot be guessed or counted. Sequential numbers
   would tell a competitor exactly how many orders were taken. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O/1/I
function orderNumber() {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const tail = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
  return `NJ-${yy}${mm}-${tail}`;
}

const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

function validateCustomer(c) {
  const errors = [];
  const out = {
    name: clean(c && c.name, 80),
    phone: clean(c && c.phone, 20).replace(/[\s-]/g, ''),
    email: clean(c && c.email, 120),
    address: clean(c && c.address, 300),
    city: clean(c && c.city, 80),
    pincode: clean(c && c.pincode, 10),
    notes: clean(c && c.notes, 300),
  };
  if (out.name.length < 2) errors.push('Enter your name.');
  // Indian mobile numbers: 10 digits starting 6 to 9, with an optional +91.
  const phone = out.phone.replace(/^(\+?91)/, '');
  if (!/^[6-9][0-9]{9}$/.test(phone)) errors.push('Enter a valid 10 digit mobile number.');
  else out.phone = phone;
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(out.email)) errors.push('That email address does not look right.');
  if (out.address.length < 8) errors.push('Enter your full delivery address.');
  if (out.city.length < 2) errors.push('Enter your city.');
  return { errors, customer: out };
}

export async function onRequestPost({ request, env }) {
  if (!razorpayConfigured(env)) return fail('Payments are not configured yet.', 503);
  if (!env.DB) return fail('Order storage is unavailable.', 503);

  /* A real customer places an order or two. A script testing stolen cards
     against your Razorpay account places hundreds, and every attempt costs you
     reputation with the card networks. 10 per 10 minutes per address. */
  const limited = await rateLimit(env, { action: 'create-order', key: clientIp(request), limit: 10, windowSeconds: 600 });
  if (limited) return limited;

  const read = await readJson(request);
  if (!read.ok) return read.response;

  const { lines, customer, turnstileToken } = read.body || {};

  // Bot check, only once the owner has configured both Turnstile keys.
  if (turnstileEnabled(env)) {
    const human = await verifyTurnstile(env, turnstileToken, clientIp(request));
    if (!human) return json({ ok: false, errors: ['Please complete the security check and try again.'] });
  }

  const who = validateCustomer(customer);
  if (who.errors.length) return json({ ok: false, errors: who.errors });

  // The price is decided here and nowhere else.
  const priced = repriceCart(lines, { pincode: who.customer.pincode });
  if (!priced.ok) return json({ ok: false, errors: priced.errors });
  if (priced.totalPaise < 100) return json({ ok: false, errors: ['That order is below the minimum we can charge.'] });

  const id = crypto.randomUUID();
  const number = orderNumber();

  let rzp;
  try {
    rzp = await createRazorpayOrder(env, {
      amountPaise: priced.totalPaise,
      receipt: number,
      notes: { order_number: number, pincode: who.customer.pincode },
    });
  } catch (e) {
    // Nothing is written if Razorpay refuses, so there is no orphan order.
    return fail(e.status === 401 ? 'Payments are misconfigured.' : 'Could not start the payment. Please try again.', e.status || 502);
  }

  const o = who.customer;
  const statements = [
    env.DB.prepare(
      `INSERT INTO orders (id, order_number, status, items_paise, shipping_paise, total_paise,
         customer_name, customer_phone, customer_email, address_line, city, pincode, shipping_zone,
         notes, razorpay_order_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id, number, 'created', priced.itemsPaise, priced.shippingPaise, priced.totalPaise,
      o.name, o.phone, o.email || null, o.address, o.city, o.pincode,
      priced.zone ? priced.zone.id : null, o.notes || null, rzp.id
    ),
    env.DB.prepare(
      "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?, NULL, 'created', 'system', ?)"
    ).bind(id, rzp.id),
  ];
  priced.lines.forEach((l) => {
    statements.push(env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, weight, qty, unit_paise, line_paise, mrp_paise)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(id, l.productId, l.name, l.weight, l.qty, l.unitPaise, l.linePaise, l.mrpPaise));
  });
  await env.DB.batch(statements);

  return json({
    ok: true,
    orderNumber: number,
    razorpayOrderId: rzp.id,
    amountPaise: priced.totalPaise,
    currency: 'INR',
    // Public by design. Served from here rather than baked into the bundle, so
    // swapping test keys for live ones needs no rebuild.
    keyId: env.RAZORPAY_KEY_ID,
    prefill: { name: o.name, contact: o.phone, email: o.email || '' },
  });
}

export const onRequest = () => methodNotAllowed('POST');
