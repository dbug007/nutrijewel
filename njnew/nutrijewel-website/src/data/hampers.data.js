/* Hamper catalog (CommonJS) so the SEO prerender script can require it, exactly like
   products.data.js. This is the single source of truth for hampers, edit here.

   IMPORTANT: preset hamper prices are NOT stored here. They are computed at runtime by
   src/utils/hamperPricing.js from the live product catalog, so a price change in
   products.data.js can never leave a stale hamper price behind. */

/* ------------------------------------------------------------------ *
 * Box tiers, "size" is a slot count. One slot = one product unit.
 * boxPrice covers the gift box, wrap, ribbon and card.
 * ------------------------------------------------------------------ */
const BOX_TIERS = [
  {
    id: 'petite',
    name: 'Petite',
    slots: 3,
    boxPrice: 149,
    blurb: 'A thoughtful little box. Perfect for a thank-you or a first hello.',
    accent: '#DC7185',
  },
  {
    id: 'classic',
    name: 'Classic',
    slots: 5,
    boxPrice: 249,
    blurb: 'Our most-gifted size. Generous without being showy.',
    accent: '#B3253A',
    isPopular: true,
  },
  {
    id: 'grand',
    name: 'Grand',
    slots: 8,
    boxPrice: 399,
    blurb: 'For the people you really want to impress.',
    accent: '#7C1526',
  },
  {
    id: 'royale',
    name: 'Royale',
    slots: 12,
    boxPrice: 599,
    blurb: 'Weddings, big families, corporate gifting. The full spread.',
    accent: '#C9A227',
  },
];

/* ------------------------------------------------------------------ *
 * Hamper container style, the second axis alongside size.
 * Kept separate from BOX_TIERS on purpose: folding style into the tiers
 * would mean 12 combinations to price and photograph instead of 4 + 3.
 * ------------------------------------------------------------------ */
const CONTAINER_STYLES = [
  {
    id: 'box', name: 'Gift box', price: 0, emoji: '🎁', isDefault: true,
    blurb: 'Rigid magnetic-close box in NutriJewel green.',
  },
  {
    id: 'tray', name: 'Wooden tray', price: 199, emoji: '🪵',
    blurb: 'Reusable mango-wood tray, finished with cellophane and a bow.',
  },
  {
    id: 'basket', name: 'Cane basket', price: 299, emoji: '🧺',
    blurb: 'Hand-woven cane basket with a fabric liner. Keeps its use after the gift.',
  },
];

/* ------------------------------------------------------------------ *
 * Per-product packing. Each product resolves to one packing category
 * (see the two maps below) and can then be packed any of these ways.
 * Exactly one option per category must be isDefault.
 * ⚠️ OWNER: these prices are placeholders, set your real packaging costs.
 * ------------------------------------------------------------------ */
const PACKING_OPTIONS = {
  ladoo: [
    { id: 'ladoo-plastic', name: 'Plastic box', price: 0, isDefault: true, emoji: '📦', blurb: 'Clear food-grade box. Simple and sturdy.' },
    { id: 'ladoo-giftbox', name: 'Special gift box', price: 79, emoji: '🎁', blurb: 'Rigid printed box with a padded insert.' },
    { id: 'ladoo-tin', name: 'Premium tin', price: 129, emoji: '🥫', blurb: 'Reusable embossed tin.' },
  ],
  cake: [
    { id: 'cake-window', name: 'Cake box with window', price: 49, isDefault: true, emoji: '🪟', blurb: 'Our standard. They see the cake before they open it.' },
    { id: 'cake-plastic', name: 'Basic plastic box', price: 0, emoji: '📦', blurb: 'Plain, functional, cheapest option.' },
    { id: 'cake-tin-round', name: 'Premium tin (round)', price: 179, emoji: '⭕', blurb: 'Deep round tin, keeps beautifully.' },
    { id: 'cake-tin-square', name: 'Premium tin (square)', price: 179, emoji: '⬜', blurb: 'Square tin, stacks neatly in a hamper.' },
  ],
  bread: [
    { id: 'bread-pouch', name: 'Kraft pouch', price: 0, isDefault: true, emoji: '🥖', blurb: 'Breathable kraft pouch. Keeps crust crisp.' },
    { id: 'bread-giftbox', name: 'Special box', price: 69, emoji: '🎁', blurb: 'Rigid box with a greaseproof liner.' },
    { id: 'bread-plastic', name: 'Plastic box', price: 29, emoji: '📦', blurb: 'Sealed clear box.' },
    { id: 'bread-wrap', name: 'Gift wrapper', price: 49, emoji: '🎀', blurb: 'Hand-wrapped in printed paper and twine.' },
  ],
  dip: [
    { id: 'dip-glass', name: 'Glass jar', price: 0, isDefault: true, emoji: '🫙', blurb: 'Our standard screw-top glass jar.' },
    { id: 'dip-jar-signature', name: 'Signature jar', price: 59, emoji: '🍯', blurb: 'Heavier jar with a printed lid and seal.' },
    { id: 'dip-jar-cork', name: 'Corked apothecary jar', price: 99, emoji: '🧪', blurb: 'Tall corked jar with a wax seal.' },
  ],
  cookie: [
    { id: 'cookie-gunny', name: 'Gunny bag', price: 0, isDefault: true, emoji: '🧺', blurb: 'Jute drawstring bag, our signature look.' },
    { id: 'cookie-tin', name: 'Special tin', price: 119, emoji: '🥫', blurb: 'Round tin that keeps cookies crisp for weeks.' },
    { id: 'cookie-box', name: 'Special box', price: 89, emoji: '🎁', blurb: 'Rigid box with a divider tray.' },
  ],
  muffin: [
    { id: 'muffin-wrap', name: 'Single plastic wrap', price: 0, isDefault: true, emoji: '🧁', blurb: 'Individually wrapped, one per muffin.' },
    { id: 'muffin-window', name: 'Multi-pack window box', price: 79, emoji: '🪟', blurb: 'Window box with moulded inserts for a set.' },
  ],
  snack: [
    { id: 'snack-pouch', name: 'Kraft pouch', price: 0, isDefault: true, emoji: '🌾', blurb: 'Resealable kraft pouch with a clear panel.' },
    { id: 'snack-box', name: 'Gift box', price: 69, emoji: '🎁', blurb: 'Rigid printed box.' },
    { id: 'snack-tin', name: 'Premium tin', price: 109, emoji: '🥫', blurb: 'Airtight reusable tin.' },
  ],
  imported: [
    { id: 'imported-asis', name: 'Original packaging', price: 0, isDefault: true, emoji: '🌍', blurb: 'Left exactly as it was imported.' },
    { id: 'imported-sleeve', name: 'Gift sleeve', price: 49, emoji: '🎀', blurb: 'Printed sleeve wrapped around the original pack.' },
    { id: 'imported-box', name: 'Presentation box', price: 89, emoji: '🎁', blurb: 'Boxed with shredded filler.' },
  ],
};

/* Product id → packing category. Only for products whose product category
   would otherwise send them to the wrong packing (e.g. focaccia sits in "Cakes"). */
const PACKING_CATEGORY_BY_PRODUCT_ID = {
  'focaccia-bread': 'bread',
  'granola-cookies': 'cookie',
};

/* Product category → packing category. The general rule. */
const PACKING_CATEGORY_BY_PRODUCT_CATEGORY = {
  'Traditional Sweets': 'ladoo',
  'Cakes': 'cake',
  'Seasonal': 'cake',
  'Dips & Spreads': 'dip',
  'Healthy Snacks': 'snack',
  'Energy Bars': 'snack',
  'Imported': 'imported',
};

const DEFAULT_PACKING_CATEGORY = 'snack';

/* Optional ribbon, offered on every item whatever its packing. */
const RIBBON = { id: 'ribbon', name: 'Satin ribbon & bow', price: 25 };

/* ------------------------------------------------------------------ *
 * Hamper note / greeting. One per hamper, not per item.
 * ------------------------------------------------------------------ */
const NOTE_OPTIONS = [
  { id: 'none', name: 'No note', price: 0, isDefault: true, emoji: '○', blurb: 'Just the hamper.' },
  { id: 'tag', name: 'Greeting tag', price: 29, emoji: '🏷️', blurb: 'Small kraft tag tied to the ribbon. A few words.' },
  { id: 'card', name: 'Greeting card', price: 59, emoji: '💌', blurb: 'Folded printed card, your message hand-written inside.' },
  { id: 'custom', name: 'Custom hand-written note', price: 99, emoji: '✍️', blurb: 'Your words on premium textured paper, in calligraphy.' },
];

const NOTE_MAX_LENGTH = 220;

/* ------------------------------------------------------------------ *
 * Offer tiers, evaluated against the ITEMS subtotal (never packaging).
 * The highest qualifying tier wins. Keep sorted ascending by minItemsTotal.
 * ------------------------------------------------------------------ */
const OFFER_TIERS = [
  { id: 'tier-1', minItemsTotal: 1500, percent: 5,  label: 'Save 5%'  },
  { id: 'tier-2', minItemsTotal: 2500, percent: 10, label: 'Save 10%' },
  { id: 'tier-3', minItemsTotal: 4000, percent: 15, label: 'Save 15%' },
];

/* ------------------------------------------------------------------ *
 * Products that should never appear in a hamper.
 * ⚠️ OWNER: fresh dips are excluded because they don't survive gift-box
 * transit. Remove an id from this list if you're happy to ship it in a hamper.
 * (comingSoon products are excluded automatically, no need to list them.)
 * ------------------------------------------------------------------ */
const HAMPER_EXCLUDED_PRODUCT_IDS = ['hummus', 'guac-quack'];

/* ------------------------------------------------------------------ *
 * Occasions. `presetIds` points at PRESET_HAMPERS below.
 * `accent` themes the section when the occasion is selected.
 * ------------------------------------------------------------------ */
const OCCASIONS = [
  {
    id: 'diwali', slug: 'diwali', name: 'Diwali', emoji: '🪔', accent: '#D99A2B',
    blurb: 'Mithai without the sugar crash. Festive boxes that actually nourish.',
    presetIds: ['diwali-delight', 'corporate-classic'],
  },
  {
    id: 'raksha-bandhan', slug: 'raksha-bandhan', name: 'Raksha Bandhan', emoji: '🧵', accent: '#D4657F',
    blurb: 'For the sibling who deserves better than a box of shop mithai.',
    presetIds: ['rakhi-sweet-box', 'thank-you-petite'],
  },
  {
    id: 'wedding', slug: 'wedding', name: 'Weddings & Shaadi', emoji: '💍', accent: '#C9A227',
    blurb: 'Return gifts and welcome hampers your guests will remember.',
    presetIds: ['wedding-grandeur', 'corporate-classic'],
  },
  {
    id: 'corporate', slug: 'corporate', name: 'Corporate & Bulk', emoji: '💼', accent: '#5E7A9B',
    blurb: 'Client and team gifting that says you paid attention. Bulk pricing available.',
    presetIds: ['corporate-classic', 'wedding-grandeur'],
  },
  {
    id: 'christmas', slug: 'christmas-new-year', name: 'Christmas & New Year', emoji: '🎄', accent: '#1E6B4F',
    blurb: 'Plum cake, warm spices, and a box that looks like the season.',
    presetIds: ['christmas-warmth', 'diwali-delight'],
  },
  {
    id: 'birthday', slug: 'birthday', name: 'Birthdays', emoji: '🎂', accent: '#E5499B',
    blurb: 'Cake and treats, minus the refined sugar regret.',
    presetIds: ['birthday-bloom', 'fit-and-fabulous'],
  },
  {
    id: 'new-mom', slug: 'baby-shower-new-mom', name: 'Baby Shower & New Mom', emoji: '🤱', accent: '#93B559',
    blurb: 'Built around postpartum recovery: gond, ragi and dates, the way it is meant to be done.',
    presetIds: ['new-mom-nourish', 'rakhi-sweet-box'],
  },
  {
    id: 'housewarming', slug: 'housewarming', name: 'Housewarming', emoji: '🏡', accent: '#C86A42',
    blurb: 'Griha pravesh gifting that stocks their new kitchen properly.',
    presetIds: ['diwali-delight', 'thank-you-petite'],
  },
  {
    id: 'anniversary', slug: 'anniversary', name: 'Anniversary', emoji: '🥂', accent: '#8E5572',
    blurb: 'Chocolate, indulgence, and nothing artificial.',
    presetIds: ['birthday-bloom', 'christmas-warmth'],
  },
  {
    id: 'thank-you', slug: 'thank-you', name: 'Thank You', emoji: '💌', accent: '#6B8CAE',
    blurb: 'Small, sincere, and far better than a gift card.',
    presetIds: ['thank-you-petite', 'rakhi-sweet-box'],
  },
  {
    id: 'get-well', slug: 'get-well-soon', name: 'Get Well Soon', emoji: '🌿', accent: '#7FA650',
    blurb: 'Gentle, immunity-friendly picks for someone who needs looking after.',
    presetIds: ['new-mom-nourish', 'thank-you-petite'],
  },
  {
    id: 'fitness', slug: 'fitness-and-wellness', name: 'Fitness & Wellness', emoji: '💪', accent: '#4A7C7E',
    blurb: 'High protein, clean fuel. For the gym-goer who reads labels.',
    presetIds: ['fit-and-fabulous', 'corporate-classic'],
  },
  {
    id: 'valentines', slug: 'valentines-day', name: "Valentine's Day", emoji: '❤️', accent: '#D6336C',
    blurb: 'Dark chocolate and walnut. Say it with cake.',
    presetIds: ['birthday-bloom', 'christmas-warmth'],
  },
  {
    id: 'parents', slug: 'mothers-and-fathers-day', name: "Mother's & Father's Day", emoji: '🌸', accent: '#C77FA8',
    blurb: 'For the people who told you to eat properly. Prove you listened.',
    presetIds: ['new-mom-nourish', 'diwali-delight'],
  },
  {
    id: 'festive-indian', slug: 'indian-festivals', name: 'Holi, Eid, Navratri & More', emoji: '🎊', accent: '#E8743B',
    blurb: 'Thandai cake, ladoos and festive picks for every Indian celebration.',
    presetIds: ['diwali-delight', 'rakhi-sweet-box'],
  },
  {
    id: 'just-because', slug: 'just-because', name: 'Just Because', emoji: '✨', accent: '#7A6E8F',
    blurb: 'No occasion needed. Build whatever you like.',
    presetIds: ['fit-and-fabulous', 'thank-you-petite'],
  },
];

/* ------------------------------------------------------------------ *
 * Ready-to-gift presets. `items` reference live products by id + weight,
 * the weight MUST match a variant weight in products.data.js (or the
 * product's base weight when it has no variants).
 * ------------------------------------------------------------------ */
const PRESET_HAMPERS = [
  {
    id: 'diwali-delight',
    name: 'Diwali Delight',
    boxTierId: 'classic',
    occasionIds: ['diwali', 'housewarming', 'festive-indian', 'parents'],
    image: '/images/amritbites.jpg',
    blurb: 'Ladoos, granola and crunch. The festive table, cleaned up.',
    items: [
      { productId: 'granola',      weight: '500g', qty: 1 },
      { productId: 'bliss-bites',  weight: '500g', qty: 1 },
      { productId: 'amrit-bites',  weight: '500g', qty: 1 },
      { productId: 'nutri-bars',   weight: '250g', qty: 1 },
      { productId: 'millet-crunch', weight: '250g', qty: 1 },
    ],
  },
  {
    id: 'rakhi-sweet-box',
    name: 'Rakhi Sweet Box',
    boxTierId: 'petite',
    occasionIds: ['raksha-bandhan', 'thank-you', 'new-mom', 'festive-indian'],
    image: '/images/blissbites.jpg',
    blurb: 'Three ladoo classics, refined-sugar free, in a compact gift box.',
    items: [
      { productId: 'bliss-bites',   weight: '500g', qty: 1 },
      { productId: 'ragi-sattva',   weight: '500g', qty: 1 },
      { productId: 'millet-crunch', weight: '250g', qty: 1 },
    ],
  },
  {
    id: 'corporate-classic',
    name: 'Corporate Classic',
    boxTierId: 'grand',
    occasionIds: ['corporate', 'diwali', 'wedding', 'fitness'],
    image: '/images/granola.jpg',
    blurb: 'Eight full-size favourites. Our most-ordered client gift.',
    items: [
      { productId: 'granola',         weight: '500g', qty: 1 },
      { productId: 'nutri-bars',      weight: '500g', qty: 1 },
      { productId: 'bliss-bites',     weight: '1kg',  qty: 1 },
      { productId: 'amrit-bites',     weight: '1kg',  qty: 1 },
      { productId: 'ragi-sattva',     weight: '500g', qty: 1 },
      { productId: 'millet-crunch',   weight: '250g', qty: 1 },
      { productId: 'granola-cookies', weight: '5 big cookies', qty: 1 },
      { productId: 'peanut-butter',   weight: '200g', qty: 1 },
    ],
  },
  {
    id: 'wedding-grandeur',
    name: 'Wedding Grandeur',
    boxTierId: 'royale',
    occasionIds: ['wedding', 'corporate'],
    image: '/images/fresh cambridge of chocolate cake.jpg',
    blurb: 'Ten items including a full chocolate cake. Our flagship gift.',
    items: [
      { productId: 'cambridge-cake',  weight: '1kg',  qty: 1 },
      { productId: 'granola',         weight: '1kg',  qty: 1 },
      { productId: 'bliss-bites',     weight: '1kg',  qty: 1 },
      { productId: 'amrit-bites',     weight: '1kg',  qty: 1 },
      { productId: 'ragi-sattva',     weight: '1kg',  qty: 1 },
      { productId: 'nutri-bars',      weight: '500g', qty: 1 },
      { productId: 'plum-cake',       weight: '500g', qty: 1 },
      { productId: 'millet-crunch',   weight: '250g', qty: 1 },
      { productId: 'granola-cookies', weight: '5 big cookies', qty: 1 },
      { productId: 'peanut-butter',   weight: '200g', qty: 1 },
    ],
  },
  {
    id: 'christmas-warmth',
    name: 'Christmas Warmth',
    boxTierId: 'classic',
    occasionIds: ['christmas', 'anniversary', 'valentines'],
    image: '/images/plumcake.jpg',
    blurb: 'Plum cake, dark chocolate and cookies. Built for cold evenings.',
    items: [
      { productId: 'plum-cake',       weight: '500g', qty: 1 },
      { productId: 'cambridge-cake',  weight: '500g', qty: 1 },
      { productId: 'granola-cookies', weight: '5 big cookies', qty: 1 },
      { productId: 'granola',         weight: '250g', qty: 1 },
      { productId: 'millet-crunch',   weight: '250g', qty: 1 },
    ],
  },
  {
    id: 'birthday-bloom',
    name: 'Birthday Bloom',
    boxTierId: 'petite',
    occasionIds: ['birthday', 'anniversary', 'valentines'],
    image: '/images/thandaicake.jpg',
    blurb: 'Cake, cookies and a bar. A birthday box without the sugar crash.',
    items: [
      { productId: 'cambridge-cake',  weight: '500g', qty: 1 },
      { productId: 'granola-cookies', weight: '5 big cookies', qty: 1 },
      { productId: 'nutri-bars',      weight: '250g', qty: 1 },
    ],
  },
  {
    id: 'new-mom-nourish',
    name: 'New Mom Nourish',
    boxTierId: 'classic',
    occasionIds: ['new-mom', 'get-well', 'parents'],
    image: '/images/ragisattva.jpg',
    blurb: 'Gond, ragi and dates, chosen for postpartum recovery and bone health.',
    items: [
      { productId: 'amrit-bites',   weight: '1kg',  qty: 1 },
      { productId: 'ragi-sattva',   weight: '500g', qty: 1 },
      { productId: 'bliss-bites',   weight: '500g', qty: 1 },
      { productId: 'granola',       weight: '250g', qty: 1 },
      { productId: 'millet-crunch', weight: '250g', qty: 1 },
    ],
  },
  {
    id: 'thank-you-petite',
    name: 'Thank You Petite',
    boxTierId: 'petite',
    occasionIds: ['thank-you', 'housewarming', 'get-well', 'just-because'],
    image: '/images/granolacookies.jpg',
    blurb: 'Small and sincere. Granola, cookies and crunch.',
    items: [
      { productId: 'granola',         weight: '250g', qty: 1 },
      { productId: 'granola-cookies', weight: '5 big cookies', qty: 1 },
      { productId: 'millet-crunch',   weight: '250g', qty: 1 },
    ],
  },
  {
    id: 'fit-and-fabulous',
    name: 'Fit & Fabulous',
    boxTierId: 'classic',
    occasionIds: ['fitness', 'birthday', 'just-because'],
    image: '/images/nutribars.jpg',
    blurb: 'High protein, clean fuel. Pre-workout to post-workout covered.',
    items: [
      { productId: 'nutri-bars',    weight: '500g', qty: 1 },
      { productId: 'granola',       weight: '500g', qty: 1 },
      { productId: 'peanut-butter', weight: '200g', qty: 1 },
      { productId: 'bliss-bites',   weight: '500g', qty: 1 },
      { productId: 'millet-crunch', weight: '250g', qty: 1 },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Imported add-ons.
 * ⚠️⚠️ OWNER: PRICES AND STOCK HERE ARE DUMMY DATA. Every entry carries
 * `isPlaceholder: true`. Before this goes to production you must:
 *   1. confirm you actually stock each line and can source it reliably,
 *   2. replace price/originalPrice/weight with your real numbers,
 *   3. add a product photo and set `image`,
 *   4. delete the isPlaceholder flag.
 * Set SHOW_IMPORTED_PLACEHOLDERS to false to hide the Imported tab entirely
 * until that's done.
 * ------------------------------------------------------------------ */
const SHOW_IMPORTED_PLACEHOLDERS = true; // flip to false to hide the Imported tab entirely

const IMPORTED_GROUP_ORDER = ['Soft Drinks', 'Coffee', 'Chocolates', 'Packed Snacks'];

const imported = (id, displayName, importedGroup, origin, flag, weight, price, originalPrice) => ({
  id, name: displayName, displayName, importedGroup, origin, flag, weight, price, originalPrice,
  category: 'Imported',
  image: null,
  description: `Imported from ${origin}. Shelf-stable, travels safely in a hamper.`,
  isImported: true,
  isPlaceholder: true,
});

/* Every entry here is shelf-stable by design, nothing perishable goes in a
   hamper that may sit in transit for days. */
const IMPORTED_PRODUCTS = [
  // ---- Soft drinks ----
  imported('imp-coke-jp',      'Coca-Cola (Japan)',            'Soft Drinks', 'Japan',       '🇯🇵', '250ml can',  199, 249),
  imported('imp-pepsi-us',     'Pepsi (USA)',                  'Soft Drinks', 'USA',         '🇺🇸', '355ml can',  189, 229),
  imported('imp-fanta-melon',  'Fanta Melon Soda (Japan)',     'Soft Drinks', 'Japan',       '🇯🇵', '500ml',      229, 279),
  imported('imp-ramune',       'Ramune Original (Japan)',      'Soft Drinks', 'Japan',       '🇯🇵', '200ml',      249, 299),
  imported('imp-mtn-dew-us',   'Mountain Dew (USA)',           'Soft Drinks', 'USA',         '🇺🇸', '355ml can',  189, 229),

  // ---- Coffee ----
  imported('imp-sbux-espresso','Starbucks Doubleshot Espresso','Coffee',      'USA',         '🇺🇸', '200ml can',  349, 399),
  imported('imp-boss-latte',   'BOSS Coffee Latte (Japan)',    'Coffee',      'Japan',       '🇯🇵', '185ml can',  299, 349),
  imported('imp-nescafe-gold', 'Nescafé Gold Barista (Japan)', 'Coffee',      'Japan',       '🇯🇵', '190ml can',  279, 329),

  // ---- Chocolates ----
  imported('imp-lindor',       'Lindt Lindor Assorted',        'Chocolates',  'Switzerland', '🇨🇭', '200g box',   899, 1049),
  imported('imp-ferrero-t16',  'Ferrero Rocher T16',           'Chocolates',  'Italy',       '🇮🇹', '200g box',   949, 1099),
  imported('imp-toblerone',    'Toblerone Milk',               'Chocolates',  'Switzerland', '🇨🇭', '360g bar',   649, 749),
  imported('imp-hershey-kiss', "Hershey's Kisses",             'Chocolates',  'USA',         '🇺🇸', '340g pack',  599, 699),

  // ---- Packed snacks ----
  imported('imp-pringles',     'Pringles Exotic Flavours',     'Packed Snacks', 'USA',       '🇺🇸', '165g can',   279, 329),
  imported('imp-kitkat-matcha','KitKat Matcha (Japan)',        'Packed Snacks', 'Japan',     '🇯🇵', '12-pack',    549, 649),
  imported('imp-pocky',        'Pocky Assorted (Japan)',       'Packed Snacks', 'Japan',     '🇯🇵', '4-pack',     329, 399),
];

/* ------------------------------------------------------------------ *
 * FAQ, also emitted as FAQPage JSON-LD on /hampers.
 * ------------------------------------------------------------------ */
const HAMPER_FAQS = [
  {
    q: 'Can I choose exactly what goes into my hamper?',
    a: 'Yes. Pick a box size, then add any products you like until the slots are full. The price updates live as you build, and discounts unlock automatically as your hamper grows.',
  },
  {
    q: 'How do the hamper discounts work?',
    a: 'Discounts are based on the value of the products in your box: 5% off above ₹1,500, 10% above ₹2,500 and 15% above ₹4,000. The discount applies to the products; the gift box and packaging are charged separately.',
  },
  {
    q: 'Do you take bulk and corporate orders?',
    a: 'We do. Diwali client gifting, wedding return gifts and team hampers are a large part of what we make. Message us on WhatsApp with your quantity and budget and we will put a quote together.',
  },
  {
    q: 'Can I choose how each item is packed?',
    a: 'Yes. Every item in the builder has its own packing options. Ladoos come in a plastic box by default and can go in a gift box or a premium tin; cakes come in a window box and can be upgraded to a round or square tin; dips come in a glass jar with signature and corked-jar upgrades; cookies come in a jute gunny bag with tin and box options. You can add a satin ribbon to any item.',
  },
  {
    q: 'Can I add a gift message?',
    a: 'Yes. Choose a greeting tag, a printed greeting card, or a custom hand-written note when you build your hamper, and type the message right there. We hand-write it before the box is sealed.',
  },
  {
    q: 'Can I have a tray or a basket instead of a box?',
    a: 'Yes. Every hamper size can be presented as our standard gift box, a reusable mango-wood tray, or a hand-woven cane basket. You choose the size and the style separately, so any combination works.',
  },
  {
    q: 'Do you stock imported products?',
    a: 'We do. Imported soft drinks, canned coffee, chocolates and packed snacks from Japan, the USA, Switzerland and Italy, which you can mix into any hamper alongside the NutriJewel range. We only import shelf-stable items so nothing spoils in transit.',
  },
  {
    q: 'Are the hampers refined-sugar free?',
    a: 'Most of our range is refined-sugar free, gluten free or both. Every product page lists its own ingredients and allergens, and you can see exactly what is in your hamper before you order.',
  },
  {
    q: 'How long do hamper items stay fresh?',
    a: 'Everything is handcrafted in small batches with no artificial preservatives. Dry items like granola, bars and ladoos keep well for several weeks; cakes are best within a few days. We only include items that travel well in a gift box.',
  },
];

module.exports = {
  BOX_TIERS,
  CONTAINER_STYLES,
  OFFER_TIERS,
  PACKING_OPTIONS,
  PACKING_CATEGORY_BY_PRODUCT_ID,
  PACKING_CATEGORY_BY_PRODUCT_CATEGORY,
  DEFAULT_PACKING_CATEGORY,
  RIBBON,
  NOTE_OPTIONS,
  NOTE_MAX_LENGTH,
  HAMPER_EXCLUDED_PRODUCT_IDS,
  OCCASIONS,
  PRESET_HAMPERS,
  IMPORTED_PRODUCTS,
  IMPORTED_GROUP_ORDER,
  SHOW_IMPORTED_PLACEHOLDERS,
  HAMPER_FAQS,
};
