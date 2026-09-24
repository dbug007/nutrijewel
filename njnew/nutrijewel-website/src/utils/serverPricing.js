/*
 * Server-side repricing. This is the only thing standing between the shop and
 * somebody charging themselves one rupee.
 *
 * The cart lives in localStorage and is entirely client-authored: `unitPrice` in
 * a cart line is whatever the browser says it is. So nothing here reads a price,
 * a name or a total from the request. The client sends only what it is allowed
 * to choose, `{productId, weight, qty}`, and every rupee is recomputed from
 * products.data.js, which is the same file the shop renders from.
 *
 * CommonJS on purpose: Cloudflare Pages Functions can require it, Jest can test
 * it, and it stays the one source of truth rather than a second implementation
 * that drifts from the first. Same reason scripts/create-static-routes.js can
 * require the catalogue.
 *
 * Money is in PAISE (integers) everywhere below. Rupee floats are for display
 * only. Razorpay wants paise, and integer arithmetic cannot drift the way
 * repeated float rounding does.
 */

const products = require('../data/products.data');
const { findZone, shippingPaiseFor, isValidPincode } = require('../data/shippingZones');

const MAX_LINES = 40;
const MAX_QTY_PER_LINE = 99;
const MAX_ORDER_PAISE = 50000000; // ₹5,00,000. A sanity ceiling, not a business rule.

/* Same rule as src/utils/productAvailability.js. Duplicated rather than imported
   because that file is ESM and this one has to stay require-able. If you change
   one, change both; productAvailability.test.js pins the behaviour. */
function isBuyable(product) {
  return !!product && !product.comingSoon && !product.outOfSeason && !product.priceOnRequest;
}

const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const findProduct = (id) => products.find((p) => p.id === id) || null;

/* Resolve the exact variant the customer picked. A weight that does not exist on
   the product is rejected rather than quietly falling back to the cheapest one,
   because silently charging for a different size than was chosen is its own bug. */
function resolveVariant(product, weight) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) {
    const wanted = String(weight || '').trim();
    if (wanted && product.weight && wanted !== product.weight) return null;
    return { weight: product.weight || 'one size', price: product.price, originalPrice: product.originalPrice };
  }
  const wanted = String(weight || '').trim();
  if (!wanted) return null;
  return variants.find((v) => v.weight === wanted) || null;
}

/*
 * Reprice a basket.
 *
 * rawLines: [{productId, weight, qty}] as posted by the browser. Anything else on
 * these objects is ignored, including prices.
 *
 * Returns { ok, errors, lines, itemsPaise, shippingPaise, totalPaise, zone }.
 * ok === false means do not create an order; `errors` says why, in terms safe to
 * show a customer.
 */
function repriceCart(rawLines, { pincode } = {}) {
  const errors = [];
  const lines = [];

  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    return { ok: false, errors: ['Your cart is empty.'], lines: [], itemsPaise: 0, shippingPaise: 0, totalPaise: 0, zone: null };
  }
  if (rawLines.length > MAX_LINES) {
    return { ok: false, errors: [`A single order cannot have more than ${MAX_LINES} different items.`], lines: [], itemsPaise: 0, shippingPaise: 0, totalPaise: 0, zone: null };
  }

  let itemsPaise = 0;

  rawLines.forEach((raw, i) => {
    const at = `Item ${i + 1}`;
    const productId = raw && typeof raw.productId === 'string' ? raw.productId : null;
    if (!productId) { errors.push(`${at}: missing product.`); return; }

    const product = findProduct(productId);
    if (!product) { errors.push(`${at}: we no longer sell that product.`); return; }

    /* The bug that already reached production once: out-of-season items and a
       zero-priced focaccia were addable to the cart. Checked here too, so a
       hand-made request cannot do what the UI no longer allows. */
    if (!isBuyable(product)) {
      errors.push(`${product.displayName || product.name} is not available to order right now.`);
      return;
    }

    const variant = resolveVariant(product, raw && raw.weight);
    if (!variant) { errors.push(`${product.displayName || product.name}: that size is no longer available.`); return; }

    const unitPaise = toPaise(variant.price);
    if (!Number.isFinite(unitPaise) || unitPaise <= 0) {
      errors.push(`${product.displayName || product.name}: price unavailable, please contact us.`);
      return;
    }

    /* Reject a fractional quantity rather than flooring it. Flooring is safe for
       the money but silently sells someone less than they asked for, and no
       honest client ever sends 1.5. */
    const qty = Number(raw && raw.qty);
    if (!Number.isInteger(qty) || qty < 1) { errors.push(`${at}: invalid quantity.`); return; }
    if (qty > MAX_QTY_PER_LINE) { errors.push(`${product.displayName || product.name}: maximum ${MAX_QTY_PER_LINE} per order.`); return; }

    const linePaise = unitPaise * qty;
    itemsPaise += linePaise;

    lines.push({
      productId: product.id,
      name: product.displayName || product.name,
      weight: variant.weight,
      qty,
      unitPaise,
      linePaise,
      // carried for the order record, never used in arithmetic
      mrpPaise: variant.originalPrice != null ? toPaise(variant.originalPrice) : null,
      freeShipping: !!product.freeShipping,
    });
  });

  if (errors.length) {
    return { ok: false, errors, lines, itemsPaise: 0, shippingPaise: 0, totalPaise: 0, zone: null };
  }

  let zone = null;
  let shippingPaise = 0;
  if (pincode != null && String(pincode).trim() !== '') {
    if (!isValidPincode(pincode)) {
      return { ok: false, errors: ['Enter a valid 6 digit pincode.'], lines, itemsPaise, shippingPaise: 0, totalPaise: 0, zone: null };
    }
    zone = findZone(pincode);
    if (!zone || !zone.serviceable) {
      return { ok: false, errors: ['We do not deliver to that pincode yet. Message us on WhatsApp and we will see what we can do.'], lines, itemsPaise, shippingPaise: 0, totalPaise: 0, zone };
    }
    /* A product flagged freeShipping (only the ₹1 payment test) waives delivery,
       but only when EVERY line in the cart carries the flag. Otherwise adding the
       test item to a real order would make the whole order ship free. */
    const allFreeShipping = lines.length > 0 && lines.every((l) => l.freeShipping);
    shippingPaise = allFreeShipping ? 0 : shippingPaiseFor(zone, itemsPaise);
  }

  const totalPaise = itemsPaise + shippingPaise;
  if (totalPaise > MAX_ORDER_PAISE) {
    return { ok: false, errors: ['That order is too large to place online. Please contact us directly.'], lines, itemsPaise, shippingPaise, totalPaise: 0, zone };
  }

  return { ok: true, errors: [], lines, itemsPaise, shippingPaise, totalPaise, zone };
}

module.exports = {
  MAX_LINES,
  MAX_QTY_PER_LINE,
  MAX_ORDER_PAISE,
  toPaise,
  isBuyable,
  resolveVariant,
  repriceCart,
};
