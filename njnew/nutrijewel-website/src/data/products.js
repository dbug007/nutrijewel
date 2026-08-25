import rawProducts from './products.data';

const normalizeProductImages = (product) => ({
  ...product,
  images: product.image ? [product.image, product.image] : product.images
});

/* Allergen "Contains" info per product. ⚠️ OWNER: please review and complete these —
   only clearly-evident allergens are pre-filled. A shared-kitchen cross-contamination
   advisory is shown on every product page regardless of this map. */
const ALLERGENS = {
  'peanut-butter':    ['Peanuts'],
  'nj-almond-butter': ['Tree nuts (almond)'],
  'nj-nutella':       ['Tree nuts', 'Dairy'],
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

export const products = rawProducts
  .map(normalizeProductImages)
  .map((product) => ({
    ...product,
    allergens: ALLERGENS[product.id] || [],
    nutrition: NUTRITION[product.id] || null,
  }));

export const topSellers = products.filter(product => product.isTopSeller);

export const categories = [
  'All Products',
  'Best Sellers',
  'Chef\'s Specials',
  'Cakes',
  'Traditional Sweets',
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
