/* POST /api/checkout/quote
   { lines: [{productId, weight, qty}], fulfilment?: 'pickup' | 'delivery', pincode? }

   Returns the authoritative totals. The page displays these rather than its own
   arithmetic, so what the customer sees is what the server will charge.

   `delivery` describes how the order reaches the customer. Its `display` is the
   text for the charge line: 'Free' only ever for pickup, the rupee amount for a
   fixed-fee pincode, and 'Actual fare' / 'At actual cost' for a Porter/Rapido or
   courier fare that is not in the total. A delivery charge of 0 is never shown
   as free delivery, because there is no such thing on this shop.

   This endpoint creates nothing and takes no money. It exists so the cart total
   and the Razorpay amount can never disagree: both come from here. */

import { json, fail, methodNotAllowed, readJson, formatPaise } from '../../_shared/http.js';
import pricing from '../../../src/utils/serverPricing.js';
import feeRules from '../../../src/data/fees.js';
import { turnstileSiteKey } from '../../_shared/turnstile.js';

const { repriceCart } = pricing;
const { PLATFORM_FEE_LABEL, CONVENIENCE_FEE_LABEL, CONVENIENCE_FEE_INFO } = feeRules;

export async function onRequestPost({ request, env }) {
  const read = await readJson(request);
  if (!read.ok) return read.response;

  const { lines, pincode, fulfilment } = read.body || {};
  const result = repriceCart(lines, { fulfilment, pincode });

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
    turnstileSiteKey: turnstileSiteKey(env),
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
    /* The two fees as rupee amounts, never as rates (the owner's call). Every
       line of the payment is here, so the page can show exactly how the total
       is made up. */
    fees: [
      { id: 'platform', label: PLATFORM_FEE_LABEL, paise: result.platformFeePaise, display: formatPaise(result.platformFeePaise), info: null },
      { id: 'convenience', label: CONVENIENCE_FEE_LABEL, paise: result.convenienceFeePaise, display: formatPaise(result.convenienceFeePaise), info: CONVENIENCE_FEE_INFO },
    ],
    itemsDisplay: formatPaise(result.itemsPaise),
    // Driven by the method, never by the amount being 0.
    shippingDisplay: result.delivery ? result.delivery.display : '',
    totalDisplay: formatPaise(result.totalPaise),
    delivery: result.delivery ? {
      id: result.delivery.id,
      method: result.delivery.method,           // 'pickup' | 'fixed' | 'variable'
      label: result.delivery.label,
      display: result.delivery.display,
      note: result.delivery.note,
      feePaise: result.delivery.feePaise,
      chargedOnline: result.delivery.chargedOnline,
    } : null,
  });
}

export const onRequest = () => methodNotAllowed('POST');
