/*
 * One place that decides whether a product can be sold right now.
 *
 * Three flags in products.data.js take a product off sale, for different reasons:
 *   comingSoon      not launched yet
 *   outOfSeason     real product, parked until its season comes round
 *   priceOnRequest  sold, but quoted per order
 *
 * All three mean the same thing at the till: no cart, no checkout, enquiry only.
 * Import this rather than re-testing the flags, so a new surface cannot get it
 * half right and leave something buyable at the wrong price (or at zero).
 */

export function isBuyable(product) {
  return !!product && !product.comingSoon && !product.outOfSeason && !product.priceOnRequest;
}

/* Short label for a price slot when there is no price to show. Returns null for
   a normal product, so callers can fall back to rendering the real price. */
export function availabilityLabel(product) {
  if (!product) return null;
  if (product.comingSoon) return 'Coming soon';
  if (product.priceOnRequest) return 'Price on request';
  if (product.outOfSeason) return 'Off season, ask us';
  return null;
}
