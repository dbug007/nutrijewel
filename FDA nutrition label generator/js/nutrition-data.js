// Comprehensive nutrition database for NutriJewel healthy snacks
const NUTRITION_DATA = {
    // Traditional Indian Grains & Millets (per 100g)
    'ragi-finger-millet': {
        name: 'Ragi (Finger Millet)',
        calories: 336,
        totalFat: 1.3,
        saturatedFat: 0.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 11,
        totalCarbs: 72,
        fiber: 3.6,
        sugars: 1.5,
        addedSugars: 0,
        protein: 7.3,
        vitaminD: 0,
        calcium: 344,
        iron: 3.9,
        potassium: 408
    },
    'bajra-pearl-millet': {
        name: 'Bajra (Pearl Millet)',
        calories: 378,
        totalFat: 5.0,
        saturatedFat: 1.0,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 67,
        fiber: 8.5,
        sugars: 1.8,
        addedSugars: 0,
        protein: 11.6,
        vitaminD: 0,
        calcium: 42,
        iron: 8.0,
        potassium: 307
    },
    'jowar-sorghum': {
        name: 'Jowar (Sorghum)',
        calories: 329,
        totalFat: 3.1,
        saturatedFat: 0.9,
        transFat: 0,
        cholesterol: 0,
        sodium: 6,
        totalCarbs: 70,
        fiber: 6.7,
        sugars: 2.5,
        addedSugars: 0,
        protein: 10.6,
        vitaminD: 0,
        calcium: 25,
        iron: 4.1,
        potassium: 350
    },
    'jowar-flour': {
        name: 'Jowar Flour (Sorghum Flour)',
        calories: 329,
        totalFat: 3.1,
        saturatedFat: 0.9,
        transFat: 0,
        cholesterol: 0,
        sodium: 6,
        totalCarbs: 70,
        fiber: 6.7,
        sugars: 2.5,
        addedSugars: 0,
        protein: 10.6,
        vitaminD: 0,
        calcium: 25,
        iron: 4.1,
        potassium: 350
    },
    'amaranth-grain': {
        name: 'Amaranth Grain',
        calories: 371,
        totalFat: 7.0,
        saturatedFat: 1.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 65,
        fiber: 6.7,
        sugars: 1.7,
        addedSugars: 0,
        protein: 13.6,
        vitaminD: 0,
        calcium: 159,
        iron: 7.6,
        potassium: 508
    },
    'quinoa': {
        name: 'Quinoa',
        calories: 368,
        totalFat: 6.1,
        saturatedFat: 0.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 64,
        fiber: 7.0,
        sugars: 4.6,
        addedSugars: 0,
        protein: 14.1,
        vitaminD: 0,
        calcium: 47,
        iron: 4.6,
        potassium: 563
    },
    'buckwheat-flour': {
        name: 'Buckwheat Flour',
        calories: 335,
        totalFat: 3.1,
        saturatedFat: 0.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 11,
        totalCarbs: 71,
        fiber: 10.3,
        sugars: 2.6,
        addedSugars: 0,
        protein: 12.6,
        vitaminD: 0,
        calcium: 41,
        iron: 4.1,
        potassium: 577
    },
    'oats-rolled': {
        name: 'Rolled Oats',
        calories: 389,
        totalFat: 6.9,
        saturatedFat: 1.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 66,
        fiber: 10.6,
        sugars: 1,
        addedSugars: 0,
        protein: 16.9,
        vitaminD: 0,
        calcium: 54,
        iron: 4.7,
        potassium: 429
    },
    
    // Traditional Indian Ingredients & Superfoods
    'gond-edible-gum': {
        name: 'Gond (Edible Gum)',
        calories: 325,
        totalFat: 0.2,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 35,
        totalCarbs: 78,
        fiber: 2.5,
        sugars: 3.2,
        addedSugars: 0,
        protein: 6.8,
        vitaminD: 0,
        calcium: 240,
        iron: 2.8,
        potassium: 195
    },
    'dink-gum-tragacanth': {
        name: 'Dink (Gum Tragacanth)',
        calories: 320,
        totalFat: 0.8,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 40,
        totalCarbs: 75,
        fiber: 68,
        sugars: 2.1,
        addedSugars: 0,
        protein: 6.2,
        vitaminD: 0,
        calcium: 180,
        iron: 3.5,
        potassium: 210
    },
    'foxnuts-makhana': {
        name: 'Foxnuts (Makhana)',
        calories: 347,
        totalFat: 0.1,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 77,
        fiber: 14.5,
        sugars: 0.6,
        addedSugars: 0,
        protein: 9.7,
        vitaminD: 0,
        calcium: 60,
        iron: 1.4,
        potassium: 350
    },
    // Comprehensive World Seeds Collection
    // Popular Superfood Seeds
    'chia-seeds': {
        name: 'Chia Seeds',
        calories: 486,
        totalFat: 31,
        saturatedFat: 3.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 16,
        totalCarbs: 42,
        fiber: 34,
        sugars: 0,
        addedSugars: 0,
        protein: 17,
        vitaminD: 0,
        calcium: 631,
        iron: 7.7,
        potassium: 407
    },
    'flax-seeds': {
        name: 'Flax Seeds (Linseed)',
        calories: 534,
        totalFat: 42,
        saturatedFat: 3.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 30,
        totalCarbs: 29,
        fiber: 27,
        sugars: 1.6,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 255,
        iron: 5.7,
        potassium: 813
    },
    'hemp-seeds': {
        name: 'Hemp Seeds (Hemp Hearts)',
        calories: 553,
        totalFat: 49,
        saturatedFat: 4.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 4.7,
        fiber: 4.0,
        sugars: 1.5,
        addedSugars: 0,
        protein: 31,
        vitaminD: 0,
        calcium: 70,
        iron: 7.9,
        potassium: 1200
    },
    'pumpkin-seeds': {
        name: 'Pumpkin Seeds (Pepitas)',
        calories: 559,
        totalFat: 49,
        saturatedFat: 8.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 7,
        totalCarbs: 11,
        fiber: 6.0,
        sugars: 1.4,
        addedSugars: 0,
        protein: 30,
        vitaminD: 0,
        calcium: 46,
        iron: 8.8,
        potassium: 809
    },
    'sunflower-seeds': {
        name: 'Sunflower Seeds',
        calories: 584,
        totalFat: 51,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 9,
        totalCarbs: 20,
        fiber: 8.6,
        sugars: 2.6,
        addedSugars: 0,
        protein: 21,
        vitaminD: 0,
        calcium: 78,
        iron: 5.2,
        potassium: 645
    },
    'sesame-seeds': {
        name: 'Sesame Seeds',
        calories: 573,
        totalFat: 50,
        saturatedFat: 7.0,
        transFat: 0,
        cholesterol: 0,
        sodium: 11,
        totalCarbs: 23,
        fiber: 11.8,
        sugars: 0.3,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 975,
        iron: 14.6,
        potassium: 468
    },
    'watermelon-seeds': {
        name: 'Watermelon Seeds',
        calories: 557,
        totalFat: 47,
        saturatedFat: 10,
        transFat: 0,
        cholesterol: 0,
        sodium: 99,
        totalCarbs: 15,
        fiber: 4.0,
        sugars: 2.0,
        addedSugars: 0,
        protein: 28,
        vitaminD: 0,
        calcium: 54,
        iron: 7.3,
        potassium: 648
    },
    'poppy-seeds': {
        name: 'Poppy Seeds',
        calories: 525,
        totalFat: 42,
        saturatedFat: 4.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 26,
        totalCarbs: 28,
        fiber: 20,
        sugars: 2.9,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 1438,
        iron: 9.8,
        potassium: 719
    },
    'nigella-seeds': {
        name: 'Nigella Seeds (Black Cumin)',
        calories: 345,
        totalFat: 22,
        saturatedFat: 1.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 88,
        totalCarbs: 52,
        fiber: 40,
        sugars: 2.0,
        addedSugars: 0,
        protein: 16,
        vitaminD: 0,
        calcium: 1859,
        iron: 105,
        potassium: 1788
    },

    // Asian & Exotic Seeds
    'lotus-seeds': {
        name: 'Lotus Seeds',
        calories: 332,
        totalFat: 1.97,
        saturatedFat: 0.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 65,
        fiber: 5.0,
        sugars: 0,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 44,
        iron: 1.6,
        potassium: 367
    },
    'perilla-seeds': {
        name: 'Perilla Seeds',
        calories: 537,
        totalFat: 45,
        saturatedFat: 6.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 14,
        fiber: 7.0,
        sugars: 1.2,
        addedSugars: 0,
        protein: 19,
        vitaminD: 0,
        calcium: 230,
        iron: 16,
        potassium: 500
    },
    'basil-seeds': {
        name: 'Basil Seeds (Sabja)',
        calories: 442,
        totalFat: 25,
        saturatedFat: 7.0,
        transFat: 0,
        cholesterol: 0,
        sodium: 30,
        totalCarbs: 42,
        fiber: 22,
        sugars: 1.8,
        addedSugars: 0,
        protein: 14,
        vitaminD: 0,
        calcium: 2113,
        iron: 15.8,
        potassium: 788
    },
    'quinoa-seeds': {
        name: 'Quinoa Seeds',
        calories: 368,
        totalFat: 6.1,
        saturatedFat: 0.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 64,
        fiber: 7.0,
        sugars: 4.6,
        addedSugars: 0,
        protein: 14.1,
        vitaminD: 0,
        calcium: 47,
        iron: 4.6,
        potassium: 563
    },

    // European & Mediterranean Seeds
    'caraway-seeds': {
        name: 'Caraway Seeds',
        calories: 333,
        totalFat: 14,
        saturatedFat: 0.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 17,
        totalCarbs: 50,
        fiber: 38,
        sugars: 0.6,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 689,
        iron: 16,
        potassium: 1351
    },
    'fennel-seeds': {
        name: 'Fennel Seeds',
        calories: 345,
        totalFat: 15,
        saturatedFat: 0.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 88,
        totalCarbs: 52,
        fiber: 40,
        sugars: 0,
        addedSugars: 0,
        protein: 16,
        vitaminD: 0,
        calcium: 1196,
        iron: 18.5,
        potassium: 1694
    },
    'anise-seeds': {
        name: 'Anise Seeds',
        calories: 337,
        totalFat: 16,
        saturatedFat: 0.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 16,
        totalCarbs: 50,
        fiber: 15,
        sugars: 3.0,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 646,
        iron: 37,
        potassium: 1441
    },
    'dill-seeds': {
        name: 'Dill Seeds',
        calories: 305,
        totalFat: 14,
        saturatedFat: 0.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 35,
        totalCarbs: 56,
        fiber: 21,
        sugars: 0,
        addedSugars: 0,
        protein: 16,
        vitaminD: 0,
        calcium: 1516,
        iron: 16,
        potassium: 1186
    },

    // South American Seeds
    'amaranth-seeds': {
        name: 'Amaranth Seeds',
        calories: 371,
        totalFat: 7.0,
        saturatedFat: 1.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 65,
        fiber: 6.7,
        sugars: 1.7,
        addedSugars: 0,
        protein: 13.6,
        vitaminD: 0,
        calcium: 159,
        iron: 7.6,
        potassium: 508
    },
    'sacha-inchi-seeds': {
        name: 'Sacha Inchi Seeds',
        calories: 553,
        totalFat: 49,
        saturatedFat: 7.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 5,
        fiber: 11,
        sugars: 1.3,
        addedSugars: 0,
        protein: 27,
        vitaminD: 0,
        calcium: 85,
        iron: 5.2,
        potassium: 925
    },

    // Middle Eastern & North African Seeds
    'pomegranate-seeds': {
        name: 'Pomegranate Seeds (Arils)',
        calories: 83,
        totalFat: 1.2,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 19,
        fiber: 4.0,
        sugars: 14,
        addedSugars: 0,
        protein: 1.7,
        vitaminD: 0,
        calcium: 10,
        iron: 0.3,
        potassium: 236
    },
    'grape-seeds': {
        name: 'Grape Seeds',
        calories: 395,
        totalFat: 20,
        saturatedFat: 8.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 16,
        fiber: 6.5,
        sugars: 2.0,
        addedSugars: 0,
        protein: 11,
        vitaminD: 0,
        calcium: 90,
        iron: 5.8,
        potassium: 170
    },

    // African Seeds
    'baobab-seeds': {
        name: 'Baobab Seeds',
        calories: 462,
        totalFat: 35,
        saturatedFat: 10,
        transFat: 0,
        cholesterol: 0,
        sodium: 6,
        totalCarbs: 23,
        fiber: 44,
        sugars: 2.8,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 295,
        iron: 9.3,
        potassium: 1240
    },
    'moringa-seeds': {
        name: 'Moringa Seeds',
        calories: 456,
        totalFat: 38,
        saturatedFat: 8.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 9,
        totalCarbs: 8.5,
        fiber: 5.2,
        sugars: 1.2,
        addedSugars: 0,
        protein: 35,
        vitaminD: 0,
        calcium: 30,
        iron: 4.0,
        potassium: 461
    },

    // Fruit Seeds (edible)
    'papaya-seeds': {
        name: 'Papaya Seeds',
        calories: 558,
        totalFat: 54,
        saturatedFat: 18,
        transFat: 0,
        cholesterol: 0,
        sodium: 6,
        totalCarbs: 6,
        fiber: 2.0,
        sugars: 3.2,
        addedSugars: 0,
        protein: 25,
        vitaminD: 0,
        calcium: 90,
        iron: 1.5,
        potassium: 1030
    },
    'cantaloupe-seeds': {
        name: 'Cantaloupe Seeds',
        calories: 555,
        totalFat: 47,
        saturatedFat: 9.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 103,
        totalCarbs: 16,
        fiber: 4.2,
        sugars: 1.8,
        addedSugars: 0,
        protein: 24,
        vitaminD: 0,
        calcium: 58,
        iron: 7.4,
        potassium: 588
    },
    'honeydew-seeds': {
        name: 'Honeydew Melon Seeds',
        calories: 602,
        totalFat: 55,
        saturatedFat: 11,
        transFat: 0,
        cholesterol: 0,
        sodium: 374,
        totalCarbs: 14,
        fiber: 5.1,
        sugars: 2.0,
        addedSugars: 0,
        protein: 21,
        vitaminD: 0,
        calcium: 65,
        iron: 8.0,
        potassium: 820
    },

    // Specialty & Rare Seeds
    'teff-seeds': {
        name: 'Teff Seeds',
        calories: 367,
        totalFat: 2.4,
        saturatedFat: 0.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 12,
        totalCarbs: 73,
        fiber: 8.0,
        sugars: 1.8,
        addedSugars: 0,
        protein: 13,
        vitaminD: 0,
        calcium: 180,
        iron: 7.6,
        potassium: 427
    },
    'milk-thistle-seeds': {
        name: 'Milk Thistle Seeds',
        calories: 534,
        totalFat: 28,
        saturatedFat: 5.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 9,
        totalCarbs: 24,
        fiber: 10,
        sugars: 1.6,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 395,
        iron: 18,
        potassium: 572
    },
    'evening-primrose-seeds': {
        name: 'Evening Primrose Seeds',
        calories: 443,
        totalFat: 28,
        saturatedFat: 2.8,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 31,
        fiber: 29,
        sugars: 1.5,
        addedSugars: 0,
        protein: 16,
        vitaminD: 0,
        calcium: 442,
        iron: 6.0,
        potassium: 370
    },

    // Comprehensive World Nuts Collection
    // Tree Nuts - Common Varieties
    'almonds': {
        name: 'Almonds',
        calories: 579,
        totalFat: 50,
        saturatedFat: 3.8,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 22,
        fiber: 12,
        sugars: 4.4,
        addedSugars: 0,
        protein: 21,
        vitaminD: 0,
        calcium: 269,
        iron: 3.7,
        potassium: 733
    },
    'walnuts-english': {
        name: 'English Walnuts',
        calories: 654,
        totalFat: 65,
        saturatedFat: 6.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 14,
        fiber: 6.7,
        sugars: 2.6,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 98,
        iron: 2.9,
        potassium: 441
    },
    'walnuts-black': {
        name: 'Black Walnuts',
        calories: 618,
        totalFat: 59,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 10,
        fiber: 6.8,
        sugars: 1.1,
        addedSugars: 0,
        protein: 24,
        vitaminD: 0,
        calcium: 61,
        iron: 3.1,
        potassium: 523
    },
    'cashews': {
        name: 'Cashews',
        calories: 553,
        totalFat: 44,
        saturatedFat: 7.8,
        transFat: 0,
        cholesterol: 0,
        sodium: 12,
        totalCarbs: 30,
        fiber: 3.3,
        sugars: 5.9,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 37,
        iron: 6.7,
        potassium: 660
    },
    'pistachios': {
        name: 'Pistachios',
        calories: 560,
        totalFat: 45,
        saturatedFat: 5.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 28,
        fiber: 10,
        sugars: 7.7,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 105,
        iron: 3.9,
        potassium: 1025
    },
    'hazelnuts': {
        name: 'Hazelnuts (Filberts)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'hazelnuts-raw': {
        name: 'Hazelnuts (Raw)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'hazelnuts-roasted': {
        name: 'Hazelnuts (Roasted)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'hazelnuts-blanched': {
        name: 'Hazelnuts (Blanched)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'hazelnuts-chopped': {
        name: 'Hazelnuts (Chopped)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'hazelnut-flour': {
        name: 'Hazelnut Flour (Meal)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'hazelnut-butter': {
        name: 'Hazelnut Butter (Pure)',
        calories: 628,
        totalFat: 61,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 17,
        fiber: 9.7,
        sugars: 4.3,
        addedSugars: 0,
        protein: 15,
        vitaminD: 0,
        calcium: 114,
        iron: 4.7,
        potassium: 680
    },
    'pecans': {
        name: 'Pecans',
        calories: 691,
        totalFat: 72,
        saturatedFat: 6.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 14,
        fiber: 9.6,
        sugars: 4.0,
        addedSugars: 0,
        protein: 9.2,
        vitaminD: 0,
        calcium: 70,
        iron: 2.5,
        potassium: 410
    },
    'brazil-nuts': {
        name: 'Brazil Nuts',
        calories: 659,
        totalFat: 67,
        saturatedFat: 16,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 12,
        fiber: 7.5,
        sugars: 2.3,
        addedSugars: 0,
        protein: 14,
        vitaminD: 0,
        calcium: 160,
        iron: 2.4,
        potassium: 659
    },
    'macadamia-nuts': {
        name: 'Macadamia Nuts',
        calories: 718,
        totalFat: 76,
        saturatedFat: 12,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 14,
        fiber: 8.6,
        sugars: 4.6,
        addedSugars: 0,
        protein: 7.9,
        vitaminD: 0,
        calcium: 85,
        iron: 3.7,
        potassium: 368
    },
    'pine-nuts': {
        name: 'Pine Nuts (Pignoli)',
        calories: 673,
        totalFat: 68,
        saturatedFat: 4.9,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 13,
        fiber: 3.7,
        sugars: 3.6,
        addedSugars: 0,
        protein: 14,
        vitaminD: 0,
        calcium: 16,
        iron: 5.5,
        potassium: 597
    },
    'chestnuts': {
        name: 'Chestnuts',
        calories: 213,
        totalFat: 2.3,
        saturatedFat: 0.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 27,
        totalCarbs: 46,
        fiber: 5.1,
        sugars: 11,
        addedSugars: 0,
        protein: 2.4,
        vitaminD: 0,
        calcium: 27,
        iron: 1.0,
        potassium: 518
    },
    'beechnuts': {
        name: 'Beechnuts',
        calories: 576,
        totalFat: 50,
        saturatedFat: 7.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 11,
        totalCarbs: 34,
        fiber: 14,
        sugars: 10,
        addedSugars: 0,
        protein: 6.2,
        vitaminD: 0,
        calcium: 1,
        iron: 2.5,
        potassium: 1017
    },
    'hickory-nuts': {
        name: 'Hickory Nuts',
        calories: 657,
        totalFat: 64,
        saturatedFat: 7.0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 18,
        fiber: 6.4,
        sugars: 3.6,
        addedSugars: 0,
        protein: 13,
        vitaminD: 0,
        calcium: 61,
        iron: 2.1,
        potassium: 436
    },
    'butternuts': {
        name: 'Butternuts (White Walnuts)',
        calories: 612,
        totalFat: 57,
        saturatedFat: 1.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 12,
        fiber: 4.7,
        sugars: 1.2,
        addedSugars: 0,
        protein: 24,
        vitaminD: 0,
        calcium: 53,
        iron: 4.7,
        potassium: 421
    },

    // Asian & Tropical Nuts
    'coconut-meat': {
        name: 'Coconut Meat (fresh)',
        calories: 354,
        totalFat: 33,
        saturatedFat: 30,
        transFat: 0,
        cholesterol: 0,
        sodium: 20,
        totalCarbs: 15,
        fiber: 9,
        sugars: 6.2,
        addedSugars: 0,
        protein: 3.3,
        vitaminD: 0,
        calcium: 14,
        iron: 2.4,
        potassium: 356
    },
    'candlenuts': {
        name: 'Candlenuts (Kukui)',
        calories: 684,
        totalFat: 73,
        saturatedFat: 14,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 4,
        fiber: 2.8,
        sugars: 1.2,
        addedSugars: 0,
        protein: 8,
        vitaminD: 0,
        calcium: 140,
        iron: 2.8,
        potassium: 371
    },
    'sacha-inchi': {
        name: 'Sacha Inchi (Inca Peanut)',
        calories: 553,
        totalFat: 49,
        saturatedFat: 7.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 5,
        fiber: 11,
        sugars: 1.3,
        addedSugars: 0,
        protein: 27,
        vitaminD: 0,
        calcium: 85,
        iron: 5.2,
        potassium: 925
    },
    'kola-nuts': {
        name: 'Kola Nuts',
        calories: 380,
        totalFat: 1.8,
        saturatedFat: 0.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 25,
        totalCarbs: 78,
        fiber: 8.2,
        sugars: 3.5,
        addedSugars: 0,
        protein: 7.9,
        vitaminD: 0,
        calcium: 45,
        iron: 1.5,
        potassium: 935
    },

    // Legume "Nuts" (technically legumes but used as nuts)
    'peanuts': {
        name: 'Peanuts (Groundnuts)',
        calories: 567,
        totalFat: 49,
        saturatedFat: 6.8,
        transFat: 0,
        cholesterol: 0,
        sodium: 18,
        totalCarbs: 16,
        fiber: 8.5,
        sugars: 4.7,
        addedSugars: 0,
        protein: 26,
        vitaminD: 0,
        calcium: 92,
        iron: 4.6,
        potassium: 705
    },
    'tiger-nuts': {
        name: 'Tiger Nuts (Chufa)',
        calories: 386,
        totalFat: 25,
        saturatedFat: 5.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 29,
        fiber: 33,
        sugars: 17,
        addedSugars: 0,
        protein: 4.9,
        vitaminD: 0,
        calcium: 100,
        iron: 2.8,
        potassium: 485
    },

    // Wild & Foraged Nuts
    'acorns': {
        name: 'Acorns (processed)',
        calories: 387,
        totalFat: 24,
        saturatedFat: 3.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 41,
        fiber: 9.4,
        sugars: 0,
        addedSugars: 0,
        protein: 6.2,
        vitaminD: 0,
        calcium: 41,
        iron: 0.8,
        potassium: 539
    },
    'ginkgo-nuts': {
        name: 'Ginkgo Nuts',
        calories: 182,
        totalFat: 1.7,
        saturatedFat: 0.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 7,
        totalCarbs: 38,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 4.3,
        vitaminD: 0,
        calcium: 2,
        iron: 1.0,
        potassium: 510
    },

    // Dates & Natural Sweeteners
    'dates-medjool': {
        name: 'Medjool Dates',
        calories: 277,
        totalFat: 0.2,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 75,
        fiber: 6.7,
        sugars: 66,
        addedSugars: 0,
        protein: 1.8,
        vitaminD: 0,
        calcium: 64,
        iron: 0.9,
        potassium: 696
    },
    'dates-deglet-noor': {
        name: 'Deglet Noor Dates',
        calories: 282,
        totalFat: 0.4,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 75,
        fiber: 8.0,
        sugars: 63,
        addedSugars: 0,
        protein: 2.5,
        vitaminD: 0,
        calcium: 39,
        iron: 1.0,
        potassium: 656
    },
    'dates-mazafati': {
        name: 'Mazafati Dates (Iranian Black Dates)',
        calories: 290,
        totalFat: 0.3,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 78,
        fiber: 7.5,
        sugars: 70,
        addedSugars: 0,
        protein: 2.2,
        vitaminD: 0,
        calcium: 55,
        iron: 1.2,
        potassium: 720
    },
    'dates-kimia': {
        name: 'Kimia Dates (Iranian Premium)',
        calories: 285,
        totalFat: 0.2,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 76,
        fiber: 8.2,
        sugars: 68,
        addedSugars: 0,
        protein: 2.0,
        vitaminD: 0,
        calcium: 48,
        iron: 1.1,
        potassium: 705
    },
    'khajoor-paste': {
        name: 'Date Paste',
        calories: 266,
        totalFat: 0.4,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 71,
        fiber: 6.4,
        sugars: 64,
        addedSugars: 0,
        protein: 2.0,
        vitaminD: 0,
        calcium: 39,
        iron: 1.0,
        potassium: 652
    },
    'figs-dried': {
        name: 'Dried Figs',
        calories: 249,
        totalFat: 0.9,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 10,
        totalCarbs: 64,
        fiber: 9.8,
        sugars: 48,
        addedSugars: 0,
        protein: 3.3,
        vitaminD: 0,
        calcium: 162,
        iron: 2.0,
        potassium: 680
    },
    'raisins': {
        name: 'Raisins',
        calories: 299,
        totalFat: 0.5,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 11,
        totalCarbs: 79,
        fiber: 3.7,
        sugars: 59,
        addedSugars: 0,
        protein: 3.1,
        vitaminD: 0,
        calcium: 50,
        iron: 1.9,
        potassium: 749
    },
    'jaggery-gur': {
        name: 'Jaggery (Gur)',
        calories: 383,
        totalFat: 0.1,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 30,
        totalCarbs: 98,
        fiber: 0,
        sugars: 97,
        addedSugars: 0, // Natural sweetener
        protein: 0.4,
        vitaminD: 0,
        calcium: 40,
        iron: 11,
        potassium: 1050
    },
    // Dairy and fats for healthy snacks
    'amul-milk': {
        name: 'Amul Whole Milk',
        calories: 68,
        totalFat: 3.8,
        saturatedFat: 2.3,
        transFat: 0.1,
        cholesterol: 14,
        sodium: 44,
        totalCarbs: 4.9,
        fiber: 0,
        sugars: 4.9,
        addedSugars: 0,
        protein: 3.4,
        vitaminD: 40,
        calcium: 123,
        iron: 0.1,
        potassium: 150
    },
    'amul-butter': {
        name: 'Amul Butter',
        calories: 717,
        totalFat: 81,
        saturatedFat: 51,
        transFat: 3.3,
        cholesterol: 215,
        sodium: 643,
        totalCarbs: 0.1,
        fiber: 0,
        sugars: 0.1,
        addedSugars: 0,
        protein: 0.9,
        vitaminD: 60,
        calcium: 24,
        iron: 0.2,
        potassium: 24
    },
    'sunflower-oil': {
        name: 'Sunflower Refined Oil',
        calories: 884,
        totalFat: 100,
        saturatedFat: 10,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 0,
        calcium: 0,
        iron: 0,
        potassium: 0
    },
    'curd-yogurt': {
        name: 'Curd (Plain Yogurt)',
        calories: 63,
        totalFat: 3.3,
        saturatedFat: 2.1,
        transFat: 0.1,
        cholesterol: 13,
        sodium: 46,
        totalCarbs: 4.7,
        fiber: 0,
        sugars: 4.7,
        addedSugars: 0,
        protein: 3.5,
        vitaminD: 2,
        calcium: 121,
        iron: 0.1,
        potassium: 155
    },
    'amul-curd': {
        name: 'Amul Curd (Commercial)',
        calories: 63,
        totalFat: 3.3,
        saturatedFat: 2.1,
        transFat: 0.1,
        cholesterol: 13,
        sodium: 46,
        totalCarbs: 4.7,
        fiber: 0,
        sugars: 4.7,
        addedSugars: 0,
        protein: 3.5,
        vitaminD: 2,
        calcium: 121,
        iron: 0.1,
        potassium: 155
    },
    'milky-mist-curd': {
        name: 'Milky Mist Curd (Commercial)',
        calories: 63,
        totalFat: 3.3,
        saturatedFat: 2.1,
        transFat: 0.1,
        cholesterol: 13,
        sodium: 46,
        totalCarbs: 4.7,
        fiber: 0,
        sugars: 4.7,
        addedSugars: 0,
        protein: 3.5,
        vitaminD: 2,
        calcium: 121,
        iron: 0.1,
        potassium: 155
    },
    'lemon-water': {
        name: 'Lemon Water (Fresh)',
        calories: 7,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 2.5,
        fiber: 0.5,
        sugars: 1.5,
        addedSugars: 0,
        protein: 0.1,
        vitaminD: 0,
        calcium: 6,
        iron: 0.1,
        potassium: 80
    },
    // All types of sugar varieties
    'white-sugar': {
        name: 'White Sugar (Refined)',
        calories: 387,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 100,
        fiber: 0,
        sugars: 100,
        addedSugars: 100,
        protein: 0,
        vitaminD: 0,
        calcium: 0,
        iron: 0,
        potassium: 0
    },
    'brown-sugar': {
        name: 'Brown Sugar',
        calories: 380,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 28,
        totalCarbs: 98,
        fiber: 0,
        sugars: 97,
        addedSugars: 97,
        protein: 0.1,
        vitaminD: 0,
        calcium: 85,
        iron: 1.9,
        potassium: 346
    },
    'coconut-sugar': {
        name: 'Coconut Sugar',
        calories: 375,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 125,
        totalCarbs: 94,
        fiber: 1,
        sugars: 90,
        addedSugars: 0, // Natural alternative
        protein: 1,
        vitaminD: 0,
        calcium: 6,
        iron: 2.1,
        potassium: 625
    },
    'stevia': {
        name: 'Stevia Extract',
        calories: 0,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 0,
        calcium: 0,
        iron: 0,
        potassium: 0
    },
    'maple-syrup': {
        name: 'Pure Maple Syrup',
        calories: 260,
        totalFat: 0.1,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 12,
        totalCarbs: 67,
        fiber: 0,
        sugars: 60,
        addedSugars: 0, // Natural syrup
        protein: 0,
        vitaminD: 0,
        calcium: 102,
        iron: 0.1,
        potassium: 212
    },
    'honey': {
        name: 'Honey',
        calories: 304,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 82,
        fiber: 0.2,
        sugars: 82,
        addedSugars: 0,
        protein: 0.3,
        vitaminD: 0,
        calcium: 6,
        iron: 0.4,
        potassium: 52
    },
    'coconut-palm-sugar': {
        name: 'Coconut Palm Sugar',
        calories: 375,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 35,
        totalCarbs: 96,
        fiber: 0,
        sugars: 92,
        addedSugars: 0,
        protein: 1.1,
        vitaminD: 0,
        calcium: 6,
        iron: 1.8,
        potassium: 1030
    },

    // Chocolate and premium ingredients
    'vanhouten-dark-chocolate': {
        name: 'Van Houten Dark Chocolate 46.5%',
        calories: 546,
        totalFat: 31,
        saturatedFat: 18.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 24,
        totalCarbs: 61,
        fiber: 7,
        sugars: 48,
        addedSugars: 45,
        protein: 4.9,
        vitaminD: 0,
        calcium: 73,
        iron: 11.9,
        potassium: 715
    },
    'vanhouten-cocoa-powder': {
        name: 'Van Houten Cocoa Powder (Unsweetened)',
        calories: 228,
        totalFat: 14,
        saturatedFat: 8.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 21,
        totalCarbs: 58,
        fiber: 37,
        sugars: 1.8,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 128,
        iron: 13.9,
        potassium: 1524
    },
    'vanhouten-dutch-cocoa': {
        name: 'Van Houten Dutch-Process Cocoa',
        calories: 228,
        totalFat: 14,
        saturatedFat: 8.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 21,
        totalCarbs: 58,
        fiber: 37,
        sugars: 1.8,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 128,
        iron: 13.9,
        potassium: 1524
    },
    'vanhouten-drinking-chocolate': {
        name: 'Van Houten Drinking Chocolate (Sweetened)',
        calories: 400,
        totalFat: 8,
        saturatedFat: 5,
        transFat: 0,
        cholesterol: 0,
        sodium: 120,
        totalCarbs: 70,
        fiber: 8,
        sugars: 55,
        addedSugars: 50,
        protein: 8,
        vitaminD: 0,
        calcium: 120,
        iron: 7,
        potassium: 900
    },
    'vanhouten-milk-chocolate': {
        name: 'Van Houten Milk Chocolate',
        calories: 535,
        totalFat: 30,
        saturatedFat: 18,
        transFat: 0,
        cholesterol: 21,
        sodium: 79,
        totalCarbs: 59,
        fiber: 2,
        sugars: 52,
        addedSugars: 50,
        protein: 8,
        vitaminD: 0,
        calcium: 251,
        iron: 1.0,
        potassium: 350
    },
    'amul-dark-chocolate-55': {
        name: 'Amul Dark Chocolate 55% (Commercial)',
        calories: 570,
        totalFat: 38,
        saturatedFat: 23,
        transFat: 0,
        cholesterol: 0,
        sodium: 8,
        totalCarbs: 50,
        fiber: 8,
        sugars: 45,
        addedSugars: 40,
        protein: 6,
        vitaminD: 0,
        calcium: 70,
        iron: 8,
        potassium: 600
    },
    'amul-dark-chocolate-70': {
        name: 'Amul Dark Chocolate 70% (Commercial)',
        calories: 598,
        totalFat: 43,
        saturatedFat: 25,
        transFat: 0,
        cholesterol: 2,
        sodium: 6,
        totalCarbs: 46,
        fiber: 11,
        sugars: 24,
        addedSugars: 20,
        protein: 7.8,
        vitaminD: 0,
        calcium: 73,
        iron: 11.9,
        potassium: 715
    },
    'amul-dark-chocolate-85': {
        name: 'Amul Dark Chocolate 85% (Commercial)',
        calories: 600,
        totalFat: 46,
        saturatedFat: 28,
        transFat: 0,
        cholesterol: 2,
        sodium: 6,
        totalCarbs: 30,
        fiber: 14,
        sugars: 14,
        addedSugars: 10,
        protein: 7,
        vitaminD: 0,
        calcium: 80,
        iron: 12,
        potassium: 750
    },
    'amul-dark-chocolate-90': {
        name: 'Amul Dark Chocolate 90% (Commercial)',
        calories: 610,
        totalFat: 50,
        saturatedFat: 30,
        transFat: 0,
        cholesterol: 2,
        sodium: 5,
        totalCarbs: 23,
        fiber: 15,
        sugars: 7,
        addedSugars: 2,
        protein: 8,
        vitaminD: 0,
        calcium: 90,
        iron: 13,
        potassium: 800
    },
    'dark-chocolate-70': {
        name: 'Dark Chocolate 70% Cocoa (Pure)',
        calories: 598,
        totalFat: 43,
        saturatedFat: 25,
        transFat: 0,
        cholesterol: 2,
        sodium: 6,
        totalCarbs: 46,
        fiber: 11,
        sugars: 24,
        addedSugars: 0,
        protein: 7.8,
        vitaminD: 0,
        calcium: 73,
        iron: 11.9,
        potassium: 715
    },
    'dark-chocolate-70-sweetened': {
        name: 'Dark Chocolate 70% (Sweetened)',
        calories: 598,
        totalFat: 43,
        saturatedFat: 25,
        transFat: 0,
        cholesterol: 2,
        sodium: 6,
        totalCarbs: 46,
        fiber: 11,
        sugars: 24,
        addedSugars: 20,
        protein: 7.8,
        vitaminD: 0,
        calcium: 73,
        iron: 11.9,
        potassium: 715
    },
    'white-chocolate': {
        name: 'White Chocolate',
        calories: 539,
        totalFat: 32,
        saturatedFat: 19,
        transFat: 0,
        cholesterol: 21,
        sodium: 90,
        totalCarbs: 59,
        fiber: 0.2,
        sugars: 59,
        addedSugars: 55,
        protein: 5.9,
        vitaminD: 0,
        calcium: 199,
        iron: 0.2,
        potassium: 286
    },
    // Cake and baking ingredients
    'baking-powder': {
        name: 'Baking Powder',
        calories: 53,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 10600,
        totalCarbs: 28,
        fiber: 0.2,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 0,
        calcium: 7300,
        iron: 0.4,
        potassium: 170
    },
    'eggs': {
        name: 'Whole Eggs',
        calories: 155,
        totalFat: 11,
        saturatedFat: 3.3,
        transFat: 0,
        cholesterol: 373,
        sodium: 124,
        totalCarbs: 1.1,
        fiber: 0,
        sugars: 1.1,
        addedSugars: 0,
        protein: 13,
        vitaminD: 87,
        calcium: 50,
        iron: 1.8,
        potassium: 126
    },
    'cream-cheese': {
        name: 'Cream Cheese',
        calories: 342,
        totalFat: 34,
        saturatedFat: 19,
        transFat: 1,
        cholesterol: 110,
        sodium: 321,
        totalCarbs: 4.1,
        fiber: 0,
        sugars: 3.2,
        addedSugars: 0,
        protein: 6,
        vitaminD: 62,
        calcium: 98,
        iron: 0.4,
        potassium: 119
    },
    'powdered-sugar': {
        name: 'Powdered Sugar (Icing Sugar)',
        calories: 389,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 100,
        fiber: 0,
        sugars: 97,
        addedSugars: 97,
        protein: 0,
        vitaminD: 0,
        calcium: 1,
        iron: 0,
        potassium: 2
    },

    // Coconut Products
    'coconut-fresh': {
        name: 'Fresh Coconut',
        calories: 354,
        totalFat: 33,
        saturatedFat: 30,
        transFat: 0,
        cholesterol: 0,
        sodium: 20,
        totalCarbs: 15,
        fiber: 9,
        sugars: 6.2,
        addedSugars: 0,
        protein: 3.3,
        vitaminD: 0,
        calcium: 14,
        iron: 2.4,
        potassium: 356
    },
    'coconut-desiccated': {
        name: 'Desiccated Coconut',
        calories: 660,
        totalFat: 65,
        saturatedFat: 57,
        transFat: 0,
        cholesterol: 0,
        sodium: 37,
        totalCarbs: 24,
        fiber: 16.3,
        sugars: 7.4,
        addedSugars: 0,
        protein: 6.9,
        vitaminD: 0,
        calcium: 19,
        iron: 3.4,
        potassium: 543
    },
    'coconut-oil': {
        name: 'Coconut Oil',
        calories: 862,
        totalFat: 100,
        saturatedFat: 87,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        totalCarbs: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 0,
        calcium: 0,
        iron: 0,
        potassium: 0
    },

    // Dairy & Alternatives
    'milk-whole': {
        name: 'Whole Milk',
        calories: 61,
        totalFat: 3.3,
        saturatedFat: 1.9,
        transFat: 0.1,
        cholesterol: 10,
        sodium: 43,
        totalCarbs: 4.8,
        fiber: 0,
        sugars: 4.8,
        addedSugars: 0,
        protein: 3.2,
        vitaminD: 1.3,
        calcium: 113,
        iron: 0.0,
        potassium: 143
    },
    'almond-milk': {
        name: 'Almond Milk (unsweetened)',
        calories: 15,
        totalFat: 1.1,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 150,
        totalCarbs: 0.6,
        fiber: 0.4,
        sugars: 0.2,
        addedSugars: 0,
        protein: 0.6,
        vitaminD: 2.5,
        calcium: 188,
        iron: 0.2,
        potassium: 67
    },
    'coconut-milk': {
        name: 'Coconut Milk',
        calories: 230,
        totalFat: 24,
        saturatedFat: 21,
        transFat: 0,
        cholesterol: 0,
        sodium: 15,
        totalCarbs: 6,
        fiber: 0,
        sugars: 3.3,
        addedSugars: 0,
        protein: 2.3,
        vitaminD: 0,
        calcium: 18,
        iron: 1.6,
        potassium: 263
    },
    'ghee': {
        name: 'Ghee (Clarified Butter)',
        calories: 876,
        totalFat: 100,
        saturatedFat: 62,
        transFat: 4.0,
        cholesterol: 256,
        sodium: 0,
        totalCarbs: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 1.5,
        calcium: 4,
        iron: 0,
        potassium: 5
    },

    // Spices & Flavorings for NutriJewel products
    'cinnamon': {
        name: 'Cinnamon Powder',
        calories: 247,
        totalFat: 1.2,
        saturatedFat: 0.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 10,
        totalCarbs: 81,
        fiber: 53,
        sugars: 2.2,
        addedSugars: 0,
        protein: 4.0,
        vitaminD: 0,
        calcium: 1002,
        iron: 8.3,
        potassium: 431
    },
    'cardamom': {
        name: 'Cardamom',
        calories: 311,
        totalFat: 6.7,
        saturatedFat: 0.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 18,
        totalCarbs: 68,
        fiber: 28,
        sugars: 0,
        addedSugars: 0,
        protein: 11,
        vitaminD: 0,
        calcium: 383,
        iron: 14,
        potassium: 1119
    },
    'vanilla-extract': {
        name: 'Vanilla Extract',
        calories: 288,
        totalFat: 0.1,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 9,
        totalCarbs: 13,
        fiber: 0,
        sugars: 13,
        addedSugars: 0,
        protein: 0.1,
        vitaminD: 0,
        calcium: 11,
        iron: 0.1,
        potassium: 148
    },
    'cocoa-powder': {
        name: 'Cocoa Powder (unsweetened)',
        calories: 228,
        totalFat: 14,
        saturatedFat: 8.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 21,
        totalCarbs: 58,
        fiber: 37,
        sugars: 1.8,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 128,
        iron: 14,
        potassium: 1524
    },
    'dark-chocolate': {
        name: 'Dark Chocolate (70-85% Pure)',
        calories: 598,
        totalFat: 43,
        saturatedFat: 25,
        transFat: 0,
        cholesterol: 2,
        sodium: 9,
        totalCarbs: 46,
        fiber: 11,
        sugars: 24,
        addedSugars: 0,
        protein: 7.9,
        vitaminD: 0,
        calcium: 73,
        iron: 12,
        potassium: 715
    },

    // Indian Spices for Gun Powder (Podi)
    'red-chili-powder': {
        name: 'Red Chili Powder',
        calories: 282,
        totalFat: 14,
        saturatedFat: 2.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 91,
        totalCarbs: 50,
        fiber: 28,
        sugars: 8.8,
        addedSugars: 0,
        protein: 12,
        vitaminD: 0,
        calcium: 330,
        iron: 25,
        potassium: 1950
    },
    'chili-flakes': {
        name: 'Chilli Flakes (Crushed Red Pepper)',
        calories: 282,
        totalFat: 14,
        saturatedFat: 2.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 91,
        totalCarbs: 50,
        fiber: 28,
        sugars: 8.8,
        addedSugars: 0,
        protein: 12,
        vitaminD: 0,
        calcium: 330,
        iron: 25,
        potassium: 1950
    },
    'oregano-dried': {
        name: 'Oregano (Dried)',
        calories: 265,
        totalFat: 4.3,
        saturatedFat: 1.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 25,
        totalCarbs: 69,
        fiber: 42.5,
        sugars: 4.1,
        addedSugars: 0,
        protein: 9,
        vitaminD: 0,
        calcium: 1597,
        iron: 36.8,
        potassium: 1522
    },
    'coriander-seeds': {
        name: 'Coriander Seeds',
        calories: 298,
        totalFat: 17,
        saturatedFat: 1.0,
        transFat: 0,
        cholesterol: 0,
        sodium: 35,
        totalCarbs: 55,
        fiber: 42,
        sugars: 0,
        addedSugars: 0,
        protein: 12,
        vitaminD: 0,
        calcium: 709,
        iron: 16,
        potassium: 1267
    },
    'cumin-seeds': {
        name: 'Cumin Seeds',
        calories: 375,
        totalFat: 22,
        saturatedFat: 1.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 168,
        totalCarbs: 44,
        fiber: 10,
        sugars: 2.2,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 931,
        iron: 66,
        potassium: 1788
    },
    'turmeric': {
        name: 'Turmeric Powder',
        calories: 354,
        totalFat: 10,
        saturatedFat: 3.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 38,
        totalCarbs: 65,
        fiber: 21,
        sugars: 3.2,
        addedSugars: 0,
        protein: 8.0,
        vitaminD: 0,
        calcium: 183,
        iron: 41,
        potassium: 2525
    },
    'fenugreek-seeds': {
        name: 'Fenugreek Seeds',
        calories: 323,
        totalFat: 6.4,
        saturatedFat: 1.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 67,
        totalCarbs: 58,
        fiber: 25,
        sugars: 0,
        addedSugars: 0,
        protein: 23,
        vitaminD: 0,
        calcium: 176,
        iron: 34,
        potassium: 770
    },
    'mustard-seeds': {
        name: 'Mustard Seeds',
        calories: 508,
        totalFat: 36,
        saturatedFat: 1.9,
        transFat: 0,
        cholesterol: 0,
        sodium: 13,
        totalCarbs: 28,
        fiber: 12,
        sugars: 7.0,
        addedSugars: 0,
        protein: 26,
        vitaminD: 0,
        calcium: 521,
        iron: 9.2,
        potassium: 738
    },
    'hing-asafoetida': {
        name: 'Hing (Asafoetida)',
        calories: 297,
        totalFat: 1.1,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 43,
        totalCarbs: 68,
        fiber: 4.0,
        sugars: 0,
        addedSugars: 0,
        protein: 4.0,
        vitaminD: 0,
        calcium: 690,
        iron: 39,
        potassium: 97
    },

    // Legumes for Hummus & Protein
    'chickpeas': {
        name: 'Chickpeas (cooked)',
        calories: 164,
        totalFat: 2.6,
        saturatedFat: 0.6,
        transFat: 0,
        cholesterol: 0,
        sodium: 7,
        totalCarbs: 27,
        fiber: 8.0,
        sugars: 4.8,
        addedSugars: 0,
        protein: 8.9,
        vitaminD: 0,
        calcium: 49,
        iron: 2.9,
        potassium: 291
    },
    'black-gram-urad': {
        name: 'Black Gram (Urad Dal)',
        calories: 341,
        totalFat: 1.6,
        saturatedFat: 0.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 38,
        totalCarbs: 59,
        fiber: 18,
        sugars: 2.0,
        addedSugars: 0,
        protein: 25,
        vitaminD: 0,
        calcium: 138,
        iron: 7.6,
        potessium: 983
    },
    'green-gram-moong': {
        name: 'Green Gram (Moong Dal)',
        calories: 347,
        totalFat: 1.2,
        saturatedFat: 0.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 15,
        totalCarbs: 63,
        fiber: 16,
        sugars: 6.6,
        addedSugars: 0,
        protein: 24,
        vitaminD: 0,
        calcium: 132,
        iron: 6.7,
        potassium: 1246
    },

    // Fruits & Berries
    'avocado': {
        name: 'Avocado',
        calories: 160,
        totalFat: 15,
        saturatedFat: 2.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 7,
        totalCarbs: 9,
        fiber: 7,
        sugars: 0.7,
        addedSugars: 0,
        protein: 2,
        vitaminD: 0,
        calcium: 12,
        iron: 0.6,
        potassium: 485
    },
    'strawberries': {
        name: 'Strawberries',
        calories: 32,
        totalFat: 0.3,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 7.7,
        fiber: 2.0,
        sugars: 4.9,
        addedSugars: 0,
        protein: 0.7,
        vitaminD: 0,
        calcium: 16,
        iron: 0.4,
        potassium: 153
    },
    'blueberries': {
        name: 'Blueberries',
        calories: 57,
        totalFat: 0.3,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 14,
        fiber: 2.4,
        sugars: 10,
        addedSugars: 0,
        protein: 0.7,
        vitaminD: 0,
        calcium: 6,
        iron: 0.3,
        potassium: 77
    },
    'cranberries-dried': {
        name: 'Dried Cranberries (Unsweetened)',
        calories: 308,
        totalFat: 1.4,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 83,
        fiber: 5.3,
        sugars: 65,
        addedSugars: 0,
        protein: 0.1,
        vitaminD: 0,
        calcium: 7,
        iron: 0.4,
        potassium: 49
    },
    'cranberries-dried-sweetened': {
        name: 'Dried Cranberries (Sweetened)',
        calories: 308,
        totalFat: 1.4,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 83,
        fiber: 5.3,
        sugars: 65,
        addedSugars: 26,
        protein: 0.1,
        vitaminD: 0,
        calcium: 7,
        iron: 0.4,
        potassium: 49
    },
    'blueberries-dried': {
        name: 'Dried Blueberries (Unsweetened)',
        calories: 317,
        totalFat: 2.7,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 80,
        fiber: 5.5,
        sugars: 65,
        addedSugars: 0,
        protein: 2,
        vitaminD: 0,
        calcium: 20,
        iron: 0.9,
        potassium: 275
    },
    'blueberries-dried-sweetened': {
        name: 'Dried Blueberries (Sweetened)',
        calories: 317,
        totalFat: 2.7,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 80,
        fiber: 5.5,
        sugars: 65,
        addedSugars: 25,
        protein: 2,
        vitaminD: 0,
        calcium: 20,
        iron: 0.9,
        potassium: 275
    },
    'black-raisins': {
        name: 'Black Raisins (Kala Manuka)',
        calories: 299,
        totalFat: 0.5,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 11,
        totalCarbs: 79,
        fiber: 3.7,
        sugars: 59,
        addedSugars: 0,
        protein: 3.1,
        vitaminD: 0,
        calcium: 50,
        iron: 1.9,
        potassium: 749
    },
    
    // Spices and seasonings for healthy snacks
    'turmeric-powder': {
        name: 'Turmeric Powder (Haldi)',
        calories: 354,
        totalFat: 10,
        saturatedFat: 3.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 38,
        totalCarbs: 65,
        fiber: 21,
        sugars: 3.2,
        addedSugars: 0,
        protein: 8,
        vitaminD: 0,
        calcium: 183,
        iron: 41.4,
        potassium: 2525
    },
    'cinnamon-powder': {
        name: 'Cinnamon Powder (Dalchini)',
        calories: 247,
        totalFat: 1.2,
        saturatedFat: 0.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 10,
        totalCarbs: 81,
        fiber: 53,
        sugars: 2.2,
        addedSugars: 0,
        protein: 4,
        vitaminD: 0,
        calcium: 1002,
        iron: 8.3,
        potassium: 431
    },
    'cardamom-powder': {
        name: 'Cardamom Powder (Elaichi)',
        calories: 311,
        totalFat: 6.7,
        saturatedFat: 0.7,
        transFat: 0,
        cholesterol: 0,
        sodium: 18,
        totalCarbs: 68,
        fiber: 28,
        sugars: 0,
        addedSugars: 0,
        protein: 11,
        vitaminD: 0,
        calcium: 383,
        iron: 14,
        potassium: 1119
    },
    'ginger-powder': {
        name: 'Dried Ginger Powder (Sonth)',
        calories: 335,
        totalFat: 4.2,
        saturatedFat: 1.3,
        transFat: 0,
        cholesterol: 0,
        sodium: 32,
        totalCarbs: 71,
        fiber: 14,
        sugars: 3.4,
        addedSugars: 0,
        protein: 9,
        vitaminD: 0,
        calcium: 114,
        iron: 19.8,
        potassium: 1342
    },
    
    // Fresh vegetables and aromatics
    'garlic': {
        name: 'Fresh Garlic (Lehsun)',
        calories: 149,
        totalFat: 0.5,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 17,
        totalCarbs: 33,
        fiber: 2.1,
        sugars: 1,
        addedSugars: 0,
        protein: 6.4,
        vitaminD: 0,
        calcium: 181,
        iron: 1.7,
        potassium: 401
    },
    'green-chillies': {
        name: 'Green Chillies (Hari Mirch)',
        calories: 40,
        totalFat: 0.4,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 9,
        totalCarbs: 9.5,
        fiber: 1.5,
        sugars: 5.3,
        addedSugars: 0,
        protein: 1.9,
        vitaminD: 0,
        calcium: 18,
        iron: 1.2,
        potassium: 322
    },
    'onion': {
        name: 'Yellow Onion (Pyaz)',
        calories: 40,
        totalFat: 0.1,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 9.3,
        fiber: 1.7,
        sugars: 4.2,
        addedSugars: 0,
        protein: 1.1,
        vitaminD: 0,
        calcium: 23,
        iron: 0.2,
        potassium: 146
    },
    'tomato': {
        name: 'Fresh Tomatoes',
        calories: 18,
        totalFat: 0.2,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 5,
        totalCarbs: 3.9,
        fiber: 1.2,
        sugars: 2.6,
        addedSugars: 0,
        protein: 0.9,
        vitaminD: 0,
        calcium: 10,
        iron: 0.3,
        potassium: 237
    },
    'curry-leaves': {
        name: 'Fresh Curry Leaves (Kadi Patta)',
        calories: 108,
        totalFat: 1,
        saturatedFat: 0.1,
        transFat: 0,
        cholesterol: 0,
        sodium: 4,
        totalCarbs: 18.7,
        fiber: 6.4,
        sugars: 0,
        addedSugars: 0,
        protein: 6.1,
        vitaminD: 0,
        calcium: 830,
        iron: 3.1,
        potassium: 290
    },
    
    // Haldiram's and ready-to-eat snacks
    'haldiram-aloo-bhujiya': {
        name: 'Haldiram Aloo Bhujiya',
        calories: 455,
        totalFat: 25,
        saturatedFat: 8,
        transFat: 0,
        cholesterol: 0,
        sodium: 1200,
        totalCarbs: 52,
        fiber: 8,
        sugars: 4,
        addedSugars: 2,
        protein: 12,
        vitaminD: 0,
        calcium: 45,
        iron: 2.8,
        potassium: 380
    },
    'fine-sev': {
        name: 'Fine Sev (Namkeen)',
        calories: 463,
        totalFat: 26,
        saturatedFat: 9,
        transFat: 0,
        cholesterol: 0,
        sodium: 1350,
        totalCarbs: 50,
        fiber: 6,
        sugars: 3,
        addedSugars: 1,
        protein: 14,
        vitaminD: 0,
        calcium: 38,
        iron: 3.2,
        potassium: 290
    },
    'haldiram-sev': {
        name: 'Haldiram Sev (Commercial)',
        calories: 463,
        totalFat: 26,
        saturatedFat: 9,
        transFat: 0,
        cholesterol: 0,
        sodium: 1350,
        totalCarbs: 50,
        fiber: 6,
        sugars: 3,
        addedSugars: 1,
        protein: 14,
        vitaminD: 0,
        calcium: 38,
        iron: 3.2,
        potassium: 290
    },
    'garden-sev': {
        name: 'Garden Sev (Commercial)',
        calories: 463,
        totalFat: 26,
        saturatedFat: 9,
        transFat: 0,
        cholesterol: 0,
        sodium: 1350,
        totalCarbs: 50,
        fiber: 6,
        sugars: 3,
        addedSugars: 1,
        protein: 14,
        vitaminD: 0,
        calcium: 38,
        iron: 3.2,
        potassium: 290
    },
    'chana-dal': {
        name: 'Chana Dal (Split Bengal Gram)',
        calories: 335,
        totalFat: 1.5,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 56,
        totalCarbs: 61,
        fiber: 17,
        sugars: 10,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 45,
        iron: 2.9,
        potassium: 718
    },

    // Comprehensive flour varieties for healthy baking
    'whole-wheat-flour': {
        name: 'Whole Wheat Flour',
        calories: 340,
        totalFat: 2.5,
        saturatedFat: 0.4,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 72,
        fiber: 10.7,
        sugars: 0.4,
        addedSugars: 0,
        protein: 13.2,
        vitaminD: 0,
        calcium: 34,
        iron: 3.6,
        potassium: 405
    },
    'all-purpose-flour': {
        name: 'All-Purpose Flour (Maida)',
        calories: 364,
        totalFat: 1.0,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 76,
        fiber: 2.7,
        sugars: 0.3,
        addedSugars: 0,
        protein: 10.3,
        vitaminD: 0,
        calcium: 15,
        iron: 4.6,
        potassium: 107
    },
    'almond-flour': {
        name: 'Almond Flour',
        calories: 579,
        totalFat: 50,
        saturatedFat: 3.8,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 22,
        fiber: 12,
        sugars: 4.4,
        addedSugars: 0,
        protein: 21,
        vitaminD: 0,
        calcium: 269,
        iron: 3.7,
        potassium: 733
    },
    'coconut-flour': {
        name: 'Coconut Flour',
        calories: 400,
        totalFat: 13,
        saturatedFat: 13,
        transFat: 0,
        cholesterol: 0,
        sodium: 50,
        totalCarbs: 60,
        fiber: 40,
        sugars: 20,
        addedSugars: 0,
        protein: 20,
        vitaminD: 0,
        calcium: 50,
        iron: 3.9,
        potassium: 1000
    },
    'besan-chickpea-flour': {
        name: 'Besan (Chickpea Flour)',
        calories: 387,
        totalFat: 6.7,
        saturatedFat: 1.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 64,
        totalCarbs: 57,
        fiber: 11,
        sugars: 11,
        addedSugars: 0,
        protein: 22,
        vitaminD: 0,
        calcium: 45,
        iron: 4.9,
        potassium: 846
    },
    'sattu': {
        name: 'Sattu (Roasted Chickpea Flour)',
        calories: 355,
        totalFat: 4.5,
        saturatedFat: 0.5,
        transFat: 0,
        cholesterol: 0,
        sodium: 24,
        totalCarbs: 62,
        fiber: 15,
        sugars: 10,
        addedSugars: 0,
        protein: 18,
        vitaminD: 0,
        calcium: 60,
        iron: 4.5,
        potassium: 846
    },

    // Nut & Seed Butters
    'peanut-butter': {
        name: 'Peanut Butter (Natural)',
        calories: 588,
        totalFat: 50,
        saturatedFat: 10,
        transFat: 0,
        cholesterol: 0,
        sodium: 17,
        totalCarbs: 20,
        fiber: 6,
        sugars: 2.4,
        addedSugars: 0,
        protein: 25,
        vitaminD: 0,
        calcium: 43,
        iron: 1.9,
        potassium: 649
    },
    'almond-butter': {
        name: 'Almond Butter',
        calories: 614,
        totalFat: 56,
        saturatedFat: 4.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 7,
        totalCarbs: 18,
        fiber: 10,
        sugars: 4.4,
        addedSugars: 0,
        protein: 21,
        vitaminD: 0,
        calcium: 347,
        iron: 3.9,
        potassium: 748
    },

    // Breakfast Cereals
    'rice-crisps': {
        name: 'Rice Crisps (Puffed Rice)',
        calories: 387,
        totalFat: 1,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 2,
        totalCarbs: 87,
        fiber: 2,
        sugars: 0.3,
        addedSugars: 0,
        protein: 7,
        vitaminD: 0,
        calcium: 11,
        iron: 0.8,
        potassium: 95
    },

    // Dried Fruits
    'dried-blueberry': {
        name: 'Dried Blueberries (Unsweetened)',
        calories: 317,
        totalFat: 2.7,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 80,
        fiber: 5.5,
        sugars: 65,
        addedSugars: 0,
        protein: 2,
        vitaminD: 0,
        calcium: 20,
        iron: 0.9,
        potassium: 275
    },
    'dried-blueberry-sweetened': {
        name: 'Dried Blueberries (Sweetened)',
        calories: 317,
        totalFat: 2.7,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 3,
        totalCarbs: 80,
        fiber: 5.5,
        sugars: 65,
        addedSugars: 25,
        protein: 2,
        vitaminD: 0,
        calcium: 20,
        iron: 0.9,
        potassium: 275
    },

    // Beverages
    'orange-juice': {
        name: 'Orange Juice (Fresh)',
        calories: 45,
        totalFat: 0.2,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 10.4,
        fiber: 0.2,
        sugars: 8.4,
        addedSugars: 0,
        protein: 0.7,
        vitaminD: 0,
        calcium: 11,
        iron: 0.2,
        potassium: 200
    },
    'instant-coffee': {
        name: 'Instant Coffee (Powder)',
        calories: 94,
        totalFat: 0.5,
        saturatedFat: 0.2,
        transFat: 0,
        cholesterol: 0,
        sodium: 76,
        totalCarbs: 17,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 12,
        vitaminD: 0,
        calcium: 141,
        iron: 4.4,
        potassium: 3535
    },

    // Basic ingredients
    'salt': {
        name: 'Salt',
        calories: 0,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 38758,
        totalCarbs: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 0,
        calcium: 24,
        iron: 0.3,
        potassium: 8
    },
    'baking-soda': {
        name: 'Baking Soda',
        calories: 0,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 27360,
        totalCarbs: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        protein: 0,
        vitaminD: 0,
        calcium: 0,
        iron: 0,
        potassium: 0
    },
    'lemon-juice': {
        name: 'Lemon Juice',
        calories: 22,
        totalFat: 0.2,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 1,
        totalCarbs: 6.9,
        fiber: 0.3,
        sugars: 1.5,
        addedSugars: 0,
        protein: 0.4,
        vitaminD: 0,
        calcium: 6,
        iron: 0.1,
        potassium: 103
    },
};

// Unit conversion factors to grams
const UNIT_CONVERSIONS = {
    'gram': 1,
    'cup': 240,       // default, varies by ingredient
    'tablespoon': 15,
    'teaspoon': 5,
    'ounce': 28.35,
    'pound': 453.59,
    'piece': 100,     // default for items counted as pieces
    'slice': 50,      // default for sliced items
    'ml': 1,          // for liquids, assume 1ml ≈ 1g
    'liter': 1000,
    'kilogram': 1000
};

// Specific conversions for NutriJewel ingredients
const INGREDIENT_SPECIFIC_CONVERSIONS = {
    // Flours & Powders
    'ragi-finger-millet': {
        'cup': 120
    },
    'bajra-pearl-millet': {
        'cup': 125
    },
    'jowar-sorghum': {
        'cup': 115
    },
    'jowar-flour': {
        'cup': 120,
        'tablespoon': 7.5
    },
    'amaranth-grain': {
        'cup': 195
    },
    'quinoa': {
        'cup': 170
    },
    'buckwheat-flour': {
        'cup': 120
    },
    'almond-flour': {
        'cup': 112
    },
    'coconut-flour': {
        'cup': 112
    },
    'cocoa-powder': {
        'cup': 85,
        'tablespoon': 5.5
    },
    
    // Comprehensive Nuts (shelled, whole) - All World Varieties
    'almonds': {
        'cup': 143,
        'piece': 1.2
    },
    'walnuts-english': {
        'cup': 117,
        'piece': 3.0
    },
    'walnuts-black': {
        'cup': 125,
        'piece': 3.2
    },
    'cashews': {
        'cup': 137,
        'piece': 0.7
    },
    'pistachios': {
        'cup': 123,
        'piece': 0.6
    },
    'hazelnuts': {
        'cup': 135,
        'piece': 0.8
    },
    'pecans': {
        'cup': 109,
        'piece': 1.5
    },
    'brazil-nuts': {
        'cup': 133,
        'piece': 5.0
    },
    'macadamia-nuts': {
        'cup': 134,
        'piece': 2.0
    },
    'pine-nuts': {
        'cup': 135,
        'tablespoon': 9
    },
    'chestnuts': {
        'cup': 140,    // cooked
        'piece': 15
    },
    'beechnuts': {
        'cup': 120,
        'piece': 0.4
    },
    'hickory-nuts': {
        'cup': 120,
        'piece': 1.8
    },
    'butternuts': {
        'cup': 115,
        'piece': 3.5
    },
    'coconut-meat': {
        'cup': 80     // fresh, shredded
    },
    'candlenuts': {
        'cup': 140,
        'piece': 8
    },
    'sacha-inchi': {
        'cup': 138,
        'piece': 1.2
    },
    'kola-nuts': {
        'cup': 150,
        'piece': 12
    },
    'peanuts': {
        'cup': 146,
        'piece': 0.8
    },
    'tiger-nuts': {
        'cup': 120,
        'piece': 0.5
    },
    'acorns': {
        'cup': 145,    // processed flour
        'piece': 3.5
    },
    'ginkgo-nuts': {
        'cup': 155,    // cooked
        'piece': 2.8
    },
    
    // Comprehensive Seeds - All World Varieties
    'chia-seeds': {
        'cup': 160,
        'tablespoon': 10
    },
    'flax-seeds': {
        'cup': 168,
        'tablespoon': 10.5
    },
    'hemp-seeds': {
        'cup': 160,
        'tablespoon': 10
    },
    'pumpkin-seeds': {
        'cup': 140,
        'tablespoon': 9
    },
    'sunflower-seeds': {
        'cup': 140,
        'tablespoon': 9
    },
    'sesame-seeds': {
        'cup': 144,
        'tablespoon': 9
    },
    'watermelon-seeds': {
        'cup': 108,
        'tablespoon': 7
    },
    'poppy-seeds': {
        'cup': 145,
        'tablespoon': 9,
        'teaspoon': 3
    },
    'nigella-seeds': {
        'cup': 112,
        'tablespoon': 7,
        'teaspoon': 2.3
    },
    'lotus-seeds': {
        'cup': 145,    // dried
        'piece': 1.4
    },
    'perilla-seeds': {
        'cup': 160,
        'tablespoon': 10
    },
    'basil-seeds': {
        'cup': 128,
        'tablespoon': 8,
        'teaspoon': 2.7
    },
    'quinoa-seeds': {
        'cup': 170,    // uncooked
        'tablespoon': 11
    },
    'caraway-seeds': {
        'cup': 112,
        'tablespoon': 7,
        'teaspoon': 2.3
    },
    'fennel-seeds': {
        'cup': 87,
        'tablespoon': 5.4,
        'teaspoon': 1.8
    },
    'anise-seeds': {
        'cup': 96,
        'tablespoon': 6,
        'teaspoon': 2
    },
    'dill-seeds': {
        'cup': 112,
        'tablespoon': 7,
        'teaspoon': 2.3
    },
    'amaranth-seeds': {
        'cup': 195,
        'tablespoon': 12
    },
    'sacha-inchi-seeds': {
        'cup': 138,
        'tablespoon': 9
    },
    'pomegranate-seeds': {
        'cup': 174,    // arils with juice
        'tablespoon': 11
    },
    'grape-seeds': {
        'cup': 160,
        'tablespoon': 10
    },
    'baobab-seeds': {
        'cup': 120,
        'tablespoon': 7.5
    },
    'moringa-seeds': {
        'cup': 140,
        'tablespoon': 9,
        'piece': 0.3
    },
    'papaya-seeds': {
        'cup': 140,
        'tablespoon': 9
    },
    'cantaloupe-seeds': {
        'cup': 108,
        'tablespoon': 7
    },
    'honeydew-seeds': {
        'cup': 110,
        'tablespoon': 7
    },
    'teff-seeds': {
        'cup': 193,
        'tablespoon': 12
    },
    'milk-thistle-seeds': {
        'cup': 170,
        'tablespoon': 11
    },
    'evening-primrose-seeds': {
        'cup': 128,
        'tablespoon': 8
    },
    'fenugreek-seeds': {
        'cup': 183,    // whole seeds
        'tablespoon': 11,
        'teaspoon': 3.7
    },
    'mustard-seeds': {
        'cup': 192,    // yellow mustard seeds
        'tablespoon': 12,
        'teaspoon': 4
    },
    
    // Traditional Ingredients
    'gond-edible-gum': {
        'tablespoon': 8,
        'teaspoon': 3
    },
    'dink-gum-tragacanth': {
        'tablespoon': 7,
        'teaspoon': 2.5
    },
    'foxnuts-makhana': {
        'cup': 20,     // very light when puffed
        'piece': 0.5
    },
    
    // Dates & Sweeteners
    'dates-medjool': {
        'cup': 147,    // pitted, chopped
        'piece': 24
    },
    'dates-deglet-noor': {
        'cup': 147,    // pitted, chopped
        'piece': 7.1
    },
    'dates-mazafati': {
        'cup': 150,    // pitted, soft Iranian dates
        'piece': 12    // medium-large size
    },
    'dates-kimia': {
        'cup': 145,    // pitted, premium Iranian dates
        'piece': 10    // medium size
    },
    'khajoor-paste': {
        'cup': 280,
        'tablespoon': 18
    },
    'figs-dried': {
        'cup': 149,
        'piece': 8.4
    },
    'raisins': {
        'cup': 145
    },
    'jaggery-gur': {
        'cup': 200,
        'tablespoon': 12.5
    },
    'honey': {
        'cup': 340,
        'tablespoon': 21
    },
    'coconut-palm-sugar': {
        'cup': 180,
        'tablespoon': 12
    },
    
    // Coconut Products
    'coconut-fresh': {
        'cup': 80      // shredded
    },
    'coconut-desiccated': {
        'cup': 93,     // unsweetened
        'tablespoon': 6
    },
    'coconut-oil': {
        'cup': 218,
        'tablespoon': 13.6
    },
    
    // Dairy & Alternatives
    'milk-whole': {
        'cup': 244
    },
    'almond-milk': {
        'cup': 240
    },
    'coconut-milk': {
        'cup': 240
    },
    'ghee': {
        'cup': 202,
        'tablespoon': 12.8
    },
    
    // Spices (most are very light)
    'cinnamon': {
        'tablespoon': 8,
        'teaspoon': 2.6
    },
    'cardamom': {
        'tablespoon': 5.8,
        'teaspoon': 1.9
    },
    'red-chili-powder': {
        'tablespoon': 8,
        'teaspoon': 2.7
    },
    'coriander-seeds': {
        'tablespoon': 6,
        'teaspoon': 2
    },
    'cumin-seeds': {
        'tablespoon': 6,
        'teaspoon': 2
    },
    'turmeric': {
        'tablespoon': 9,
        'teaspoon': 3
    },
    'fenugreek-seeds': {
        'tablespoon': 11,
        'teaspoon': 3.7
    },
    'mustard-seeds': {
        'tablespoon': 11,
        'teaspoon': 3.7
    },
    
    // Legumes (cooked)
    'chickpeas': {
        'cup': 164     // cooked
    },
    'black-gram-urad': {
        'cup': 200     // dry weight
    },
    'green-gram-moong': {
        'cup': 202     // dry weight
    },
    
    // Fruits
    'avocado': {
        'cup': 150,    // cubed
        'piece': 200   // medium avocado
    },
    'strawberries': {
        'cup': 144,    // sliced
        'piece': 12    // medium berry
    },
    'blueberries': {
        'cup': 148
    },
    'cranberries-dried': {
        'cup': 120
    },
    
    // Basic ingredients with very specific measurements
    'vanilla-extract': {
        'tablespoon': 13,
        'teaspoon': 4.3
    },
    'lemon-juice': {
        'cup': 244,
        'tablespoon': 15.25
    },
    
    // New ingredients for NutriJewel & Cinnamon Kitchen
    'whole-wheat-flour': {
        'cup': 120,
        'tablespoon': 7.5
    },
    'all-purpose-flour': {
        'cup': 125,
        'tablespoon': 7.8
    },
    'besan-chickpea-flour': {
        'cup': 92,
        'tablespoon': 5.8
    },
    'sattu': {
        'cup': 95,
        'tablespoon': 6
    },
    'peanut-butter': {
        'cup': 250,
        'tablespoon': 16
    },
    'almond-butter': {
        'cup': 250,
        'tablespoon': 16
    },
    'rice-crisps': {
        'cup': 14,
        'tablespoon': 3.5
    },
    'dried-blueberry': {
        'cup': 140,
        'tablespoon': 8.8
    },
    'orange-juice': {
        'cup': 248,
        'tablespoon': 15.5
    },
    'instant-coffee': {
        'teaspoon': 1.8,
        'tablespoon': 5.4
    },
    'active-dry-yeast': {
        'tablespoon': 9.5,
        'teaspoon': 3.2
    },
    'ghee': {
        'cup': 205,
        'tablespoon': 13,
        'teaspoon': 4.3
    },
    'amul-milk': {
        'cup': 240,
        'tablespoon': 15
    },
    'amul-butter': {
        'cup': 227,
        'tablespoon': 14.2
    },
    'sunflower-oil': {
        'cup': 218,
        'tablespoon': 13.6
    },
    'curd-yogurt': {
        'cup': 245,
        'tablespoon': 15.3
    },
    'amul-curd': {
        'cup': 245,
        'tablespoon': 15.3
    },
    'milky-mist-curd': {
        'cup': 245,
        'tablespoon': 15.3
    },
    'white-sugar': {
        'cup': 200,
        'tablespoon': 12.5
    },
    'brown-sugar': {
        'cup': 213,
        'tablespoon': 13.3
    },
    'coconut-sugar': {
        'cup': 180,
        'tablespoon': 11.3
    },
    'maple-syrup': {
        'cup': 322,
        'tablespoon': 20
    },
    'vanhouten-dark-chocolate': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'vanhouten-cocoa-powder': {
        'tablespoon': 5,
        'teaspoon': 2
    },
    'vanhouten-dutch-cocoa': {
        'tablespoon': 5,
        'teaspoon': 2
    },
    'vanhouten-drinking-chocolate': {
        'tablespoon': 10,
        'teaspoon': 3.3
    },
    'vanhouten-milk-chocolate': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'amul-dark-chocolate-55': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'amul-dark-chocolate-70': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'amul-dark-chocolate-85': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'amul-dark-chocolate-90': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'dark-chocolate-70': {
        'cup': 150,  // chopped
        'piece': 5   // small square
    },
    'cocoa-powder': {
        'cup': 85,
        'tablespoon': 5.5
    },
    'vanilla-extract': {
        'tablespoon': 13,
        'teaspoon': 4.3
    },
    'eggs': {
        'piece': 50  // large egg
    },
    'powdered-sugar': {
        'cup': 120,
        'tablespoon': 7.5
    },
    'black-raisins': {
        'cup': 145,
        'tablespoon': 9
    },
    'turmeric-powder': {
        'tablespoon': 9,
        'teaspoon': 3
    },
    'salt': {
        'tablespoon': 18,
        'teaspoon': 6
    },
    'cinnamon-powder': {
        'tablespoon': 8,
        'teaspoon': 2.6
    },
    'cardamom-powder': {
        'tablespoon': 6,
        'teaspoon': 2
    },
    'ginger-powder': {
        'tablespoon': 5.4,
        'teaspoon': 1.8
    },
    'oregano-dried': {
        'tablespoon': 3,
        'teaspoon': 1
    },
    'chili-flakes': {
        'tablespoon': 5.3,
        'teaspoon': 1.8
    },
    'garlic': {
        'clove': 3,  // minced
        'tablespoon': 8.5
    },
    'green-chillies': {
        'piece': 4,  // medium chilli
        'tablespoon': 9
    },
    'onion': {
        'cup': 160,  // chopped
        'medium': 110
    },
    'tomato': {
        'cup': 180,  // chopped
        'medium': 123
    },
    'curry-leaves': {
        'cup': 20,   // packed
        'tablespoon': 1.3
    },
    'haldiram-aloo-bhujiya': {
        'cup': 50,   // as measured for snacking
        'tablespoon': 3.1
    },
    'fine-sev': {
        'cup': 45,   // as measured for garnish
        'tablespoon': 2.8
    },
    'haldiram-sev': {
        'cup': 45,   // as measured for garnish
        'tablespoon': 2.8
    },
    'garden-sev': {
        'cup': 45,   // as measured for garnish
        'tablespoon': 2.8
    },
    'chana-dal': {
        'cup': 196,  // dry weight
        'tablespoon': 12.3
    },
    'almond-butter': {
        'cup': 250,
        'tablespoon': 16
    },
    'peanut-butter': {
        'cup': 258,
        'tablespoon': 16
    },
    'hazelnuts-raw': {
        'cup': 135,
        'tablespoon': 8.5
    },
    'hazelnuts-roasted': {
        'cup': 135,
        'tablespoon': 8.5
    },
    'hazelnuts-blanched': {
        'cup': 135,
        'tablespoon': 8.5
    },
    'hazelnuts-chopped': {
        'cup': 135,
        'tablespoon': 8.5
    },
    'hazelnut-flour': {
        'cup': 96,
        'tablespoon': 6
    },
    'hazelnut-butter': {
        'cup': 250,
        'tablespoon': 16
    },
    'blueberries-dried': {
        'cup': 140,
        'tablespoon': 8.8
    },
    'sattu': {
        'cup': 120,
        'tablespoon': 7.5
    },
    'yeast-active-dry': {
        'tablespoon': 8,
        'teaspoon': 2.7,
        'packet': 7  // standard 7g packet
    },
    'orange-juice': {
        'cup': 248,
        'tablespoon': 15.5
    },
    'instant-coffee': {
        'tablespoon': 6,
        'teaspoon': 2
    },
    'rice-crisps': {
        'cup': 14,  // puffed, very light
        'tablespoon': 0.9
    }
};

// FDA Daily Values (based on 2000 calorie diet)
const FDA_DAILY_VALUES = {
    totalFat: 78,        // grams
    saturatedFat: 20,    // grams
    cholesterol: 300,    // mg
    sodium: 2300,        // mg
    totalCarbs: 275,     // grams
    fiber: 28,           // grams
    addedSugars: 50,     // grams
    protein: 50,         // grams (not required for % DV)
    vitaminD: 20,        // mcg
    calcium: 1300,       // mg
    iron: 18,            // mg
    potassium: 4700      // mg
};

// Get ingredient list for autocomplete
function getIngredientList() {
    return Object.keys(NUTRITION_DATA).map(key => ({
        id: key,
        name: NUTRITION_DATA[key].name
    }));
}

// Convert ingredient amount to grams
function convertToGrams(ingredient, amount, unit) {
    // Check for ingredient-specific conversion first
    if (INGREDIENT_SPECIFIC_CONVERSIONS[ingredient] && INGREDIENT_SPECIFIC_CONVERSIONS[ingredient][unit]) {
        return amount * INGREDIENT_SPECIFIC_CONVERSIONS[ingredient][unit];
    }
    
    // Use general conversion
    if (UNIT_CONVERSIONS[unit]) {
        return amount * UNIT_CONVERSIONS[unit];
    }
    
    // Default to grams if unit not found
    return amount;
}

// Get nutrition data for ingredient
function getNutritionData(ingredientId) {
    return NUTRITION_DATA[ingredientId] || null;
}
