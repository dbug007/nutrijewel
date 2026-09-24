import rawProducts from './products.data';

/* Gallery images. This used to return [image, image], which threw away every
   authored gallery array and made every product show the same photo twice with
   a second dot that went nowhere. Honour what the product actually declares,
   and fall back to the single hero image, so a product with one photo gets a
   one-image gallery and no phantom dot. */
const normalizeProductImages = (product) => {
  const authored = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const images = authored.length ? authored : (product.image ? [product.image] : []);
  return { ...product, images };
};

/* Allergen "Contains" info per product. ⚠️ OWNER: please review and complete these,
   only clearly-evident allergens are pre-filled. A shared-kitchen cross-contamination
   advisory is shown on every product page regardless of this map. */
const ALLERGENS = {
  'peanut-butter':    ['Peanuts'],
  'nj-almond-butter': ['Tree nuts (almond)'],
  'liquid-gold':      ['Tree nuts', 'Dairy'],
  'golden-bites':     ['Dairy (ghee)'],
  'cambridge-cake':   ['Tree nuts (walnut)', 'Wheat (gluten)', 'Dairy'],
  'bliss-bites':      ['Tree nuts'],
  'amrit-bites':      ['Tree nuts', 'Dairy (ghee)'],
  'ragi-sattva':      ['Tree nuts', 'Dairy (ghee)'],
  'maharaja-cake':    ['Tree nuts', 'Dairy'],
  'plum-cake':        ['Tree nuts', 'Wheat (gluten)', 'Dairy'],
  'granola':          ['Tree nuts'],
  'granola-cookies':  ['Tree nuts', 'Wheat (gluten)'],
  'nutri-bars':       ['Tree nuts'],
  'focaccia-bread':   ['Wheat (gluten)'],
  'hummus':           ['Sesame (tahini)'],
  'panchamrit-cake':  ['Wheat (gluten)', 'Dairy'],
  'panchamrit-muffin':['Wheat (gluten)', 'Dairy'],
  'millet-midnight-muffin': ['Dairy'],
  'walnana-muffin':   ['Tree nuts (walnut)', 'Dairy'],
  'rustic-ragi-bread':['Sesame (seeds)'],
};

/* Nutrition facts per product. ⚠️ OWNER: share real values and I'll fill these in (or edit here).
   Shape: { serving: 'Per 100g', items: [{ label: 'Energy', value: '450 kcal' }, ...] }
   Until a product has an entry here, the page shows a tasteful "coming soon" note. */
const NUTRITION = {
  // 'granola': {
  //   serving: 'Per 100g',
  //   items: [
  //     { label: 'Energy', value: '— kcal' },
  //     { label: 'Protein', value: '— g' },
  //     { label: 'Carbohydrate', value: '— g' },
  //     { label: 'of which sugars', value: '— g' },
  //     { label: 'Total Fat', value: '— g' },
  //     { label: 'Dietary Fibre', value: '— g' },
  //   ],
  // },
};

/* Every product, including hidden ones. Only for resolving a product by its URL,
   so a hidden test product still has a working page at /products/<id>. */
export const allProducts = rawProducts
  .map(normalizeProductImages)
  .map((product) => ({
    ...product,
    allergens: ALLERGENS[product.id] || [],
    nutrition: NUTRITION[product.id] || null,
  }));

/* What the shop shows. `hidden` products (the ₹1 payment test) never appear in a
   listing, a shelf, related products or hampers, because everything that lists
   products reads this, not allProducts. */
export const products = allProducts.filter((p) => !p.hidden);

export const topSellers = products.filter(product => product.isTopSeller);

export const categories = [
  'All Products',
  'Best Sellers',
  'Chef\'s Specials',
  'Cakes',
  'Ladoos',
  'Energy Bars',
  'Healthy Snacks',
  'Dips & Spreads',
  'Seasonal'
];

export const brandInfo = {
  name: 'NutriJewel',
  tagline: 'Nourish with Intention. Snack with Joy.',
  founder: 'Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist',
  fssai: '21524037004182',
  mission: 'To provide clean, handcrafted, nutritious snacks that promote health and happiness without compromising on taste. We are committed to creating guilt-free alternatives that nourish both body and soul.',
  vision: 'To become the most trusted brand for guilt-free, artisanal snacks that nourish both body and soul. We envision a world where healthy eating is joyful and accessible to everyone.',
  contact: {
    phone: '+91 996-063-7656',
    whatsapp: '+91 996-063-7656',
    email: 'hello@nutrijewel.com'
  },
  social: {
    instagram: '@nutrijewel'
  }
};

// Top Sellers on the homepage = the Best Sellers (driven by the isBestSeller
// flag, so this stays in sync whenever a product's best-seller status changes).
export const featuredTopSellers = products.filter(p => p.isBestSeller);
