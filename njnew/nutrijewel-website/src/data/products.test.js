import { products, allProducts } from './products';
const { isHamperable } = require('../utils/hamperPricing');

/* `hidden` keeps a product reachable by URL but out of every listing. It was
   built for the ₹1 live-payment test and kept for the next one. These test the
   mechanism, not any particular product. */
describe('hidden products', () => {
  it('the shop list is exactly the full list minus anything hidden', () => {
    expect(products.map((p) => p.id)).toEqual(allProducts.filter((p) => !p.hidden).map((p) => p.id));
  });

  it('nothing is hidden right now, so the shop shows the whole catalogue', () => {
    expect(allProducts.filter((p) => p.hidden)).toEqual([]);
    expect(products.length).toBe(allProducts.length);
  });

  it('keeps a hidden product out of hampers', () => {
    const buyable = allProducts.find((p) => !p.outOfSeason && !p.comingSoon && !p.priceOnRequest);
    expect(isHamperable(buyable)).toBe(true);
    expect(isHamperable({ ...buyable, hidden: true })).toBe(false);
  });

  it('the ₹1 test product is gone', () => {
    expect(allProducts.find((p) => p.id === 'nj-dummy')).toBeUndefined();
  });
});
