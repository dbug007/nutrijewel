/* GET /api/serviceability?pincode=411001
   Can NutriJewel deliver there, and how is delivery charged. Read-only, no side
   effects, safe to call as the customer types. The rules are in
   src/data/shippingZones.js; free pickup at Lodha Belmondo is always available.

   Response: { ok, serviceable, delivery: { id, method, label, display, note,
   feePaise, chargedOnline } | null, message? }. method is 'fixed' (a set fee,
   charged at checkout) or 'variable' (a Porter/Rapido or courier fare, confirmed
   on WhatsApp, not charged at checkout). No delivery is ever free. */

import { json, fail, methodNotAllowed } from '../_shared/http.js';
import zones from '../../src/data/shippingZones.js';

const { deliveryFor, isValidPincode } = zones;

export async function onRequestGet({ request }) {
  const pincode = new URL(request.url).searchParams.get('pincode') || '';

  if (!isValidPincode(pincode)) {
    return fail('Enter a valid 6 digit pincode.', 400);
  }

  const route = deliveryFor({ fulfilment: 'delivery', pincode });
  if (!route.ok) {
    return json({ ok: true, serviceable: false, delivery: null, message: route.error });
  }

  const d = route.delivery;
  return json({
    ok: true,
    serviceable: true,
    delivery: {
      id: d.id, method: d.method, label: d.label, display: d.display, note: d.note,
      feePaise: d.feePaise, chargedOnline: d.chargedOnline,
    },
  });
}

export const onRequest = () => methodNotAllowed('GET');
