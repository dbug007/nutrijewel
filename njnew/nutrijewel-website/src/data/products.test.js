import { products, allProducts } from './products';
import { isBuyable } from '../utils/productAvailability';
const { isHamperable } = require('../utils/hamperPricing');

/* Hidden products must be reachable by URL and invisible everywhere else. */
describe('hidden products', () => {
  const dummy = allProducts.find((p) => p.id === 'nj-dummy');

  it('still exists, so /products/nj-dummy resolves', () => {
    expect(dummy).toBeDefined();
  });

  it('is left out of the list every shop page reads', () => {
    expect(products.map((p) => p.id)).not.toContain('nj-dummy');
  });

  it('is left out of hampers', () => {
    expect(isHamperable(dummy)).toBe(false);
  });

  it('is still buyable, since buying it is the whole point', () => {
    expect(isBuyable(dummy)).toBe(true);
  });

  it('hides nothing else: every other product is still listed', () => {
    expect(products.length).toBe(allProducts.filter((p) => !p.hidden).length);
    expect(allProducts.filter((p) => p.hidden).map((p) => p.id)).toEqual(['nj-dummy']);
  });
});
