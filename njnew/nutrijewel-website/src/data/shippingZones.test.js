const zones = require('./shippingZones');

const { deliveryFor, describeZone, FIXED_RATES, PICKUP, OUTSIDE_PUNE } = zones;
const route = (fulfilment, pincode) => deliveryFor({ fulfilment, pincode });

/* The owner's rules, 2026-09-25. These numbers are business decisions: if one of
   these tests fails, the change needs the owner's say-so, not a test update. */
describe("the owner's delivery rules", () => {
  it('pickup is free, only at Lodha Belmondo, and needs no pincode', () => {
    const r = route('pickup');
    expect(r.ok).toBe(true);
    expect(r.delivery.method).toBe('pickup');
    expect(r.delivery.feePaise).toBe(0);
    expect(r.delivery.chargedOnline).toBe(true);
    expect(r.delivery.label).toMatch(/Lodha Belmondo/);
    expect(route('pickup', '560001').delivery.id).toBe(PICKUP.id); // a pincode changes nothing
  });

  it.each([
    ['412101', 6600, '₹66'],
    ['411014', 14900, '₹149'],
    ['411005', 14900, '₹149'],
  ])('delivery to %s costs %i paise, charged at checkout', (pin, paise, shown) => {
    const r = route('delivery', pin);
    expect(r.ok).toBe(true);
    expect(r.delivery.method).toBe('fixed');
    expect(r.delivery.feePaise).toBe(paise);
    expect(r.delivery.chargedOnline).toBe(true);
    expect(r.delivery.display).toBe(shown);
  });

  it('the fixed fees are exact pincodes, not prefixes', () => {
    ['411015', '411004', '412102', '411006'].forEach((pin) => {
      expect(route('delivery', pin).delivery.method).not.toBe('fixed');
    });
  });

  it.each(['411001', '411057', '411038', '412207', '410501'])(
    'any other Pune pincode (%s) pays the Porter/Rapido fare, not charged online',
    (pin) => {
      const r = route('delivery', pin);
      expect(r.ok).toBe(true);
      expect(r.delivery.id).toBe('pune-app-fare');
      expect(r.delivery.method).toBe('variable');
      expect(r.delivery.chargedOnline).toBe(false);
      expect(r.delivery.label).toMatch(/Porter\/Rapido/);
    }
  );

  it('there is no free delivery anywhere: no zone has a free threshold, and only pickup is ever labelled Free', () => {
    FIXED_RATES.forEach((z) => {
      expect(z).not.toHaveProperty('freeAbovePaise');
      expect(z.feePaise).toBeGreaterThan(0);
    });
    ['412101', '411014', '411005', '411001', '560001', '110001'].forEach((pin) => {
      const r = route('delivery', pin);
      if (r.ok) expect(r.delivery.display).not.toMatch(/free/i);
    });
    expect(route('pickup').delivery.display).toBe('Free');
  });

  it('outside Pune follows the single OUTSIDE_PUNE switch', () => {
    const r = route('delivery', '560001');
    if (OUTSIDE_PUNE === 'not-served') {
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/pickup/i);
    } else {
      expect(OUTSIDE_PUNE).toBe('courier-at-cost');
      expect(r.delivery.id).toBe('outside-pune-courier');
      expect(r.delivery.chargedOnline).toBe(false);
    }
  });
});

describe('what the customer has to give', () => {
  it('has no delivery until a choice is made', () => {
    expect(route(undefined)).toEqual({ ok: true, delivery: null });
  });

  it('refuses an unknown method rather than guessing', () => {
    ['courier', 'PICKUP', 'free', 1].forEach((m) => expect(route(m, '411014').ok).toBe(false));
  });

  it('refuses delivery with no pincode, which used to price delivery at 0', () => {
    [undefined, null, '', '   '].forEach((pin) => {
      const r = route('delivery', pin);
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/pincode/i);
    });
  });

  it.each(['1234', '0110011', 'abcdef', '012345'])('refuses invalid pincode %p', (pin) => {
    expect(route('delivery', pin).ok).toBe(false);
  });

  it('trims whitespace around a pincode', () => {
    expect(route('delivery', ' 412101 ').delivery.feePaise).toBe(6600);
  });
});

describe('describing a stored order for the admin and tracking', () => {
  it('flags orders whose delivery fare still has to be arranged', () => {
    expect(describeZone('pune-app-fare', 'delivery').fareToCollect).toBe(true);
    expect(describeZone('outside-pune-courier', 'delivery').fareToCollect).toBe(true);
    expect(describeZone('delivery-412101', 'delivery').fareToCollect).toBe(false);
  });

  it('knows a pickup, even from the fulfilment column alone', () => {
    expect(describeZone(null, 'pickup').method).toBe('pickup');
    expect(describeZone('pickup-lodha-belmondo', 'delivery').method).toBe('pickup');
  });

  it('never calls an older order free', () => {
    ['pune-local', 'maharashtra', 'rest-of-india', null, undefined].forEach((id) => {
      const d = describeZone(id, 'delivery');
      expect(d.method).toBe('legacy');
      expect(d.label).not.toMatch(/free/i);
    });
  });
});
