/* Delivery zones by pincode (CommonJS, so Cloudflare Functions can require it the
   same way scripts/create-static-routes.js requires the catalogue).

   ⚠️ OWNER: these rates and windows are PLACEHOLDERS. The shipping policy says
   orders go by registered domestic courier nationwide with a 7 day processing
   window, so the default here is "we deliver everywhere". Correct the numbers,
   and if there are pincodes you genuinely cannot serve, add them to
   NON_SERVICEABLE_PREFIXES rather than deleting a zone.

   Matching is longest-prefix-wins, so '4110' beats '4' and order does not matter. */

const ZONES = [
  {
    id: 'pune-local',
    name: 'Pune local',
    prefixes: ['4110', '4112', '4113'],
    ratePaise: 4000,          // ₹40
    freeAbovePaise: 80000,    // free over ₹800
    minDays: 1,
    maxDays: 2,
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    prefixes: ['4'],
    ratePaise: 8000,          // ₹80
    freeAbovePaise: 150000,   // free over ₹1500
    minDays: 2,
    maxDays: 4,
  },
  {
    id: 'rest-of-india',
    name: 'Rest of India',
    prefixes: [''],           // the catch-all
    ratePaise: 15000,         // ₹150
    freeAbovePaise: 250000,   // free over ₹2500
    minDays: 4,
    maxDays: 8,
  },
];

/* Pincodes we will not deliver to at all. Empty by design: the published policy
   promises nationwide delivery, so refusing an order needs a real reason. */
const NON_SERVICEABLE_PREFIXES = [];

const isValidPincode = (pincode) => /^[1-9][0-9]{5}$/.test(String(pincode || '').trim());

/* Resolve a pincode to its zone. Returns null for anything that is not a real
   Indian pincode, so callers must handle "we could not price this" separately
   from "we do not deliver there". */
function findZone(pincode) {
  const pin = String(pincode || '').trim();
  if (!isValidPincode(pin)) return null;
  if (NON_SERVICEABLE_PREFIXES.some((p) => pin.startsWith(p))) {
    return { id: 'non-serviceable', name: 'Not serviceable', serviceable: false };
  }
  let best = null;
  let bestLen = -1;
  ZONES.forEach((zone) => {
    zone.prefixes.forEach((prefix) => {
      if (pin.startsWith(prefix) && prefix.length > bestLen) {
        best = zone;
        bestLen = prefix.length;
      }
    });
  });
  return best ? { ...best, serviceable: true } : null;
}

/* Shipping for a given basket value. Free-above is checked against the items
   total, never the grand total, or adding shipping could push an order over the
   threshold and then remove the very charge that got it there. */
function shippingPaiseFor(zone, itemsTotalPaise) {
  if (!zone || !zone.serviceable) return 0;
  const items = Number.isFinite(itemsTotalPaise) ? itemsTotalPaise : 0;
  if (zone.freeAbovePaise != null && items >= zone.freeAbovePaise) return 0;
  return zone.ratePaise;
}

module.exports = {
  ZONES,
  NON_SERVICEABLE_PREFIXES,
  isValidPincode,
  findZone,
  shippingPaiseFor,
};
