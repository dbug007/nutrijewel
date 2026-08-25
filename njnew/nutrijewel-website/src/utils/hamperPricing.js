/* Hamper pricing engine. Pure functions only, no React, no DOM, no side effects,
   so it can be unit tested and (later) required by the SEO prerender script.

   Pricing model (locked with the owner):
     total = itemsTotal + boxPrice - discount
   where `discount` is a percentage of itemsTotal ONLY. The box/packaging fee is
   never discounted, which protects packaging margin at every tier. */

/* Resolve which variant of a product a given weight refers to.
   Falls back to the lowest-priced variant, then to the product's base price -
   so a stale preset weight can never produce NaN or crash the builder. */
function resolveVariant(product, weight) {
  if (!product) return null;

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const exact = product.variants.find((v) => v.weight === weight);
    if (exact) return exact;
    return product.variants.reduce(
      (lowest, v) => (v.price < lowest.price ? v : lowest),
      product.variants[0]
    );
  }

  return {
    weight: product.weight,
    price: product.price,
    originalPrice: product.originalPrice,
  };
}

/* Build a hamper line from a product + chosen weight. Mirrors the cart line shape
   used by StoreContext.addToCart so the two stay readable side by side.

   `opts.packing` is a resolved packing option object, this module stays free of
   the packing catalog, so resolution lives in src/data/hampers.js. */
function makeHamperLine(product, weight, qty = 1, opts = {}) {
  if (!product) return null;
  const variant = resolveVariant(product, weight);
  if (!variant) return null;

  const packing = opts.packing || null;
  const ribbon = !!opts.ribbon;

  return {
    key: `${product.id}__${variant.weight}`,
    productId: product.id,
    name: product.displayName || product.name,
    image: product.image || (product.images && product.images[0]) || null,
    category: product.category,
    weight: variant.weight,
    unitPrice: variant.price || 0,
    originalPrice: variant.originalPrice != null ? variant.originalPrice : variant.price || 0,
    qty: Math.max(1, Math.round(qty || 1)),
    isImported: !!product.isImported,
    origin: product.origin || null,
    flag: product.flag || null,
    // packing
    packingId: packing ? packing.id : null,
    packingName: packing ? packing.name : null,
    packingPrice: packing && Number.isFinite(packing.price) ? packing.price : 0,
    ribbon,
    ribbonPrice: ribbon && Number.isFinite(opts.ribbonPrice) ? opts.ribbonPrice : 0,
  };
}

/* What one unit of a line costs in packaging (packing + optional ribbon). */
function linePackingUnitCost(line) {
  if (!line) return 0;
  const packing = Number.isFinite(line.packingPrice) ? line.packingPrice : 0;
  const ribbon = line.ribbon && Number.isFinite(line.ribbonPrice) ? line.ribbonPrice : 0;
  return packing + ribbon;
}

/* The core calculation. Everything the builder UI needs, in one object.

   `extras` carries the hamper-level choices: { containerStyle, noteOption }.
   Both are optional so older three-argument calls still work. */
function computeHamperPricing(lines, boxTier, offerTiers, extras = {}) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const slots = boxTier && Number.isFinite(boxTier.slots) ? boxTier.slots : 0;
  const boxPrice = boxTier && Number.isFinite(boxTier.boxPrice) ? boxTier.boxPrice : 0;

  const containerStyle = extras.containerStyle || null;
  const noteOption = extras.noteOption || null;
  const containerStylePrice =
    containerStyle && Number.isFinite(containerStyle.price) ? containerStyle.price : 0;
  const notePrice = noteOption && Number.isFinite(noteOption.price) ? noteOption.price : 0;

  const tiers = Array.isArray(offerTiers)
    ? offerTiers.slice().sort((a, b) => a.minItemsTotal - b.minItemsTotal)
    : [];

  const itemsTotal = safeLines.reduce((sum, l) => sum + (l.unitPrice || 0) * (l.qty || 0), 0);
  const mrpTotal = safeLines.reduce((sum, l) => {
    const mrp = l.originalPrice != null ? l.originalPrice : l.unitPrice;
    return sum + (mrp || 0) * (l.qty || 0);
  }, 0);
  const slotsUsed = safeLines.reduce((sum, l) => sum + (l.qty || 0), 0);

  // Per-item packing and ribbons. Never discounted, same rule as the box fee.
  const packingTotal = safeLines.reduce(
    (sum, l) => sum + linePackingUnitCost(l) * (l.qty || 0),
    0
  );
  const containerTotal = boxPrice + containerStylePrice;

  // Highest qualifying tier wins, tiers are ascending, so the last match is the best.
  let appliedOffer = null;
  tiers.forEach((tier) => {
    if (itemsTotal >= tier.minItemsTotal) appliedOffer = tier;
  });

  const discount = appliedOffer ? Math.round((itemsTotal * appliedOffer.percent) / 100) : 0;
  const nextOffer = tiers.find((tier) => itemsTotal < tier.minItemsTotal) || null;
  const amountToNextOffer = nextOffer ? nextOffer.minItemsTotal - itemsTotal : 0;

  const mrpSavings = Math.max(0, mrpTotal - itemsTotal);

  return {
    itemsTotal,
    mrpTotal,
    boxPrice,
    containerStylePrice,
    containerTotal,
    packingTotal,
    notePrice,
    containerStyle,
    noteOption,
    appliedOffer,
    discount,
    nextOffer,
    amountToNextOffer,
    total: itemsTotal + packingTotal + containerTotal + notePrice - discount,
    // Everything that isn't the products themselves, for a single "presentation" bill line.
    presentationTotal: packingTotal + containerTotal + notePrice,
    // One honest "you save" figure: the tier discount plus what they save against MRP.
    savings: mrpSavings + discount,
    mrpSavings,
    slots,
    slotsUsed,
    slotsLeft: Math.max(0, slots - slotsUsed),
    isFull: slots > 0 && slotsUsed >= slots,
    isEmpty: slotsUsed === 0,
    // 0..1 fill for the "unlock the next offer" progress bar.
    offerProgress: nextOffer && nextOffer.minItemsTotal > 0
      ? Math.min(1, itemsTotal / nextOffer.minItemsTotal)
      : 1,
  };
}

/* Turn a preset's { productId, weight, qty } items into real priced lines
   against the live catalog. Unknown ids are dropped rather than throwing, so a
   product removed from products.data.js degrades a preset instead of breaking the page. */
function resolvePresetLines(preset, products, resolvePacking) {
  if (!preset || !Array.isArray(preset.items) || !Array.isArray(products)) return [];

  return preset.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.comingSoon) return null;
      const packing = typeof resolvePacking === 'function' ? resolvePacking(product) : null;
      return makeHamperLine(product, item.weight, item.qty, { packing });
    })
    .filter(Boolean);
}

/* Products that are allowed into a hamper: in stock, and not on the excluded list. */
function getHamperEligibleProducts(products, excludedIds) {
  if (!Array.isArray(products)) return [];
  const excluded = Array.isArray(excludedIds) ? excludedIds : [];
  return products.filter((p) => p && !p.comingSoon && !excluded.includes(p.id));
}

/* Indian-format currency for display: 1616 -> "₹1,616" */
function formatINR(amount) {
  const n = Number.isFinite(amount) ? amount : 0;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

module.exports = {
  resolveVariant,
  makeHamperLine,
  linePackingUnitCost,
  computeHamperPricing,
  resolvePresetLines,
  getHamperEligibleProducts,
  formatINR,
};
