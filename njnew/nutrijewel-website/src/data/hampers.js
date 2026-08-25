/* ESM view over the CommonJS hamper catalog, mirroring how products.js wraps
   products.data.js. Components import from here, never from hampers.data.js. */

import hamperData from './hampers.data';
import { products } from './products';
import { getHamperEligibleProducts } from '../utils/hamperPricing';

export const BOX_TIERS = hamperData.BOX_TIERS;
export const CONTAINER_STYLES = hamperData.CONTAINER_STYLES;
export const OFFER_TIERS = hamperData.OFFER_TIERS;
export const PACKING_OPTIONS = hamperData.PACKING_OPTIONS;
export const RIBBON = hamperData.RIBBON;
export const NOTE_OPTIONS = hamperData.NOTE_OPTIONS;
export const NOTE_MAX_LENGTH = hamperData.NOTE_MAX_LENGTH;
export const OCCASIONS = hamperData.OCCASIONS;
export const PRESET_HAMPERS = hamperData.PRESET_HAMPERS;
export const HAMPER_FAQS = hamperData.HAMPER_FAQS;
export const HAMPER_EXCLUDED_PRODUCT_IDS = hamperData.HAMPER_EXCLUDED_PRODUCT_IDS;
export const IMPORTED_GROUP_ORDER = hamperData.IMPORTED_GROUP_ORDER;

export const DEFAULT_BOX_TIER_ID = 'classic';
export const DEFAULT_CONTAINER_STYLE_ID = 'box';
export const DEFAULT_NOTE_OPTION_ID = 'none';

/* Placeholder imported entries only surface while the owner flag is on. */
export const IMPORTED_PRODUCTS = hamperData.SHOW_IMPORTED_PLACEHOLDERS
  ? hamperData.IMPORTED_PRODUCTS
  : hamperData.IMPORTED_PRODUCTS.filter((p) => !p.isPlaceholder);

/* In-stock NutriJewel products that are allowed in a gift box. */
export const hamperProducts = getHamperEligibleProducts(products, HAMPER_EXCLUDED_PRODUCT_IDS);

/* Everything the builder can offer: NutriJewel range + imported add-ons. */
export const hamperCatalog = [...hamperProducts, ...IMPORTED_PRODUCTS];

/* Gifting-first category order for the product picker. */
export const HAMPER_CATEGORY_ORDER = [
  'Cakes',
  'Traditional Sweets',
  'Healthy Snacks',
  'Energy Bars',
  'Seasonal',
  'Dips & Spreads',
];

/* ---------- lookups (all total, never throw) ---------- */

export const getBoxTier = (id) =>
  BOX_TIERS.find((t) => t.id === id) ||
  BOX_TIERS.find((t) => t.isPopular) ||
  BOX_TIERS[0];

export const getOccasion = (id) => OCCASIONS.find((o) => o.id === id) || null;

export const getOccasionBySlug = (slug) => OCCASIONS.find((o) => o.slug === slug) || null;

export const getPreset = (id) => PRESET_HAMPERS.find((p) => p.id === id) || null;

/* Presets tagged for an occasion, honouring the occasion's own ordering first. */
export const getPresetsForOccasion = (occasionId) => {
  if (!occasionId) return PRESET_HAMPERS;
  const occasion = getOccasion(occasionId);
  const ordered = (occasion?.presetIds || [])
    .map((id) => getPreset(id))
    .filter(Boolean);
  const alsoTagged = PRESET_HAMPERS.filter(
    (p) => p.occasionIds?.includes(occasionId) && !ordered.some((o) => o.id === p.id)
  );
  return [...ordered, ...alsoTagged];
};

/* Products grouped for the picker, empty categories dropped. */
export const getGroupedHamperProducts = () =>
  HAMPER_CATEGORY_ORDER
    .map((category) => ({
      category,
      items: hamperProducts.filter((p) => p.category === category),
    }))
    .filter((group) => group.items.length > 0);

/* Imported add-ons grouped by type (drinks, coffee, chocolate, snacks). */
export const getGroupedImportedProducts = () =>
  IMPORTED_GROUP_ORDER
    .map((group) => ({
      category: group,
      items: IMPORTED_PRODUCTS.filter((p) => p.importedGroup === group),
    }))
    .filter((group) => group.items.length > 0);

/* Find any product a hamper line can point at (NutriJewel or imported). */
export const findHamperProduct = (productId) =>
  hamperCatalog.find((p) => p.id === productId) || null;

/* ---------- packing ---------- */

/* Which packing family a product belongs to. An explicit per-product entry wins,
   otherwise it falls out of the product's category. */
export const getPackingCategory = (product) => {
  if (!product) return hamperData.DEFAULT_PACKING_CATEGORY;
  return (
    hamperData.PACKING_CATEGORY_BY_PRODUCT_ID[product.id] ||
    hamperData.PACKING_CATEGORY_BY_PRODUCT_CATEGORY[product.category] ||
    hamperData.DEFAULT_PACKING_CATEGORY
  );
};

export const getPackingOptions = (product) =>
  PACKING_OPTIONS[getPackingCategory(product)] || PACKING_OPTIONS[hamperData.DEFAULT_PACKING_CATEGORY];

export const getDefaultPacking = (product) => {
  const options = getPackingOptions(product);
  return options.find((o) => o.isDefault) || options[0];
};

export const getPackingOption = (product, packingId) => {
  const options = getPackingOptions(product);
  return options.find((o) => o.id === packingId) || getDefaultPacking(product);
};

/* ---------- container style + note ---------- */

export const getContainerStyle = (id) =>
  CONTAINER_STYLES.find((s) => s.id === id) ||
  CONTAINER_STYLES.find((s) => s.isDefault) ||
  CONTAINER_STYLES[0];

export const getNoteOption = (id) =>
  NOTE_OPTIONS.find((n) => n.id === id) ||
  NOTE_OPTIONS.find((n) => n.isDefault) ||
  NOTE_OPTIONS[0];
