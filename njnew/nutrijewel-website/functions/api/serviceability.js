/* GET /api/serviceability?pincode=411001
   Does NutriJewel deliver there, what does it cost, how long does it take.
   Read-only, no side effects, safe to call as the customer types. */

import { json, fail, methodNotAllowed } from '../_shared/http.js';
import zones from '../../src/data/shippingZones.js';

const { findZone, isValidPincode } = zones;

export async function onRequestGet({ request }) {
  const pincode = new URL(request.url).searchParams.get('pincode') || '';

  if (!isValidPincode(pincode)) {
    return fail('Enter a valid 6 digit pincode.', 400);
  }

  const zone = findZone(pincode);
  if (!zone || !zone.serviceable) {
    return json({
      ok: true,
      serviceable: false,
      message: 'We do not deliver there yet. Message us on WhatsApp and we will see what we can do.',
    });
  }

  return json({
    ok: true,
    serviceable: true,
    zone: { id: zone.id, name: zone.name },
    ratePaise: zone.ratePaise,
    freeAbovePaise: zone.freeAbovePaise ?? null,
    minDays: zone.minDays,
    maxDays: zone.maxDays,
  });
}

export const onRequest = () => methodNotAllowed('GET');
