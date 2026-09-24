const products = require('../data/products.data');
const { repriceCart, toPaise, MAX_QTY_PER_LINE } = require('./serverPricing');

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
  it.each(['plum-cake', 'hummus', 'maharaja-cake', 'focaccia-bread'])('refuses %s', (id) => {
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
    const r = repriceCart([line(), { productId: 'hummus', weight: '1 pack', qty: 1 }], { pincode: PIN_PUNE });
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

describe('shipping', () => {
  it('charges the Pune rate on a small order', () => {
    const r = repriceCart([line()], { pincode: PIN_PUNE });
    expect(r.zone.id).toBe('pune-local');
    expect(r.shippingPaise).toBe(4000);
    expect(r.totalPaise).toBe(r.itemsPaise + r.shippingPaise);
  });

  it('goes free once the basket clears the threshold', () => {
    const r = repriceCart([line({ qty: MAX_QTY_PER_LINE })], { pincode: PIN_PUNE });
    expect(r.itemsPaise).toBeGreaterThanOrEqual(80000);
    expect(r.shippingPaise).toBe(0);
  });

  it('picks the longest matching prefix, so Pune beats Maharashtra', () => {
    expect(repriceCart([line()], { pincode: '411001' }).zone.id).toBe('pune-local');
    expect(repriceCart([line()], { pincode: '431001' }).zone.id).toBe('maharashtra');
    expect(repriceCart([line()], { pincode: '560001' }).zone.id).toBe('rest-of-india');
  });

  it.each(['1234', '0110011', 'abcdef', '012345'])('refuses invalid pincode %p', (pin) => {
    expect(repriceCart([line()], { pincode: pin }).ok).toBe(false);
  });

  it('prices items without shipping when no pincode is given yet', () => {
    const r = repriceCart([line()]);
    expect(r.ok).toBe(true);
    expect(r.shippingPaise).toBe(0);
    expect(r.zone).toBeNull();
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
    const r = repriceCart([line({ qty: 3 }), { productId: withVariants.id, weight: withVariants.variants[0].weight, qty: 2 }], { pincode: '560001' });
    expect(r.ok).toBe(true);
    [r.itemsPaise, r.shippingPaise, r.totalPaise, ...r.lines.map((l) => l.unitPaise)].forEach((v) => {
      expect(Number.isInteger(v)).toBe(true);
    });
  });

  it('converts rupees to paise without float drift', () => {
    expect(toPaise(299)).toBe(29900);
    expect(toPaise(449)).toBe(44900);
    expect(toPaise(0.1 + 0.2)).toBe(30);
  });
});

/* The ₹1 live-payment test product. Its free delivery is the part that could be
   abused, so these pin the exact rule: waived alone, charged the moment anything
   real joins it. */
describe('the ₹1 test product (nj-dummy)', () => {
  const dummy = { productId: 'nj-dummy', weight: 'test', qty: 1 };

  it('charges exactly ₹1, Razorpay\'s minimum, with no delivery', () => {
    const r = repriceCart([dummy], { pincode: PIN_PUNE });
    expect(r.ok).toBe(true);
    expect(r.itemsPaise).toBe(100);
    expect(r.shippingPaise).toBe(0);
    expect(r.totalPaise).toBe(100);
  });

  it('waives delivery nationwide too, not just in Pune', () => {
    expect(repriceCart([dummy], { pincode: '560001' }).shippingPaise).toBe(0);
  });

  it('cannot be used to make a real order ship free', () => {
    const alone = repriceCart([line()], { pincode: PIN_PUNE });
    const withDummy = repriceCart([line(), dummy], { pincode: PIN_PUNE });
    expect(withDummy.ok).toBe(true);
    expect(withDummy.shippingPaise).toBe(alone.shippingPaise);
    expect(withDummy.shippingPaise).toBeGreaterThan(0);
  });
});
