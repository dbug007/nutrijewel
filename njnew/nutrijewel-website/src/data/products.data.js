/* Shared product catalog (CommonJS) so the SEO prerender script can require it.
   This is the single source of truth for product data, edit products here.

   Pricing convention: `price` is what the customer pays, `originalPrice` is the
   struck-through figure, set at roughly 22% above and rounded to end in 9.
   Two legacy entries sit outside that band (maharaja cake at 30%, plum cake at
   14%); bring them in line whenever their prices are next reviewed.

   Availability flags, all optional:
     comingSoon      not yet on sale, shown as a teaser, no price
     outOfSeason     real product, temporarily not sold (plum cake, thandai).
                     Hidden from the shop and hampers; flip to false to bring back.
     priceOnRequest  sold, but quoted per order. Not addable to cart or hampers.
     imagePlaceholder  the photo is a stand-in from another product, swap it. */
module.exports = [
  {
    id: 'amrit-bites',
    name: 'NJ Amrit Bites (Wheat Dink/Gond Ladoo)',
    displayName: 'NJ Amrit Bites',
    category: 'Ladoos',
    image: '/images/products/amrit-bites.jpg',
    images: ['/images/products/amrit-bites.jpg'],
    description: 'Traditional Dink/Gond ladoos, refined sugar free, ideal for postpartum recovery and bone health support.',
    price: 1853,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1853, originalPrice: 2199 },
      { weight: '500g', price: 926, originalPrice: 1099 }
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
    image: '/images/products/granola.jpg',
    images: ['/images/products/granola.jpg'],
    description: 'Gourmet blend with cinnamon, dark chocolate, and mocha hints. High in fiber, great for breakfast or snacking.',
    price: 1029,
    originalPrice: 1219,
    weight: '500g',
    variants: [
      { weight: '250g', price: 567, originalPrice: 669 },
      { weight: '500g', price: 1029, originalPrice: 1219 },
      { weight: '1kg', price: 2058, originalPrice: 2439 }
    ],
    features: ['High Fiber', 'Cinnamon & Dark Chocolate', 'Breakfast Perfect', 'Gourmet Blend'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: true
  },
  {
    id: 'granola-cookies',
    name: 'NJ Signature Granola Cookies',
    displayName: 'NJ Granola Cookies',
    category: 'Healthy Snacks',
    image: '/images/products/granola-cookies.jpg',
    images: ['/images/products/granola-cookies.jpg'],
    description: 'Wholesome cookies made from granola, free from refined sugar, preservatives, and artificial additives.',
    price: 514,
    originalPrice: 609,
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
    category: 'Ladoos',
    image: '/images/products/bliss-bites.jpg',
    images: ['/images/products/bliss-bites.jpg'],
    description: 'Rich in fiber and protein, this refined sugar free laddoo is perfect for pre/post workout nourishment.',
    price: 1853,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1853, originalPrice: 2199 },
      { weight: '500g', price: 926, originalPrice: 1099 }
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
    image: '/images/products/foxnut-millet-crunch.jpg',
    images: ['/images/products/foxnut-millet-crunch.jpg'],
    description: 'Roasted foxnuts and millet blend for a crunchy, guilt-free snack full of minerals and light on calories.',
    price: 308,
    originalPrice: 369,
    weight: '250g',
    features: ['Low Calorie', 'Mineral Rich', 'Crunchy Texture', 'Guilt-Free'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'ragi-sattva',
    name: 'NJ Ragi Sattva (Nachani Dink/Gond Ladoo)',
    displayName: 'NJ Ragi Sattva',
    category: 'Ladoos',
    image: '/images/products/ragi-sattva.jpg',
    images: ['/images/products/ragi-sattva.jpg'],
    description: 'Gluten free and refined sugar free Ragi ladoos that promote immunity, bone strength, and energy.',
    price: 1853,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1853, originalPrice: 2199 },
      { weight: '500g', price: 926, originalPrice: 1099 }
    ],
    features: ['Gluten Free', 'Refined Sugar Free', 'Immunity Boost', 'Bone Strength'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: false
  },
  {
    id: 'golden-bites',
    name: 'NJ Golden Bites (Sattu Ghee Ladoo)',
    displayName: 'NJ Golden Bites',
    category: 'Ladoos',
    image: '/images/products/sattu-ladoo.jpg',
    images: ['/images/products/sattu-ladoo.jpg', '/images/products/sattu-ladoo-box.jpg'],
    description: 'Sattu and ghee ladoos, refined sugar free. Slow energy and everyday strength.',
    price: 1235,
    originalPrice: 1459,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1235, originalPrice: 1459 },
      { weight: '500g', price: 617, originalPrice: 729 }
    ],
    features: ['Refined Sugar Free', 'Sattu & Ghee', 'Slow Energy', 'Traditional Recipe'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'nutri-bars',
    name: 'NJ Signature Nutri Bars / Bites',
    displayName: 'NJ Nutri Bars / Bites',
    category: 'Energy Bars',
    image: '/images/products/nutri-bars.jpg',
    images: ['/images/products/nutri-bars.jpg'],
    description: 'Dark chocolate-flavored bars packed with nutrients. Ideal for healthy snacking and sustained energy.',
    price: 617,
    originalPrice: 729,
    weight: '250g',
    variants: [
      { weight: '250g', price: 617, originalPrice: 729 },
      { weight: '500g', price: 1132, originalPrice: 1339 }
    ],
    features: ['Dark Chocolate', 'Nutrient Packed', 'Sustained Energy', 'Healthy Snack'],
    isTopSeller: true,
    isBestSeller: true,
    isChefsSpecial: true
  },
  /*
  {
    id: 'omega-crunch',
    name: 'Jewel\'s Omega Crunch (Roasted Trail Mix)',
    displayName: 'Jewel\'s Omega Crunch',
    category: 'Healthy Snacks',
    image: '/images/products/omega-crunch.jpg',
    images: ['/images/products/omega-crunch.jpg'],
    description: 'A heart-healthy roasted trail mix, rich in omega-3 and clean plant-based ingredients.',
    price: 617,
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
    image: '/images/products/gunpowder.jpg',
    images: ['/images/products/gunpowder.jpg'],
    description: 'South Indian-style spice blend (podi) perfect as a dry chutney or seasoning, handcrafted in small batches.',
    price: 102,
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
    image: '/images/products/peanut-butter.jpg',
    images: ['/images/products/peanut-butter.jpg'],
    description: 'Pure, refined sugar free peanut butter made with 100% peanuts. No additives, rich in protein and healthy fats.',
    price: 308,
    originalPrice: 369,
    weight: '200g',
    features: ['100% Peanuts', 'No Additives', 'High Protein', 'Healthy Fats'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'liquid-gold',
    name: 'NJ Liquid Gold (Healthy Nutella)',
    displayName: 'NJ Liquid Gold',
    category: 'Dips & Spreads',
    image: '/images/products/liquid-gold.jpg',
    images: ['/images/products/liquid-gold.jpg'],
    description: 'Our take on chocolate hazelnut spread, refined sugar free and made in small batches.',
    price: 720,
    originalPrice: 849,
    weight: '1 jar',
    features: ['Refined Sugar Free', 'Small Batch', 'No Palm Oil', 'Chocolate Hazelnut'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'nj-almond-butter',
    name: 'NJ Special 100% Almond Butter',
    displayName: '100% Almond Butter',
    category: 'Dips & Spreads',
    image: '/images/products/almond-butter.jpg',
    images: ['/images/products/almond-butter.jpg'],
    description: 'Pure, refined sugar free almond butter made with 100% almonds. No additives, rich in vitamin E, protein and healthy fats.',
    price: 462,
    originalPrice: 549,
    weight: '200g',
    features: ['100% Almonds', 'No Additives', 'Vitamin E', 'Healthy Fats'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'focaccia-bread',
    name: 'Focaccia Bread (Made in EVOO)',
    displayName: 'Focaccia Bread',
    category: 'Seasonal',
    image: '/images/products/focaccia-bread.jpg',
    images: ['/images/products/focaccia-bread.jpg'],
    description: 'Soft focaccia made in extra virgin olive oil, topped with green chilli, red onion and herbs. Baked to order, so the price depends on size and toppings.',
    price: 0,
    originalPrice: 0,
    weight: 'Made to order',
    features: ['Extra Virgin Olive Oil', 'Baked to Order', 'No Preservatives', 'Small Batch'],
    outOfSeason: true,
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'hummus',
    name: 'NJ Special Low Fat Hummus',
    displayName: 'Low Fat Hummus',
    category: 'Dips & Spreads',
    image: '/images/products/hummus.jpg',
    images: ['/images/products/hummus.jpg', '/images/products/hummus-pita-bread.jpg'],
    description: 'High-protein, fiber-rich hummus with no added oil and homemade tahini. Smooth, savoury and gut-friendly.',
    // Back on sale at the price it last sold for: Rs 250 for 200g.
    price: 258,
    originalPrice: 309,
    weight: '200g',
    features: ['Low Fat', 'High Protein', 'No Added Oil', 'Homemade Tahini'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'maharaja-cake',
    name: 'Thandai Maharaja Cake',
    displayName: 'Thandai Maharaja Cake',
    category: 'Seasonal',
    image: '/images/products/thandai-cake.jpg',
    images: ['/images/products/thandai-cake.jpg'],
    description: 'A celebratory cake infused with thandai spice blend, free from refined flour and sugars.',
    price: 514,
    originalPrice: 650,
    weight: '500g',
    variants: [
      { weight: '500g', price: 514, originalPrice: 650 },
      { weight: '1kg', price: 1029, originalPrice: 1300 }
    ],
    features: ['Thandai Spice', 'No Refined Flour', 'Refined Sugar Free', 'Celebratory'],
    outOfSeason: true,
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'cambridge-cake',
    name: 'Cambridge of Chocolate (Walnut Dark Chocolate Cake)',
    displayName: 'Cambridge of Chocolate',
    category: 'Cakes',
    image: '/images/products/cambridge-chocolate-cake.jpg',
    images: ['/images/products/cambridge-chocolate-cake.jpg', '/images/products/cambridge-cake-packed.jpg'],
    description: 'Luxurious dark chocolate cake with walnut crunch. Clean, eggless, preservative-free indulgence.',
    price: 1853,
    originalPrice: 2199,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1853, originalPrice: 2199 },
      { weight: '750g', price: 1338, originalPrice: 1589 },
      { weight: '500g', price: 926, originalPrice: 1099 }
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
    category: 'Seasonal',
    image: '/images/products/plum-cake.jpg',
    images: ['/images/products/plum-cake.jpg'],
    description: 'Rich plum cake with warm spices and dried fruits. Clean, eggless, and preservative-free, perfect for festive occasions.',
    price: 876,
    originalPrice: 966,
    weight: '500g',
    variants: [
      { weight: '500g', price: 876, originalPrice: 966 }
    ],
    features: ['Eggless', 'Preservative Free', 'Festive Special', 'Dried Fruits & Spices'],
    outOfSeason: true,
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  /*
  {
    id: 'khajoor-khazana',
    name: 'Khajoor Ka Khazana (Stuffed Dates)',
    displayName: 'Khajoor Ka Khazana',
    category: 'Ladoos',
    image: '/images/products/stuffed-dates.jpg',
    images: ['/images/products/stuffed-dates.jpg'],
    description: 'Decadent dates stuffed with clean ingredients. No sugar or additives, only nature\'s goodness.',
    price: 1029,
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
    image: '/images/products/oxford-cake.jpg',
    images: ['/images/products/oxford-cake.jpg', '/images/products/oxford-cake-slice.jpg'],
    description: 'Elegant strawberry and dark chocolate cake, made clean without any preservatives or artificial flavors.',
    price: 1029,
    originalPrice: 1200,
    weight: '1kg',
    features: ['Strawberry & Chocolate', 'No Preservatives', 'Artificial Free', 'Elegant Design'],
    isTopSeller: false,
    isBestSeller: true,
    isChefsSpecial: true
  }
  */
  /* ---- New, Sept 2026. Every photo below is a stand-in from another product
     (imagePlaceholder: true). Swap them and drop the flag once shots arrive. ---- */
  {
    id: 'millet-midnight-muffin',
    name: 'Millet Midnight Muffin (Ragi Dark Chocolate Muffin)',
    displayName: 'Millet Midnight Muffin',
    category: 'Muffins',
    image: '/images/products/millet-midnight-muffin.jpg',
    images: ['/images/products/millet-midnight-muffin.jpg'],
    description: 'Ragi and dark chocolate muffins, refined sugar free. Deep, not sweet.',
    price: 617,
    originalPrice: 729,
    weight: 'Box of 6',
    features: ['Ragi Base', 'Dark Chocolate', 'Refined Sugar Free', 'Box of 6'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'walnana-muffin',
    name: 'Chocolate Wal-Nana Muffin (Chocolate Walnut Banana Muffin)',
    displayName: 'Chocolate Wal-Nana Muffin',
    category: 'Muffins',
    image: '/images/products/chocolate-walnana-muffin.jpg',
    images: ['/images/products/chocolate-walnana-muffin.jpg'],
    description: 'Chocolate, walnut and banana muffins. Naturally sweetened with ripe banana.',
    price: 617,
    originalPrice: 729,
    weight: 'Box of 6',
    features: ['Walnut & Banana', 'Dark Chocolate', 'Refined Sugar Free', 'Box of 6'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'panchamrit-muffin',
    name: 'Panchamrit Muffin (Panchamrit Rawa Muffin)',
    displayName: 'Panchamrit Muffin',
    category: 'Muffins',
    image: '/images/products/panchamrit-muffin.jpg',
    images: ['/images/products/panchamrit-muffin.jpg'],
    description: 'Rawa muffins built on the five panchamrit ingredients. Gentle, traditional, not too sweet.',
    price: 514,
    originalPrice: 609,
    weight: 'Box of 6',
    features: ['Panchamrit Five', 'Rawa Base', 'Refined Sugar Free', 'Box of 6'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'panchamrit-cake',
    name: 'Panchamrit Cake (Rawa Cake)',
    displayName: 'Panchamrit Cake',
    category: 'Cakes',
    image: '/images/products/panchamrit-cake.jpg',
    images: ['/images/products/panchamrit-cake.jpg'],
    description: 'A rawa celebration cake on the five panchamrit ingredients. Eggless and refined sugar free.',
    price: 1029,
    originalPrice: 1219,
    weight: '1kg',
    variants: [
      { weight: '1kg', price: 1029, originalPrice: 1219 },
      { weight: '500g', price: 514, originalPrice: 609 }
    ],
    features: ['Panchamrit Five', 'Rawa Base', 'Eggless', 'Refined Sugar Free'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  },
  {
    id: 'rustic-ragi-bread',
    name: 'Rustic Ragi Super Seeds Bread',
    displayName: 'Rustic Ragi Super Seeds Bread',
    category: 'Breads',
    image: '/images/products/rustic-ragi-bread.jpg',
    images: ['/images/products/rustic-ragi-bread.jpg'],
    description: 'Gluten free ragi loaf packed with super seeds, made in extra virgin olive oil.',
    price: 308,
    originalPrice: 369,
    weight: 'Single loaf',
    variants: [
      { weight: 'Single loaf', price: 308, originalPrice: 369 },
      { weight: 'Double loaf', price: 617, originalPrice: 729 }
    ],
    features: ['Gluten Free', 'Super Seeds', 'Extra Virgin Olive Oil', 'Ragi Base'],
    isTopSeller: false,
    isBestSeller: false,
    isChefsSpecial: false
  }
];
