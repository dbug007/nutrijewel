const products = require('../data/products.data');
const { repriceCart, toPaise, MAX_QTY_PER_LINE } = require('./serverPricing');
const { feesFor } = require('../data/fees');

const buyable = products.find((p) => !p.outOfSeason && !p.comingSoon && !p.priceOnRequest && !p.variants);
const withVariants = products.find((p) => Array.isArray(p.variants) && p.variants.length > 1);
const PIN_PUNE = '411001';

const line = (over = {}) => ({ productId: buyable.id, weight: buyable.weight, qty: 1, ...over });

describe('the client cannot set the price', () => {
  it('ignores a unitPrice sent by the browser', () => {
    const honest = repriceCart([line()], { pincode: PIN_PUNE });
    const cheat = repriceCart([{ ...line(), unitPrice: 1, price: 1, linePaise: 100, total: 1 }], { pincode: PIN_PUNE });
    expect(cheat.ok).toBe(true);
    expect(cheat.totalPaise).toBe(honest.totalPaise);
    expect(cheat.lines[0].unitPaise).toBe(toPaise(buyable.price));
  });

  it('prices from the catalogue, not from the request', () => {
    const r = repriceCart([line()], { pincode: PIN_PUNE });
    expect(r.lines[0].unitPaise).toBe(toPaise(buyable.price));
    expect(r.itemsPaise).toBe(toPaise(buyable.price));
  });
});

describe('products that are not for sale', () => {
  it.each(['plum-cake', 'maharaja-cake', 'focaccia-bread'])('refuses %s', (id) => {
    const p = products.find((x) => x.id === id);
    const r = repriceCart([{ productId: id, weight: p.weight, qty: 1 }], { pincode: PIN_PUNE });
    expect(r.ok).toBe(false);
    expect(r.totalPaise).toBe(0);
  });

  it('never lets the zero-priced focaccia produce an order', () => {
    const r = repriceCart([{ productId: 'focaccia-bread', weight: 'Made to order', qty: 5 }], { pincode: PIN_PUNE });
    expect(r.ok).toBe(false);
    expect(r.totalPaise).toBe(0);
  });

  it('rejects the whole basket, not just the bad line', () => {
    const parked = products.find((x) => x.id === 'plum-cake');
    const r = repriceCart([line(), { productId: parked.id, weight: parked.weight, qty: 1 }], { pincode: PIN_PUNE });
    expect(r.ok).toBe(false);
    expect(r.totalPaise).toBe(0);
  });
});

describe('variants', () => {
  it('charges the variant that was chosen', () => {
    const v = withVariants.variants[1];
    const r = repriceCart([{ productId: withVariants.id, weight: v.weight, qty: 1 }], { pincode: PIN_PUNE });
    expect(r.ok).toBe(true);
    expect(r.lines[0].unitPaise).toBe(toPaise(v.price));
  });

  it('refuses a size the product does not have, rather than guessing', () => {
    const r = repriceCart([{ productId: withVariants.id, weight: '17kg', qty: 1 }], { pincode: PIN_PUNE });
    expect(r.ok).toBe(false);
  });
});

describe('quantity', () => {
  it.each([0, -3, 1.5, NaN, null, undefined, 'lots'])('refuses qty %p', (qty) => {
    expect(repriceCart([line({ qty })], { pincode: PIN_PUNE }).ok).toBe(false);
  });

  it(`refuses more than ${MAX_QTY_PER_LINE}`, () => {
    expect(repriceCart([line({ qty: MAX_QTY_PER_LINE + 1 })], { pincode: PIN_PUNE }).ok).toBe(false);
  });

  it('multiplies correctly', () => {
    const r = repriceCart([line({ qty: 3 })], { pincode: PIN_PUNE });
    expect(r.itemsPaise).toBe(toPaise(buyable.price) * 3);
  });
});

/* The fees for a given pre-fee amount, straight from the rule file. */
const feesOn = (base) => feesFor(base).feesPaise;

describe('pickup and delivery in the total Razorpay charges', () => {
  it.each([['412101', 6600], ['411014', 14900], ['411005', 14900]])(
    'adds the fixed fee for %s to the total',
    (pin, fee) => {
      const r = repriceCart([line()], { fulfilment: 'delivery', pincode: pin });
      expect(r.ok).toBe(true);
      expect(r.shippingPaise).toBe(fee);
      expect(r.totalPaise).toBe(r.itemsPaise + fee + feesOn(r.itemsPaise + fee));
    }
  );

  it('pickup adds no delivery charge and needs no pincode', () => {
    const r = repriceCart([line()], { fulfilment: 'pickup' });
    expect(r.ok).toBe(true);
    expect(r.delivery.method).toBe('pickup');
    expect(r.shippingPaise).toBe(0);
    expect(r.totalPaise).toBe(r.itemsPaise + feesOn(r.itemsPaise));
  });

  it('a Porter/Rapido fare is not in the total, and says so', () => {
    const r = repriceCart([line()], { fulfilment: 'delivery', pincode: PIN_PUNE });
    expect(r.ok).toBe(true);
    expect(r.delivery.chargedOnline).toBe(false);
    expect(r.shippingPaise).toBe(0);
    expect(r.totalPaise).toBe(r.itemsPaise + feesOn(r.itemsPaise));
  });

  /* The old placeholder zones made delivery free over a basket size. The owner:
     "free delivery is not there". A huge basket still pays the fee. */
  it('never waives a delivery fee, however big the basket', () => {
    const r = repriceCart([line({ qty: MAX_QTY_PER_LINE })], { fulfilment: 'delivery', pincode: '411014' });
    expect(r.itemsPaise).toBeGreaterThan(250000);
    expect(r.shippingPaise).toBe(14900);
  });

  /* The tampering hole this closes: create-order used to pass whatever pincode
     came in, and a blank one priced delivery at 0. */
  it('refuses delivery with a blank pincode instead of pricing it at 0', () => {
    ['', '   ', undefined, null].forEach((pincode) => {
      const r = repriceCart([line()], { fulfilment: 'delivery', pincode });
      expect(r.ok).toBe(false);
      expect(r.totalPaise).toBe(0);
    });
  });

  it('refuses a method it does not know', () => {
    expect(repriceCart([line()], { fulfilment: 'drone', pincode: '411014' }).ok).toBe(false);
  });

  it('reads a bare pincode as delivery, so an older page still quotes right', () => {
    expect(repriceCart([line()], { pincode: '412101' }).shippingPaise).toBe(6600);
  });

  it.each(['1234', '0110011', 'abcdef', '012345'])('refuses invalid pincode %p', (pin) => {
    expect(repriceCart([line()], { fulfilment: 'delivery', pincode: pin }).ok).toBe(false);
  });

  it('prices the items alone while no choice has been made (cart preview)', () => {
    const r = repriceCart([line()]);
    expect(r.ok).toBe(true);
    expect(r.shippingPaise).toBe(0);
    expect(r.delivery).toBeNull();
  });
});

describe('platform and convenience fees', () => {
  it('are charged on items plus a fixed delivery fee, and the total is the sum of every part', () => {
    const r = repriceCart([line()], { fulfilment: 'delivery', pincode: '412101' });
    const expected = feesFor(r.itemsPaise + 6600);
    expect(r.platformFeePaise).toBe(expected.platformFeePaise);
    expect(r.convenienceFeePaise).toBe(expected.convenienceFeePaise);
    expect(r.platformFeePaise).toBeGreaterThan(0);
    expect(r.convenienceFeePaise).toBeGreaterThan(0);
    expect(r.totalPaise).toBe(r.itemsPaise + r.shippingPaise + r.platformFeePaise + r.convenienceFeePaise);
  });

  it('are never charged on a Porter/Rapido fare, which is not in the payment', () => {
    const fare = repriceCart([line()], { fulfilment: 'delivery', pincode: PIN_PUNE });
    const pickup = repriceCart([line()], { fulfilment: 'pickup' });
    expect(fare.platformFeePaise).toBe(pickup.platformFeePaise);
    expect(fare.convenienceFeePaise).toBe(pickup.convenienceFeePaise);
  });

  it('are ignored when a client sends its own', () => {
    const honest = repriceCart([line()], { fulfilment: 'pickup' });
    const cheat = repriceCart([{ ...line(), platformFeePaise: 0, convenienceFeePaise: 0, fees: 0 }], { fulfilment: 'pickup', platformFeePaise: 0 });
    expect(cheat.totalPaise).toBe(honest.totalPaise);
    expect(cheat.platformFeePaise).toBeGreaterThan(0);
  });

  it('show in the cart preview too, before any choice is made', () => {
    const r = repriceCart([line()]);
    expect(r.platformFeePaise + r.convenienceFeePaise).toBe(feesOn(r.itemsPaise));
    expect(r.totalPaise).toBe(r.itemsPaise + feesOn(r.itemsPaise));
  });

  it('are zero on every refusal, so nothing chargeable leaks out of one', () => {
    const r = repriceCart([{ productId: 'free-cake', weight: '1kg', qty: 1 }], { fulfilment: 'pickup' });
    expect(r.ok).toBe(false);
    expect([r.platformFeePaise, r.convenienceFeePaise, r.totalPaise]).toEqual([0, 0, 0]);
  });
});

describe('rubbish input', () => {
  it.each([[], null, undefined, 'cart', 42])('refuses %p', (cart) => {
    expect(repriceCart(cart, { pincode: PIN_PUNE }).ok).toBe(false);
  });

  it('refuses an unknown product id', () => {
    expect(repriceCart([{ productId: 'free-cake', weight: '1kg', qty: 1 }], { pincode: PIN_PUNE }).ok).toBe(false);
  });

  it('refuses a missing product id', () => {
    expect(repriceCart([{ weight: '1kg', qty: 1 }], { pincode: PIN_PUNE }).ok).toBe(false);
  });
});

describe('money is always whole paise', () => {
  it('never produces a fractional amount', () => {
    // 411014 so a non-zero delivery fee is part of the arithmetic being checked.
    const r = repriceCart([line({ qty: 3 }), { productId: withVariants.id, weight: withVariants.variants[0].weight, qty: 2 }], { fulfilment: 'delivery', pincode: '411014' });
    expect(r.ok).toBe(true);
    [r.itemsPaise, r.shippingPaise, r.platformFeePaise, r.convenienceFeePaise, r.totalPaise, ...r.lines.map((l) => l.unitPaise)].forEach((v) => {
      expect(Number.isInteger(v)).toBe(true);
    });
  });

  it('converts rupees to paise without float drift', () => {
    expect(toPaise(299)).toBe(29900);
    expect(toPaise(449)).toBe(44900);
    expect(toPaise(0.1 + 0.2)).toBe(30);
  });
});

