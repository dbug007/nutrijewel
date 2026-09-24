/*
 * Razorpay for the Cloudflare Workers runtime.
 *
 * The official `razorpay` npm package is NOT used, and cannot be: it depends on
 * Node's `http` and `crypto` modules, which do not exist here. Everything below
 * is plain `fetch` against their REST API plus Web Crypto for HMAC, which is
 * what the runtime actually provides.
 *
 * The key secret lives only in Cloudflare's encrypted environment variables. It
 * is read from `env` per request and never logged, never returned, and never
 * sent to the browser. Only the key id reaches the client, which is by design:
 * Razorpay's checkout needs it and it is public information.
 */

const API = 'https://api.razorpay.com/v1';

const enc = new TextEncoder();

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Compare in constant time. A plain === returns early on the first differing
   character, and that timing difference is enough to forge a signature given
   enough attempts. */
function timingSafeEqualHex(a, b) {
  const x = String(a || '').toLowerCase();
  const y = String(b || '').toLowerCase();
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

function authHeader(env) {
  // btoa is available in Workers. Basic auth, key id as user, secret as password.
  return `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`;
}

export function razorpayConfigured(env) {
  return !!(env && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

/* Create an order. `amountPaise` must already be the server's own figure; this
   function never sees a browser-supplied price.

   `receipt` is our order number, which is how a Razorpay payment is traced back
   to a row in D1 even if every other link is lost. */
export async function createRazorpayOrder(env, { amountPaise, receipt, notes }) {
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw new Error('Amount must be a whole number of paise, at least 100.');
  }

  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { Authorization: authHeader(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: String(receipt).slice(0, 40), // Razorpay caps receipt length
      notes: notes || {},
    }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error((body.error && body.error.description) || 'Razorpay rejected the order.');
    err.status = res.status === 401 ? 401 : 502;
    // Their own error code is useful in logs and safe: it carries no secret.
    err.razorpayCode = body.error && body.error.code;
    throw err;
  }

  return body; // { id: 'order_...', amount, currency, receipt, status }
}

/* Verify the signature the browser hands back after a successful payment.
   Razorpay signs `order_id|payment_id` with the key secret. */
export async function verifyPaymentSignature(env, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false;
  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  return timingSafeEqualHex(expected, razorpay_signature);
}

/* Verify a webhook. Razorpay signs the RAW request body with the webhook secret,
   which is a different secret from the key secret. The body must be hashed
   exactly as received: parsing and re-stringifying changes the bytes and the
   signature will never match. */
export async function verifyWebhookSignature(env, rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  return timingSafeEqualHex(expected, signature);
}

/* Ask Razorpay directly what state a payment is in. Used when the browser
   callback is missing or suspect: their answer is authoritative, ours is not. */
export async function fetchPayment(env, paymentId) {
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader(env) },
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

/* Refund a captured payment in full.

   The amount is passed explicitly rather than left for Razorpay to default, so
   the refund always matches what our own record says was charged. Razorpay
   refuses a refund larger than what remains refundable, which is also what stops
   two simultaneous clicks from refunding the same order twice: the second one
   is rejected by Razorpay, not just by us. */
export async function createRefund(env, { paymentId, amountPaise, orderNumber }) {
  if (!paymentId) throw new Error('No payment to refund.');
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw new Error('Refund amount must be a whole number of paise, at least 100.');
  }
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers: { Authorization: authHeader(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountPaise,
      speed: 'normal',
      notes: { order_number: String(orderNumber || '') },
      receipt: `refund-${String(orderNumber || '').slice(0, 30)}`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((body.error && body.error.description) || 'Razorpay rejected the refund.');
    err.status = res.status === 401 ? 401 : 502;
    err.razorpayCode = body.error && body.error.code;
    throw err;
  }
  return body; // { id: 'rfnd_...', amount, status, ... }
}
