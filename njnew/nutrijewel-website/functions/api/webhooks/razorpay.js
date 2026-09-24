/* POST /api/webhooks/razorpay

   Razorpay's own report of what happened, and the authoritative one. This is
   what records the order when the customer pays and then closes the tab before
   the browser can call /verify. Without it, that is money taken with nothing
   written down.

   Two rules here:
     1. The RAW body is what gets hashed. Parsing and re-stringifying changes the
        bytes and the signature will never match.
     2. Every event is keyed on its Razorpay event id, so a retry (they do retry)
        is a no-op rather than a second state change. */

import { json, fail, methodNotAllowed } from '../../_shared/http.js';
import { verifyWebhookSignature } from '../../_shared/razorpay.js';

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return fail('Webhook is not configured.', 503);
  if (!env.DB) return fail('Order storage is unavailable.', 503);

  const raw = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  const valid = await verifyWebhookSignature(env, raw, signature);
  // 401 and no detail: an attacker learns nothing about why it failed.
  if (!valid) return fail('Invalid signature.', 401);

  let event;
  try { event = JSON.parse(raw); } catch (_) { return fail('Malformed payload.', 400); }

  const eventId = request.headers.get('x-razorpay-event-id') || (event.payload && event.payload.payment && event.payload.payment.entity && event.payload.payment.entity.id);
  const type = event.event || 'unknown';
  const entity = (event.payload && event.payload.payment && event.payload.payment.entity) || {};
  const razorpayOrderId = entity.order_id;

  if (!eventId) return fail('Missing event id.', 400);

  /* Idempotency. The PRIMARY KEY on event_id makes the second delivery of the
     same event fail this insert, and we stop there. */
  try {
    await env.DB.prepare(
      'INSERT INTO webhook_events (event_id, event_type, order_id, payload) VALUES (?,?,?,?)'
    ).bind(eventId, type, razorpayOrderId || null, raw.slice(0, 8000)).run();
  } catch (_) {
    return json({ ok: true, duplicate: true });
  }

  if (!razorpayOrderId) return json({ ok: true, ignored: type });

  const order = await env.DB.prepare(
    'SELECT id, status, total_paise FROM orders WHERE razorpay_order_id = ?'
  ).bind(razorpayOrderId).first();
  if (!order) return json({ ok: true, unknownOrder: true });

  if (type === 'payment.captured' || type === 'order.paid') {
    /* Guard against being told a different amount than we charged. If it does
       not match, record it and leave the order alone for a human to look at
       rather than marking it paid. */
    if (Number(entity.amount) && Number(entity.amount) !== Number(order.total_paise)) {
      await env.DB.prepare(
        "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,?,?,'webhook',?)"
      ).bind(order.id, order.status, order.status, `amount mismatch: charged ${entity.amount}, expected ${order.total_paise}`).run();
      return json({ ok: true, mismatch: true });
    }
    if (order.status === 'created') {
      await env.DB.batch([
        env.DB.prepare("UPDATE orders SET status='paid', razorpay_payment_id=?, paid_at=datetime('now'), updated_at=datetime('now') WHERE id=? AND status='created'").bind(entity.id || null, order.id),
        env.DB.prepare("INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,'created','paid','webhook',?)").bind(order.id, entity.id || type),
      ]);
    }
  } else if (type === 'payment.failed' && order.status === 'created') {
    await env.DB.batch([
      env.DB.prepare("UPDATE orders SET status='failed', updated_at=datetime('now') WHERE id=? AND status='created'").bind(order.id),
      env.DB.prepare("INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,'created','failed','webhook',?)").bind(order.id, (entity.error_description || 'payment failed').slice(0, 200)),
    ]);
  }

  return json({ ok: true });
}

export const onRequest = () => methodNotAllowed('POST');
