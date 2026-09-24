const products = require('../data/products.data');
const { isBuyable, availabilityLabel } = require('./productAvailability');

const byId = (id) => products.find((p) => p.id === id);

describe('isBuyable', () => {
  it('allows an ordinary product', () => {
    expect(isBuyable({ id: 'x', price: 100 })).toBe(true);
  });

  it.each(['comingSoon', 'outOfSeason', 'priceOnRequest'])('refuses %s', (flag) => {
    expect(isBuyable({ id: 'x', price: 100, [flag]: true })).toBe(false);
  });

  it('refuses nothing at all', () => {
    expect(isBuyable(null)).toBe(false);
    expect(isBuyable(undefined)).toBe(false);
  });
});

describe('availabilityLabel', () => {
  it('returns null for a product on sale, so callers fall back to the price', () => {
    expect(availabilityLabel({ id: 'x', price: 100 })).toBeNull();
  });

  it('names the reason', () => {
    expect(availabilityLabel({ comingSoon: true })).toBe('Coming soon');
    expect(availabilityLabel({ priceOnRequest: true })).toBe('Price on request');
    expect(availabilityLabel({ outOfSeason: true })).toBe('Off season, ask us');
  });
});

/* These were live on nutrijewel.com with a working Add to Cart, one of them at
   zero. Pinned by id so they cannot quietly become buyable again. */
describe('the parked products stay unbuyable', () => {
  it.each(['plum-cake', 'maharaja-cake', 'focaccia-bread'])('%s', (id) => {
    const product = byId(id);
    expect(product).toBeDefined();
    expect(isBuyable(product)).toBe(false);
    expect(availabilityLabel(product)).not.toBeNull();
  });
});

/* Hummus came off the seasonal shelf on the owner's word, at the price it last
   sold for. Pinned so a stray edit to the price or the flag is noticed. */
it('hummus is back in Dips & Spreads at Rs 250 for 200g', () => {
  const hummus = byId('hummus');
  expect(isBuyable(hummus)).toBe(true);
  expect(hummus.category).toBe('Dips & Spreads');
  expect(hummus.price).toBe(250);
  expect(hummus.weight).toBe('200g');
});

/* Anything still buyable needs a real price, or it reaches the cart at zero. */
it('every buyable product has a price above zero', () => {
  const buyable = products.filter(isBuyable);
  expect(buyable.length).toBeGreaterThan(0);
  buyable.forEach((p) => {
    const lowest = p.variants && p.variants.length
      ? Math.min(...p.variants.map((v) => v.price))
      : p.price;
    expect(typeof lowest).toBe('number');
    expect(lowest).toBeGreaterThan(0);
  });
});
