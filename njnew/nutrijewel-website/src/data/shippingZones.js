/* Pickup and delivery: the owner's rules, and the only place they live.
   (CommonJS, so Cloudflare Functions and Jest can both require it, the same way
   scripts/create-static-routes.js requires the catalogue.)

   Set by the owner on 2026-09-25:
     1. Free pickup, only at Lodha Belmondo, Pune.
     2. Delivery to 412101: Rs 66.
     3. Delivery to 411014 and 411005: Rs 149.
     4. Any other Pune pincode: the standard Porter/Rapido fare for the trip.
        That fare varies, so it cannot be charged at checkout. It is confirmed
        with the customer on WhatsApp before dispatch and is NOT in the Razorpay
        total.
     5. No free delivery, anywhere. There is no "free above Rs X". The only free
        option is pickup. shippingZones.test.js pins every number above.

   Outside Pune the owner has not decided yet. OUTSIDE_PUNE below is the one
   switch: 'courier-at-cost' (the default, matching the "we deliver pan India"
   promise elsewhere on the site) treats it like rule 4 with a courier, and
   'not-served' refuses those pincodes at checkout and points to pickup or
   WhatsApp. Change nothing else to change that decision. */

const OUTSIDE_PUNE = 'courier-at-cost'; // 'courier-at-cost' | 'not-served'

const rupees = (paise) => `₹${paise / 100}`;

const PICKUP = {
  id: 'pickup-lodha-belmondo',
  method: 'pickup',
  feePaise: 0,
  chargedOnline: true,
  label: 'Pickup at Lodha Belmondo',
  display: 'Free',
  note: 'Collect your order from Lodha Belmondo, Pune. We will WhatsApp you when it is ready.',
};

/* Exact pincodes, never prefixes: 411015 is not 411014. */
const FIXED_RATES = [
  { id: 'delivery-412101', pincodes: ['412101'], feePaise: 6600 },
  { id: 'delivery-411014-411005', pincodes: ['411014', '411005'], feePaise: 14900 },
];

/* Which pincodes count as Pune for rule 4. 411 is Pune city and Pimpri
   Chinchwad; the others are Pune district suburbs (Dehu, Alandi, Wagholi, Loni
   Kalbhor, Manjari, Saswad, Lonavala, Chakan, Talegaon). Best effort from the
   postal series. Nothing about the money depends on it: a pincode outside this
   list is treated the same way under 'courier-at-cost', only the wording says
   courier instead of Porter/Rapido. */
const PUNE_AREA_PREFIXES = ['411', '4121', '4122', '4123', '4104', '4105'];

const PUNE_APP_FARE = {
  id: 'pune-app-fare',
  method: 'variable',
  feePaise: 0,
  chargedOnline: false,
  label: 'Delivery by Porter/Rapido',
  display: 'Actual fare',
  note: 'Porter or Rapido charge a fare for the trip. We will WhatsApp it to you before we send your order. It is not part of the total you pay now.',
};

const OUTSIDE_COURIER = {
  id: 'outside-pune-courier',
  method: 'variable',
  feePaise: 0,
  chargedOnline: false,
  label: 'Delivery by courier',
  display: 'At actual cost',
  note: 'Outside Pune we send by courier at actual cost. We will WhatsApp you the charge before we send your order. It is not part of the total you pay now.',
};

const NOT_SERVED_MESSAGE = 'We deliver within Pune only right now. Choose free pickup at Lodha Belmondo, or message us on WhatsApp.';

const isValidPincode = (pincode) => /^[1-9][0-9]{5}$/.test(String(pincode || '').trim());
const isPuneArea = (pin) => PUNE_AREA_PREFIXES.some((p) => pin.startsWith(p));

function fixedFor(pin) {
  const rate = FIXED_RATES.find((r) => r.pincodes.includes(pin));
  if (!rate) return null;
  return {
    id: rate.id,
    method: 'fixed',
    feePaise: rate.feePaise,
    chargedOnline: true,
    label: `Delivery to ${pin}`,
    display: rupees(rate.feePaise),
    note: 'We will WhatsApp you when your order is on its way.',
  };
}

/*
 * How this order reaches the customer, and what (if anything) is charged online.
 *
 *   fulfilment: 'pickup' | 'delivery' | undefined (not chosen yet)
 *   pincode:    required for delivery, ignored for pickup
 *
 * Returns { ok: true, delivery } where delivery is null until a choice is made,
 * or { ok: false, error } in words safe to show a customer. `delivery.feePaise`
 * is added to the Razorpay total only when `delivery.chargedOnline` is true.
 */
function deliveryFor({ fulfilment, pincode } = {}) {
  if (fulfilment == null || fulfilment === '') return { ok: true, delivery: null };
  if (fulfilment === 'pickup') return { ok: true, delivery: { ...PICKUP } };
  if (fulfilment !== 'delivery') return { ok: false, error: 'Choose pickup or delivery.' };

  const pin = String(pincode == null ? '' : pincode).trim();
  if (!pin) return { ok: false, error: 'Enter your 6 digit pincode for delivery.' };
  if (!isValidPincode(pin)) return { ok: false, error: 'Enter a valid 6 digit pincode.' };

  const fixed = fixedFor(pin);
  if (fixed) return { ok: true, delivery: { ...fixed, pincode: pin } };
  if (isPuneArea(pin)) return { ok: true, delivery: { ...PUNE_APP_FARE, pincode: pin } };
  if (OUTSIDE_PUNE === 'not-served') return { ok: false, notServed: true, error: NOT_SERVED_MESSAGE };
  return { ok: true, delivery: { ...OUTSIDE_COURIER, pincode: pin } };
}

/* For the admin and tracking: what a stored orders.shipping_zone means. Orders
   placed before these rules carry the old placeholder ids. */
const KNOWN = {
  [PICKUP.id]: { method: 'pickup', label: 'Pickup at Lodha Belmondo', fareToCollect: false },
  'delivery-412101': { method: 'fixed', label: 'Delivery, ₹66 paid', fareToCollect: false },
  'delivery-411014-411005': { method: 'fixed', label: 'Delivery, ₹149 paid', fareToCollect: false },
  [PUNE_APP_FARE.id]: { method: 'variable', label: 'Porter/Rapido fare to arrange', fareToCollect: true },
  [OUTSIDE_COURIER.id]: { method: 'variable', label: 'Courier charge to arrange', fareToCollect: true },
};

function describeZone(zoneId, fulfilment) {
  if (fulfilment === 'pickup' || zoneId === PICKUP.id) return { ...KNOWN[PICKUP.id] };
  if (zoneId && KNOWN[zoneId]) return { ...KNOWN[zoneId] };
  // Placeholder-era ids ('pune-local', 'maharashtra', 'rest-of-india') or none.
  return { method: 'legacy', label: 'Delivery (older order)', fareToCollect: false };
}

module.exports = {
  OUTSIDE_PUNE,
  PICKUP,
  FIXED_RATES,
  PUNE_AREA_PREFIXES,
  NOT_SERVED_MESSAGE,
  isValidPincode,
  deliveryFor,
  describeZone,
};
