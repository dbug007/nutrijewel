/* POST /api/checkout/quote
   { lines: [{productId, weight, qty}], pincode? }

   Returns the authoritative totals. The page displays these rather than its own
   arithmetic, so what the customer sees is what the server will charge.

   This endpoint creates nothing and takes no money. It exists so the cart total
   and the Razorpay amount can never disagree: both come from here. */

import { json, fail, methodNotAllowed, readJson, formatPaise } from '../../_shared/http.js';
import pricing from '../../../src/utils/serverPricing.js';

const { repriceCart } = pricing;

export async function onRequestPost({ request, env }) {
  const read = await readJson(request);
  if (!read.ok) return read.response;

  const { lines, pincode } = read.body || {};
  const result = repriceCart(lines, { pincode });

  if (!result.ok) {
    // 200, not 4xx: a cart with an out-of-season item is a normal thing for the
    // page to render, not a transport error.
    return json({ ok: false, errors: result.errors });
  }

  return json({
    ok: true,
    /* So the page can say plainly that no real money will move. A test key is
       exactly the situation where a confirmation screen is most misleading. */
    testMode: !!(env && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID.startsWith('rzp_test_')),
    lines: result.lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      weight: l.weight,
      qty: l.qty,
      unitPaise: l.unitPaise,
      linePaise: l.linePaise,
      unitDisplay: formatPaise(l.unitPaise),
      lineDisplay: formatPaise(l.linePaise),
    })),
    itemsPaise: result.itemsPaise,
    shippingPaise: result.shippingPaise,
    totalPaise: result.totalPaise,
    itemsDisplay: formatPaise(result.itemsPaise),
    shippingDisplay: result.shippingPaise === 0 ? 'Free' : formatPaise(result.shippingPaise),
    totalDisplay: formatPaise(result.totalPaise),
    zone: result.zone ? { id: result.zone.id, name: result.zone.name, minDays: result.zone.minDays, maxDays: result.zone.maxDays } : null,
  });
}

export const onRequest = () => methodNotAllowed('POST');
