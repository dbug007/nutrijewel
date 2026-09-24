/* POST /api/checkout/verify
   { razorpay_order_id, razorpay_payment_id, razorpay_signature }

   The browser reports a successful payment. We trust the signature, not the
   claim: Razorpay signs `order_id|payment_id` with the key secret, so a forged
   success cannot be produced without it.

   This is the fast path, for showing a confirmation immediately. The webhook is
   the authoritative one and will agree with this or correct it. */

import { json, fail, methodNotAllowed, readJson } from '../../_shared/http.js';
import { verifyPaymentSignature, razorpayConfigured } from '../../_shared/razorpay.js';

export async function onRequestPost({ request, env }) {
  if (!razorpayConfigured(env)) return fail('Payments are not configured.', 503);
  if (!env.DB) return fail('Order storage is unavailable.', 503);

  const read = await readJson(request);
  if (!read.ok) return read.response;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = read.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return fail('Missing payment details.', 400);
  }

  const valid = await verifyPaymentSignature(env, { razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!valid) {
    // Never mark paid on a bad signature. Record the attempt so a pattern of
    // them is visible later.
    await env.DB.prepare(
      `INSERT INTO order_events (order_id, from_status, to_status, source, detail)
       SELECT id, status, status, 'verify', 'signature mismatch' FROM orders WHERE razorpay_order_id = ?`
    ).bind(razorpay_order_id).run().catch(() => {});
    return fail('Payment could not be verified.', 400);
  }

  const order = await env.DB.prepare(
    'SELECT id, order_number, status, total_paise FROM orders WHERE razorpay_order_id = ?'
  ).bind(razorpay_order_id).first();

  if (!order) return fail('Order not found.', 404);

  /* Move forward from `created`, or from `failed`: a declined card followed by a
     successful UPI payment reaches here with the order already marked failed by
     the first attempt's webhook. If the webhook got here first and the order is
     already paid, saying so again is not an error.

     The webhook fires on the same payment, often within the same second. If it
     commits between the SELECT above and this batch, the UPDATE matches nothing,
     and `WHERE changes() > 0` stops the audit row too, so the trail never claims
     the order was marked paid twice. */
  if (order.status === 'created' || order.status === 'failed') {
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE orders SET status='paid', razorpay_payment_id=?, paid_at=datetime('now'), updated_at=datetime('now') WHERE id=? AND status IN ('created','failed')"
      ).bind(razorpay_payment_id, order.id),
      env.DB.prepare(
        "INSERT INTO order_events (order_id, from_status, to_status, source, detail) SELECT ?, ?, 'paid', 'verify', ? WHERE changes() > 0"
      ).bind(order.id, order.status, razorpay_payment_id),
    ]);
  }

  return json({ ok: true, orderNumber: order.order_number, amountPaise: order.total_paise });
}

export const onRequest = () => methodNotAllowed('POST');
