/* POST /api/orders/track   { orderNumber, phone }

   Guest order tracking. There are no accounts, so the order number plus the
   phone that placed it is the credential.

   Deliberately stingy: it returns a status and the item names, never the
   address, never the email, never the full phone. An order number is short
   enough to brute force eventually, so a correct guess must not hand over a
   customer's home address. The phone check is the real lock; the thin response
   is what limits the damage if someone gets past it. */

import { json, fail, methodNotAllowed, readJson } from '../../_shared/http.js';
import { rateLimit, clientIp } from '../../_shared/rateLimit.js';

const STATUS_TEXT = {
  created: { label: 'Awaiting payment', detail: 'We have not received payment for this order yet.' },
  paid: { label: 'Paid', detail: 'Payment received. We will confirm your order shortly.' },
  confirmed: { label: 'Confirmed', detail: 'We are getting your order ready.' },
  // Neutral on purpose: a Pune order goes by rider, an outside-Pune one by courier.
  packed: { label: 'Packed', detail: 'Packed and ready to send.' },
  shipped: { label: 'On its way', detail: 'Your order has left our kitchen.' },
  delivered: { label: 'Delivered', detail: 'Delivered. We hope you enjoy it.' },
  failed: { label: 'Payment failed', detail: 'The payment did not go through, so nothing was charged.' },
  cancelled: { label: 'Cancelled', detail: 'This order was cancelled.' },
  refunded: { label: 'Refunded', detail: 'This order was refunded.' },
};

/* A pickup order never goes out on the road: packed means ready to collect at
   Lodha Belmondo, delivered means collected. */
const PICKUP_TEXT = {
  confirmed: { label: 'Confirmed', detail: 'We are getting your order ready for pickup.' },
  packed: { label: 'Ready for pickup', detail: 'Ready to collect at Lodha Belmondo. We will WhatsApp you the details.' },
  delivered: { label: 'Collected', detail: 'Collected. We hope you enjoy it.' },
};

/* Constant time compare, so response timing cannot be used to narrow down a
   phone number digit by digit. */
function sameDigits(a, b) {
  const x = String(a || '').replace(/\D/g, '').slice(-10);
  const y = String(b || '').replace(/\D/g, '').slice(-10);
  if (x.length !== 10 || y.length !== 10) return false;
  let diff = 0;
  for (let i = 0; i < 10; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return fail('Order lookup is unavailable.', 503);

  /* Order numbers are short enough to guess eventually. This is what makes
     "eventually" impractical: 20 lookups per 10 minutes per address. */
  const limited = await rateLimit(env, { action: 'track', key: clientIp(request), limit: 20, windowSeconds: 600 });
  if (limited) return limited;

  const read = await readJson(request);
  if (!read.ok) return read.response;

  const { orderNumber, phone } = read.body || {};
  const number = String(orderNumber || '').trim().toUpperCase();
  if (!/^NJ-\d{4}-[0-9A-Z]{4}$/.test(number)) return fail('That does not look like a NutriJewel order number.', 400);
  if (!/^\d{10}$/.test(String(phone || '').replace(/\D/g, '').slice(-10))) return fail('Enter the 10 digit mobile number used for the order.', 400);

  const order = await env.DB.prepare(
    'SELECT id, order_number, status, total_paise, customer_phone, created_at, paid_at, fulfilment FROM orders WHERE order_number = ?'
  ).bind(number).first();

  /* Same answer whether the order does not exist or the phone is wrong. Telling
     them apart would turn this into an oracle for which order numbers are real. */
  if (!order || !sameDigits(order.customer_phone, phone)) {
    return fail('We could not find an order with those details.', 404);
  }

  const { results } = await env.DB.prepare(
    'SELECT product_name, weight, qty FROM order_items WHERE order_id = ?'
  ).bind(order.id).all();

  const pickup = order.fulfilment === 'pickup';
  const s = (pickup && PICKUP_TEXT[order.status]) || STATUS_TEXT[order.status] || { label: order.status, detail: '' };

  return json({
    ok: true,
    orderNumber: order.order_number,
    status: order.status,
    // 'pickup' | 'delivery'. The method only, never the address.
    fulfilment: pickup ? 'pickup' : 'delivery',
    statusLabel: s.label,
    statusDetail: s.detail,
    totalPaise: order.total_paise,
    placedAt: order.created_at,
    paidAt: order.paid_at,
    items: (results || []).map((i) => ({ name: i.product_name, weight: i.weight, qty: i.qty })),
  });
}

export const onRequest = () => methodNotAllowed('POST');
