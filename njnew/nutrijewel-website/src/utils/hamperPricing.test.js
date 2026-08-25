const {
  resolveVariant,
  makeHamperLine,
  linePackingUnitCost,
  computeHamperPricing,
  resolvePresetLines,
  getHamperEligibleProducts,
  formatINR,
} = require('./hamperPricing');

const OFFER_TIERS = [
  { id: 'tier-1', minItemsTotal: 1500, percent: 5 },
  { id: 'tier-2', minItemsTotal: 2500, percent: 10 },
  { id: 'tier-3', minItemsTotal: 4000, percent: 15 },
];

const CLASSIC = { id: 'classic', slots: 5, boxPrice: 249 };

const PRODUCT_WITH_VARIANTS = {
  id: 'granola',
  displayName: 'NJ Signature Granola',
  category: 'Healthy Snacks',
  image: '/images/granola.jpg',
  price: 999,
  originalPrice: 1119,
  weight: '500g',
  variants: [
    { weight: '250g', price: 549, originalPrice: 615 },
    { weight: '500g', price: 999, originalPrice: 1200 },
    { weight: '1kg', price: 1998, originalPrice: 2400 },
  ],
};

const PRODUCT_NO_VARIANTS = {
  id: 'millet-crunch',
  displayName: 'Foxnut & Millet Crunch',
  category: 'Healthy Snacks',
  image: '/images/foxnutmilletcrunch.jpg',
  price: 299,
  originalPrice: 350,
  weight: '250g',
};

const line = (unitPrice, qty = 1, originalPrice = unitPrice) => ({
  unitPrice,
  qty,
  originalPrice,
});

const PACKING_TIN = { id: 'ladoo-tin', name: 'Premium tin', price: 129 };
const PACKING_FREE = { id: 'ladoo-plastic', name: 'Plastic box', price: 0, isDefault: true };
const TRAY = { id: 'tray', name: 'Wooden tray', price: 199 };
const NOTE_CARD = { id: 'card', name: 'Greeting card', price: 59 };

describe('resolveVariant', () => {
  it('finds the exact weight', () => {
    expect(resolveVariant(PRODUCT_WITH_VARIANTS, '1kg').price).toBe(1998);
  });

  it('falls back to the lowest-priced variant for an unknown weight', () => {
    expect(resolveVariant(PRODUCT_WITH_VARIANTS, '7kg').price).toBe(549);
  });

  it('uses the base price for a product with no variants', () => {
    expect(resolveVariant(PRODUCT_NO_VARIANTS, '250g')).toEqual({
      weight: '250g',
      price: 299,
      originalPrice: 350,
    });
  });

  it('returns null for a missing product', () => {
    expect(resolveVariant(null, '500g')).toBeNull();
  });
});

describe('makeHamperLine', () => {
  it('builds a priced line keyed by product and weight', () => {
    const l = makeHamperLine(PRODUCT_WITH_VARIANTS, '500g', 2);
    expect(l).toMatchObject({
      key: 'granola__500g',
      productId: 'granola',
      weight: '500g',
      unitPrice: 999,
      originalPrice: 1200,
      qty: 2,
      isImported: false,
    });
  });

  it('clamps quantity to at least 1', () => {
    expect(makeHamperLine(PRODUCT_NO_VARIANTS, '250g', 0).qty).toBe(1);
    expect(makeHamperLine(PRODUCT_NO_VARIANTS, '250g', -4).qty).toBe(1);
  });

  it('carries imported metadata through', () => {
    const l = makeHamperLine(
      { id: 'imp-x', name: 'Imported Thing', price: 500, weight: '100g', isImported: true, origin: 'Italy', flag: '🇮🇹' },
      '100g'
    );
    expect(l).toMatchObject({ isImported: true, origin: 'Italy', flag: '🇮🇹' });
  });

  it('returns null for a missing product', () => {
    expect(makeHamperLine(null, '500g')).toBeNull();
  });
});

describe('computeHamperPricing, empty hamper', () => {
  const p = computeHamperPricing([], CLASSIC, OFFER_TIERS);

  it('charges nothing for items but still reports the box price', () => {
    expect(p.itemsTotal).toBe(0);
    expect(p.boxPrice).toBe(249);
    expect(p.total).toBe(249);
  });

  it('applies no offer and reports the first tier as next', () => {
    expect(p.appliedOffer).toBeNull();
    expect(p.discount).toBe(0);
    expect(p.nextOffer.id).toBe('tier-1');
    expect(p.amountToNextOffer).toBe(1500);
  });

  it('reports empty, not full', () => {
    expect(p.isEmpty).toBe(true);
    expect(p.isFull).toBe(false);
    expect(p.slotsLeft).toBe(5);
  });
});

describe('computeHamperPricing, tier boundaries', () => {
  it('applies no discount just below the first tier', () => {
    const p = computeHamperPricing([line(1499)], CLASSIC, OFFER_TIERS);
    expect(p.appliedOffer).toBeNull();
    expect(p.discount).toBe(0);
    expect(p.amountToNextOffer).toBe(1);
  });

  it('applies 5% exactly at the first tier', () => {
    const p = computeHamperPricing([line(1500)], CLASSIC, OFFER_TIERS);
    expect(p.appliedOffer.id).toBe('tier-1');
    expect(p.discount).toBe(75);
    expect(p.total).toBe(1500 + 249 - 75);
  });

  it('applies 10% exactly at the second tier', () => {
    const p = computeHamperPricing([line(2500)], CLASSIC, OFFER_TIERS);
    expect(p.appliedOffer.id).toBe('tier-2');
    expect(p.discount).toBe(250);
  });

  it('applies the highest qualifying tier, not the first match', () => {
    const p = computeHamperPricing([line(5000)], CLASSIC, OFFER_TIERS);
    expect(p.appliedOffer.id).toBe('tier-3');
    expect(p.discount).toBe(750);
    expect(p.nextOffer).toBeNull();
    expect(p.amountToNextOffer).toBe(0);
    expect(p.offerProgress).toBe(1);
  });

  it('sorts unsorted tiers before evaluating', () => {
    const shuffled = [OFFER_TIERS[2], OFFER_TIERS[0], OFFER_TIERS[1]];
    const p = computeHamperPricing([line(2600)], CLASSIC, shuffled);
    expect(p.appliedOffer.id).toBe('tier-2');
  });
});

describe('computeHamperPricing, the box fee is never discounted', () => {
  it('discounts only itemsTotal, leaving boxPrice whole', () => {
    const p = computeHamperPricing([line(4000)], CLASSIC, OFFER_TIERS);
    // 15% of 4000 = 600, taken off items only
    expect(p.discount).toBe(600);
    expect(p.total).toBe(4000 + 249 - 600);
    // Sanity: a discount on (items + box) would have been 636, giving 3613.
    expect(p.total).not.toBe(Math.round((4000 + 249) * 0.85));
  });
});

describe('computeHamperPricing, savings', () => {
  it('adds MRP savings to the tier discount', () => {
    // items 1600 against MRP 2000 => 400 MRP saving, plus 5% of 1600 = 80
    const p = computeHamperPricing([line(1600, 1, 2000)], CLASSIC, OFFER_TIERS);
    expect(p.mrpSavings).toBe(400);
    expect(p.discount).toBe(80);
    expect(p.savings).toBe(480);
  });

  it('never reports negative MRP savings when a price exceeds its MRP', () => {
    const p = computeHamperPricing([line(900, 1, 500)], CLASSIC, OFFER_TIERS);
    expect(p.mrpSavings).toBe(0);
  });

  it('multiplies savings by quantity', () => {
    const p = computeHamperPricing([line(300, 3, 400)], CLASSIC, OFFER_TIERS);
    expect(p.itemsTotal).toBe(900);
    expect(p.mrpSavings).toBe(300);
  });
});

describe('computeHamperPricing, slots and capacity', () => {
  it('counts quantity, not line count, against slots', () => {
    const p = computeHamperPricing([line(100, 4)], CLASSIC, OFFER_TIERS);
    expect(p.slotsUsed).toBe(4);
    expect(p.slotsLeft).toBe(1);
    expect(p.isFull).toBe(false);
  });

  it('is full exactly at capacity', () => {
    const p = computeHamperPricing([line(100, 5)], CLASSIC, OFFER_TIERS);
    expect(p.isFull).toBe(true);
    expect(p.slotsLeft).toBe(0);
  });

  it('never reports negative slots left when over capacity', () => {
    const p = computeHamperPricing([line(100, 9)], CLASSIC, OFFER_TIERS);
    expect(p.isFull).toBe(true);
    expect(p.slotsLeft).toBe(0);
  });
});

describe('computeHamperPricing, defensive inputs', () => {
  it('survives null lines, null box and null tiers', () => {
    const p = computeHamperPricing(null, null, null);
    expect(p.itemsTotal).toBe(0);
    expect(p.boxPrice).toBe(0);
    expect(p.total).toBe(0);
    expect(p.appliedOffer).toBeNull();
    expect(p.nextOffer).toBeNull();
    expect(p.isFull).toBe(false);
  });

  it('treats lines with missing numbers as zero rather than NaN', () => {
    const p = computeHamperPricing([{}, { qty: 2 }, { unitPrice: 500 }], CLASSIC, OFFER_TIERS);
    expect(p.itemsTotal).toBe(0);
    expect(Number.isNaN(p.total)).toBe(false);
  });
});

describe('makeHamperLine, packing', () => {
  it('stores the chosen packing on the line', () => {
    const l = makeHamperLine(PRODUCT_NO_VARIANTS, '250g', 1, { packing: PACKING_TIN });
    expect(l).toMatchObject({
      packingId: 'ladoo-tin',
      packingName: 'Premium tin',
      packingPrice: 129,
      ribbon: false,
      ribbonPrice: 0,
    });
  });

  it('records a ribbon and its price only when asked for', () => {
    const withRibbon = makeHamperLine(PRODUCT_NO_VARIANTS, '250g', 1, {
      packing: PACKING_FREE, ribbon: true, ribbonPrice: 25,
    });
    expect(withRibbon).toMatchObject({ ribbon: true, ribbonPrice: 25 });

    const without = makeHamperLine(PRODUCT_NO_VARIANTS, '250g', 1, {
      packing: PACKING_FREE, ribbon: false, ribbonPrice: 25,
    });
    expect(without).toMatchObject({ ribbon: false, ribbonPrice: 0 });
  });

  it('defaults to no packing when none is given', () => {
    const l = makeHamperLine(PRODUCT_NO_VARIANTS, '250g');
    expect(l).toMatchObject({ packingId: null, packingPrice: 0, ribbon: false });
  });
});

describe('linePackingUnitCost', () => {
  it('adds packing and ribbon for one unit', () => {
    expect(linePackingUnitCost({ packingPrice: 129, ribbon: true, ribbonPrice: 25 })).toBe(154);
  });

  it('ignores the ribbon price when there is no ribbon', () => {
    expect(linePackingUnitCost({ packingPrice: 129, ribbon: false, ribbonPrice: 25 })).toBe(129);
  });

  it('treats missing values as zero', () => {
    expect(linePackingUnitCost({})).toBe(0);
    expect(linePackingUnitCost(null)).toBe(0);
  });
});

describe('computeHamperPricing, packing, container style and note', () => {
  const packed = (unitPrice, qty, packingPrice, ribbon) => ({
    unitPrice, qty, originalPrice: unitPrice, packingPrice, ribbon, ribbonPrice: ribbon ? 25 : 0,
  });

  it('charges packing per unit, not per line', () => {
    const p = computeHamperPricing([packed(500, 3, 129, false)], CLASSIC, OFFER_TIERS);
    expect(p.packingTotal).toBe(387);
    expect(p.total).toBe(1500 + 387 + 249 - 75); // 5% tier applies to items only
  });

  it('includes ribbons in the packing total', () => {
    const p = computeHamperPricing([packed(500, 2, 129, true)], CLASSIC, OFFER_TIERS);
    expect(p.packingTotal).toBe((129 + 25) * 2);
  });

  it('never discounts packing', () => {
    const p = computeHamperPricing([packed(4000, 1, 500, false)], CLASSIC, OFFER_TIERS);
    expect(p.discount).toBe(600); // 15% of the 4000 items only
    expect(p.total).toBe(4000 + 500 + 249 - 600);
  });

  it('adds the container style on top of the box tier price', () => {
    const p = computeHamperPricing([line(1000)], CLASSIC, OFFER_TIERS, { containerStyle: TRAY });
    expect(p.containerStylePrice).toBe(199);
    expect(p.containerTotal).toBe(249 + 199);
    expect(p.total).toBe(1000 + 249 + 199);
  });

  it('adds the note price', () => {
    const p = computeHamperPricing([line(1000)], CLASSIC, OFFER_TIERS, { noteOption: NOTE_CARD });
    expect(p.notePrice).toBe(59);
    expect(p.total).toBe(1000 + 249 + 59);
  });

  it('rolls packing, container and note into presentationTotal', () => {
    const p = computeHamperPricing([packed(1000, 1, 100, true)], CLASSIC, OFFER_TIERS, {
      containerStyle: TRAY,
      noteOption: NOTE_CARD,
    });
    expect(p.packingTotal).toBe(125);
    expect(p.containerTotal).toBe(448);
    expect(p.notePrice).toBe(59);
    expect(p.presentationTotal).toBe(125 + 448 + 59);
    expect(p.total).toBe(1000 + p.presentationTotal);
  });

  it('leaves the discount threshold based on items alone, ignoring presentation', () => {
    // Items 1400 + heavy presentation would clear 1500, but the tier must not apply.
    const p = computeHamperPricing([packed(1400, 1, 400, true)], CLASSIC, OFFER_TIERS, {
      containerStyle: TRAY, noteOption: NOTE_CARD,
    });
    expect(p.appliedOffer).toBeNull();
    expect(p.discount).toBe(0);
  });

  it('stays backwards compatible with three-argument calls', () => {
    const p = computeHamperPricing([line(1000)], CLASSIC, OFFER_TIERS);
    expect(p.packingTotal).toBe(0);
    expect(p.containerStylePrice).toBe(0);
    expect(p.notePrice).toBe(0);
    expect(p.containerTotal).toBe(249);
    expect(p.total).toBe(1249);
  });

  it('survives null extras', () => {
    const p = computeHamperPricing([line(1000)], CLASSIC, OFFER_TIERS, {
      containerStyle: null, noteOption: null,
    });
    expect(Number.isNaN(p.total)).toBe(false);
    expect(p.total).toBe(1249);
  });
});

describe('resolvePresetLines', () => {
  const catalog = [
    PRODUCT_WITH_VARIANTS,
    PRODUCT_NO_VARIANTS,
    { id: 'sattu-ladoo', name: 'Sattu Ladoo', price: 0, weight: 'Coming soon', comingSoon: true },
  ];

  it('resolves preset items into priced lines', () => {
    const lines = resolvePresetLines(
      { items: [{ productId: 'granola', weight: '250g', qty: 1 }, { productId: 'millet-crunch', weight: '250g', qty: 2 }] },
      catalog
    );
    expect(lines).toHaveLength(2);
    expect(lines[0].unitPrice).toBe(549);
    expect(lines[1].qty).toBe(2);
  });

  it('drops unknown product ids instead of throwing', () => {
    const lines = resolvePresetLines(
      { items: [{ productId: 'does-not-exist', weight: '1kg', qty: 1 }, { productId: 'granola', weight: '500g', qty: 1 }] },
      catalog
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].productId).toBe('granola');
  });

  it('drops coming-soon products', () => {
    const lines = resolvePresetLines({ items: [{ productId: 'sattu-ladoo', weight: 'Coming soon', qty: 1 }] }, catalog);
    expect(lines).toHaveLength(0);
  });

  it('applies the packing resolver when one is supplied', () => {
    const lines = resolvePresetLines(
      { items: [{ productId: 'granola', weight: '250g', qty: 1 }] },
      catalog,
      () => PACKING_TIN
    );
    expect(lines[0]).toMatchObject({ packingId: 'ladoo-tin', packingPrice: 129 });
  });

  it('leaves packing empty when no resolver is supplied', () => {
    const lines = resolvePresetLines(
      { items: [{ productId: 'granola', weight: '250g', qty: 1 }] },
      catalog
    );
    expect(lines[0].packingPrice).toBe(0);
  });

  it('returns an empty array for malformed input', () => {
    expect(resolvePresetLines(null, catalog)).toEqual([]);
    expect(resolvePresetLines({ items: 'nope' }, catalog)).toEqual([]);
    expect(resolvePresetLines({ items: [] }, null)).toEqual([]);
  });
});

describe('getHamperEligibleProducts', () => {
  const catalog = [
    { id: 'granola' },
    { id: 'sattu-ladoo', comingSoon: true },
    { id: 'hummus' },
    { id: 'guac-quack' },
  ];

  it('removes coming-soon and explicitly excluded products', () => {
    const eligible = getHamperEligibleProducts(catalog, ['hummus', 'guac-quack']);
    expect(eligible.map((p) => p.id)).toEqual(['granola']);
  });

  it('handles a missing exclusion list', () => {
    expect(getHamperEligibleProducts(catalog, null).map((p) => p.id)).toEqual([
      'granola',
      'hummus',
      'guac-quack',
    ]);
  });

  it('returns an empty array for a missing catalog', () => {
    expect(getHamperEligibleProducts(null, [])).toEqual([]);
  });
});

describe('formatINR', () => {
  it('groups digits in the Indian system', () => {
    expect(formatINR(1616)).toBe('₹1,616');
    expect(formatINR(123456)).toBe('₹1,23,456');
  });

  it('rounds and handles junk input', () => {
    expect(formatINR(99.6)).toBe('₹100');
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(undefined)).toBe('₹0');
    expect(formatINR(NaN)).toBe('₹0');
  });
});
