const rawProducts = [
  {
    id: 'amrit-bites',
    name: 'NJ Amrit Bites (Dink/Gond Ladoo)',
    displayName: 'NJ Amrit Bites',
    category: 'Traditional Sweets',
    image: '/images/amritbites.jpg',
    images: ['/images/amritbites.jpg', '/images/amritbites.png'],
    description: 'Traditional Dink/Gond ladoos, refined sugar free, ideal for postpartum recovery and bone health support.',
    price: 1799,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1799, originalPrice: 2199 },
      { weight: '500g', price: 899, originalPrice: 1099 }
    ],
    features: ['Refined Sugar Free', 'Bone Health Support', 'Postpartum Recovery', 'Traditional Recipe'],
    isTopSeller: false,
    isBestSeller: true,
    isChefsSpecial: true
  },
  {
    id: 'granola',
    name: 'NJ Signature Granola',
    displayName: 'NJ Signature Granola',
    category: 'Healthy Snacks',
    image: '/images/granola.jpg',
    images: ['/images/granola.jpg', '/images/granola.png'],
    description: 'Gourmet blend with cinnamon, dark chocolate, and mocha hints. High in fiber, great for breakfast or snacking.',
    price: 999,
    originalPrice: 1119,
    weight: '500g',
    variants: [
      { weight: '250g', price: 549, originalPrice: 615 },
      { weight: '500g', price: 999, originalPrice: 1200 },
      { weight: '1kg', price: 1998, originalPrice: 2400 }
    ],
    features: ['High Fiber', 'Cinnamon & Dark Chocolate', 'Breakfast Perfect', 'Gourmet Blend'],
    discountPercent: 12,
    isTopSeller: true,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'granola-cookies',
    name: 'NJ Signature Granola Cookies',
    displayName: 'NJ Granola Cookies',
    category: 'Healthy Snacks',
    image: '/images/granolacookies.jpg',
    images: ['/images/granolacookies.jpg', '/images/granolacookies.png'],
    description: 'Wholesome cookies made from granola, free from refined sugar, preservatives, and artificial additives.',
    price: 499,
    originalPrice: 600,
    weight: '5 big cookies',
    features: ['No Preservatives', 'Refined Sugar Free', 'Wholesome Granola', 'Artificial Free'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'bliss-bites',
    name: 'NJ Special Bliss Bites (Dates & Nuts Ladoo)',
    displayName: 'NJ Special Bliss Bites',
    category: 'Traditional Sweets',
    image: '/images/blissbites.jpg',
    images: ['/images/blissbites.jpg', '/images/blissbites.png'],
    description: 'Rich in fiber and protein, this refined sugar free laddoo is perfect for pre/post workout nourishment.',
    price: 1799,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1799, originalPrice: 2199 },
      { weight: '500g', price: 899, originalPrice: 1099 }
    ],
    features: ['High Protein', 'Pre/Post Workout', 'Dates & Nuts', 'Energy Boost'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: true
  },
  {
    id: 'millet-crunch',
    name: 'Foxnut & Millet Crunch (Roasted)',
    displayName: 'Foxnut & Millet Crunch',
    category: 'Healthy Snacks',
    image: '/images/foxnutmilletcrunch.jpg',
    images: ['/images/foxnutmilletcrunch.jpg', '/images/foxnutmilletcrunch.png'],
    description: 'Roasted foxnuts and millet blend for a crunchy, guilt-free snack full of minerals and light on calories.',
    price: 299,
    originalPrice: 350,
    weight: '250g',
    features: ['Low Calorie', 'Mineral Rich', 'Crunchy Texture', 'Guilt-Free'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'ragi-sattva',
    name: 'NJ Ragi Sattva (Nachani Ladoo)',
    displayName: 'NJ Ragi Sattva',
    category: 'Traditional Sweets',
    image: '/images/ragisattva.jpg',
    images: ['/images/ragisattva.jpg', '/images/ragisattva.png'],
    description: 'Gluten free and refined sugar free Ragi ladoos that promote immunity, bone strength, and energy.',
    price: 1799,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1799, originalPrice: 2199 },
      { weight: '500g', price: 899, originalPrice: 1099 }
    ],
    features: ['Gluten Free', 'Refined Sugar Free', 'Immunity Boost', 'Bone Strength'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: false
  },
  {
    id: 'nutri-bars',
    name: 'NJ Signature Nutri Bars / Bites',
    displayName: 'NJ Nutri Bars / Bites',
    category: 'Energy Bars',
    image: '/images/nutribars.jpg',
    images: ['/images/nutribars.jpg', '/images/nutribars.png'],
    description: 'Dark chocolate-flavored bars packed with nutrients. Ideal for healthy snacking and sustained energy.',
    price: 599,
    originalPrice: 699,
    weight: '250g',
    variants: [
      { weight: '250g', price: 599, originalPrice: 699 },
      { weight: '500g', price: 1099, originalPrice: 1299 }
    ],
    features: ['Dark Chocolate', 'Nutrient Packed', 'Sustained Energy', 'Healthy Snack'],
    isTopSeller: true,
    isBestSeller: false,
    isChefsSpecial: false
  },
  /*
  {
    id: 'omega-crunch',
    name: 'Jewel\'s Omega Crunch (Roasted Trail Mix)',
    displayName: 'Jewel\'s Omega Crunch',
    category: 'Healthy Snacks',
    image: '/images/omegacrunch.jpg',
    images: ['/images/omegacrunch.jpg', '/images/omegacrunch.png'],
    description: 'A heart-healthy roasted trail mix, rich in omega-3 and clean plant-based ingredients.',
    price: 599,
    originalPrice: 699,
    weight: '200g',
    features: ['Heart Healthy', 'Omega-3 Rich', 'Plant Based', 'Premium Trail Mix'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'gun-powder',
    name: 'Jewel\'s Gun Powder (Podi Masala)',
    displayName: 'Jewel\'s Gun Powder',
    category: 'Dips & Spreads',
    image: '/images/gunpowder.jpg',
    images: ['/images/gunpowder.jpg', '/images/gunpowder.png'],
    description: 'South Indian-style spice blend (podi) perfect as a dry chutney or seasoning, handcrafted in small batches.',
    price: 99,
    originalPrice: 150,
    weight: '80g',
    features: ['South Indian Style', 'Handcrafted', 'Small Batches', 'Versatile Seasoning'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  */
  {
    id: 'peanut-butter',
    name: 'NJ Special 100% Peanut Butter',
    displayName: '100% Peanut Butter',
    category: 'Dips & Spreads',
    image: '/images/peanutbutter.jpg',
    images: ['/images/peanutbutter.jpg', '/images/peanutbutter.png'],
    description: 'Pure, refined sugar free peanut butter made with 100% peanuts. No additives, rich in protein and healthy fats.',
    price: 299,
    originalPrice: 350,
    weight: '200g',
    features: ['100% Peanuts', 'No Additives', 'High Protein', 'Healthy Fats'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'hummus',
    name: 'NJ Special Low Fat Hummus',
    displayName: 'Low Fat Hummus',
    category: 'Dips & Spreads',
    image: '/images/hummus.jpg',
    images: ['/images/hummus.jpg', '/images/hummuspitabread.jpg'],
    description: 'High-protein, fiber-rich hummus with no added oil. Smooth, savory, and gut-friendly.',
    price: 250,
    originalPrice: 300,
    weight: '200g',
    features: ['Low Fat', 'High Protein', 'No Added Oil', 'Gut Friendly'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'guac-quack',
    name: 'Jewel\'s Avo Guac Quack',
    displayName: 'Jewel\'s Avo Guac Quack',
    category: 'Dips & Spreads',
    image: '/images/guac.jpg',
    images: ['/images/guac.jpg', '/images/guac.png'],
    description: 'Creamy avocado dip made fresh. Best paired with crackers or used as a sandwich spread.',
    price: 299,
    originalPrice: 399,
    weight: '~180 to 200g',
    features: ['Fresh Avocado', 'Creamy Texture', 'Sandwich Spread', 'Made Fresh'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'maharaja-cake',
    name: 'Thandai Maharaja Cake',
    displayName: 'Thandai Maharaja Cake',
    category: 'Cakes',
    image: '/images/thandaicake.jpg',
    images: ['/images/thandaicake.jpg', '/images/thandaicake.png'],
    description: 'A celebratory cake infused with thandai spice blend, free from refined flour and sugars.',
    price: 499,
    originalPrice: 650,
    weight: '500g',
    variants: [
      { weight: '500g', price: 499, originalPrice: 650 },
      { weight: '1kg', price: 999, originalPrice: 1300 }
    ],
    features: ['Thandai Spice', 'No Refined Flour', 'Refined Sugar Free', 'Celebratory'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: true
  },
  {
    id: 'cambridge-cake',
    name: 'Cambridge of Chocolate (Walnut Dark Chocolate Cake)',
    displayName: 'Cambridge of Chocolate',
    category: 'Cakes',
    image: '/images/fresh cambridge of chocolate cake.jpg',
    images: ['/images/fresh cambridge of chocolate cake.jpg', '/images/packed cambridge of love cake.jpg'],
    description: 'Luxurious dark chocolate cake with walnut crunch. Clean, eggless, preservative-free indulgence.',
    price: 1599,
    originalPrice: 1880,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1599, originalPrice: 1880 },
      { weight: '750g', price: 1199, originalPrice: 1410 },
      { weight: '500g', price: 850, originalPrice: 1000 }
    ],
    features: ['Dark Chocolate', 'Walnut Crunch', 'Eggless', 'Preservative Free'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: true
  },
  {
    id: 'plum-cake',
    name: 'Golden Plum Kiss (Plum Cake)',
    displayName: 'Golden Plum Kiss',
    category: 'Cakes',
    image: '/images/plumcake.jpg',
    images: ['/images/plumcake.jpg', '/images/plumcake.png'],
    description: 'Rich plum cake with warm spices and dried fruits. Clean, eggless, and preservative-free — perfect for festive occasions.',
    price: 850,
    originalPrice: 966,
    weight: '500g',
    variants: [
      { weight: '500g', price: 850, originalPrice: 966 }
    ],
    features: ['Eggless', 'Preservative Free', 'Festive Special', 'Dried Fruits & Spices'],
    isTopSeller: false,
    isBestSeller: true,
    isChefsSpecial: false
  },
  /*
  {
    id: 'khajoor-khazana',
    name: 'Khajoor Ka Khazana (Stuffed Dates)',
    displayName: 'Khajoor Ka Khazana',
    category: 'Traditional Sweets',
    image: '/images/stuffeddates.jpg',
    images: ['/images/stuffeddates.jpg', '/images/stuffeddates.png'],
    description: 'Decadent dates stuffed with clean ingredients. No sugar or additives, only nature\'s goodness.',
    price: 999,
    originalPrice: 1200,
    weight: '12 pieces',
    features: ['Stuffed Dates', 'No Sugar', 'No Additives', 'Natural Goodness'],
    isTopSeller: false,
    isBestSeller: true,
    isChefsSpecial: true
  }
  /*
  {
    id: 'oxford-cake',
    name: 'Oxford of Love (Strawberry Dark Chocolate Cake)',
    displayName: 'Oxford of Love',
    category: 'Cakes',
    image: '/images/oxford of love cake.jpg',
    images: ['/images/oxford of love cake.jpg', '/images/piece oxford of love.jpeg'],
    description: 'Elegant strawberry and dark chocolate cake, made clean without any preservatives or artificial flavors.',
    price: 999,
    originalPrice: 1200,
    weight: '1kg',
    features: ['Strawberry & Chocolate', 'No Preservatives', 'Artificial Free', 'Elegant Design'],
    isTopSeller: false,
    isBestSeller: true,
    isChefsSpecial: true
  }
  */
];

const normalizeProductImages = (product) => ({
  ...product,
  images: product.image ? [product.image, product.image] : product.images
});

export const products = rawProducts.map(normalizeProductImages);

export const topSellers = products.filter(product => product.isTopSeller);

export const categories = [
  'All Products',
  'Best Sellers',
  'Chef\'s Specials',
  'Cakes',
  'Traditional Sweets',
  'Energy Bars',
  'Healthy Snacks',
  'Dips & Spreads'
];

export const brandInfo = {
  name: 'NutriJewel',
  tagline: 'Nourish with Intention. Snack with Joy.',
  founder: 'Dt. Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist',
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

// Your Specific Top 6 Sellers
export const featuredTopSellers = [
  // 1. Cambridge Cake
  products.find(p => p.id === 'cambridge-cake'),
  // 2. Bliss Bites  
  products.find(p => p.id === 'bliss-bites'),
  // 3. Nutri Bars
  products.find(p => p.id === 'nutri-bars'),
  // 4. Granola
  products.find(p => p.id === 'granola'),
  // 5. Ragi Ladoo (Ragi Sattva)
  products.find(p => p.id === 'ragi-sattva'),
  // 6. Amrit Bites
  products.find(p => p.id === 'amrit-bites')
].filter(Boolean); // Remove any undefined items