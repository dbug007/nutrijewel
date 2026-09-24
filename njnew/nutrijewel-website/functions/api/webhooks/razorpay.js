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

  const type = event.event || 'unknown';
  const entity = (event.payload && event.payload.payment && event.payload.payment.entity) || {};
  const razorpayOrderId = entity.order_id;

  /* Razorpay sends x-razorpay-event-id on every delivery. The fallback includes
     the event type, because payment.captured and order.paid carry the SAME
     payment id; keyed on the payment id alone, one would be thrown away as a
     "duplicate" of the other. */
  const eventId = request.headers.get('x-razorpay-event-id') || (entity.id ? `${type}:${entity.id}` : null);
  if (!eventId) return fail('Missing event id.', 400);

  // Already handled: say so with a 200, so Razorpay stops retrying.
  const seen = await env.DB.prepare('SELECT 1 FROM webhook_events WHERE event_id = ?').bind(eventId).first();
  if (seen) return json({ ok: true, duplicate: true });

  const record = env.DB.prepare(
    'INSERT INTO webhook_events (event_id, event_type, order_id, payload) VALUES (?,?,?,?)'
  ).bind(eventId, type, razorpayOrderId || null, raw.slice(0, 8000));

  const statements = [];
  const result = { ok: true };

  if (!razorpayOrderId) {
    result.ignored = type;
  } else {
    const order = await env.DB.prepare(
      'SELECT id, status, total_paise FROM orders WHERE razorpay_order_id = ?'
    ).bind(razorpayOrderId).first();

    if (!order) {
      result.unknownOrder = true;
    } else if (type === 'payment.captured' || type === 'order.paid') {
      if (Number(entity.amount) && Number(entity.amount) !== Number(order.total_paise)) {
        /* Told a different amount than we charged: record it for a human and
           leave the order alone rather than marking it paid. */
        statements.push(env.DB.prepare(
          "INSERT INTO order_events (order_id, from_status, to_status, source, detail) VALUES (?,?,?,'webhook',?)"
        ).bind(order.id, order.status, order.status, `amount mismatch: charged ${entity.amount}, expected ${order.total_paise}`));
        result.mismatch = true;
      } else if (order.status === 'created' || order.status === 'failed') {
        /* 'failed' is included on purpose. A customer whose card is declined and
           who then pays by UPI produces payment.failed followed by
           payment.captured. Upgrading only 'created' orders left that order
           marked failed with the money already taken. A success supersedes an
           earlier failure; the reverse never happens (see below). */
        statements.push(env.DB.prepare(
          "UPDATE orders SET status='paid', razorpay_payment_id=?, paid_at=datetime('now'), updated_at=datetime('now') WHERE id=? AND status IN ('created','failed')"
        ).bind(entity.id || null, order.id));
        // Only if the UPDATE moved it: /verify may have got there first.
        statements.push(env.DB.prepare(
          "INSERT INTO order_events (order_id, from_status, to_status, source, detail) SELECT ?,?,'paid','webhook',? WHERE changes() > 0"
        ).bind(order.id, order.status, entity.id || type));
        result.marked = 'paid';
      }
    } else if (type === 'payment.failed' && order.status === 'created') {
      // Only an unpaid order can fail. A failure never downgrades a paid order.
      statements.push(env.DB.prepare(
        "UPDATE orders SET status='failed', updated_at=datetime('now') WHERE id=? AND status='created'"
      ).bind(order.id));
      statements.push(env.DB.prepare(
        "INSERT INTO order_events (order_id, from_status, to_status, source, detail) SELECT ?,'created','failed','webhook',? WHERE changes() > 0"
      ).bind(order.id, (entity.error_description || 'payment failed').slice(0, 200)));
      result.marked = 'failed';
    }
  }

  /* The order change and the "seen" marker commit together, as one D1
     transaction. Recording the event first and updating the order separately
     meant a failed update was followed by a retry that found the event already
     "seen" and did nothing, leaving a paid order stuck unpaid for good. */
  try {
    await env.DB.batch([...statements, record]);
  } catch (_) {
    /* Two deliveries of one event can race, and the loser fails on the event id.
       That is harmless, but it is decided by looking, not by the error text: a
       CHECK or foreign key failure also says "constraint", and answering 200 to
       one of those would tell Razorpay to stop retrying a write that never
       happened. */
    const won = await env.DB.prepare('SELECT 1 FROM webhook_events WHERE event_id = ?').bind(eventId).first().catch(() => null);
    if (won) return json({ ok: true, duplicate: true });
    // A non-2xx, so Razorpay retries instead of assuming success.
    return fail('Could not record the payment event.', 500);
  }

  return json(result);
}

export const onRequest = () => methodNotAllowed('POST');
