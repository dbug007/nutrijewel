import React, { useState } from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import './ProductsPage.css';

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Products');

  // NutriJewel Original Products from project details
  const products = [
    {
      id: 1,
      name: "NJ Amrit Bites (Dink/Gond Ladoo)",
      displayName: "NJ Amrit Bites",
      description: "Traditional Dink/Gond ladoos, refined sugar free, ideal for postpartum recovery and bone health support.",
      price: "₹299",
      originalPrice: "₹349",
      image: "/assets/products/NJ_AmritBites.png",
      rating: 4.8,
      reviews: 124,
      category: "Traditional",
      benefits: ["Refined Sugar Free", "Postpartum Recovery", "Bone Health Support", "Traditional Recipe"]
    },
    {
      id: 2,
      name: "NJ Signature Granola",
      displayName: "NJ Signature Granola",
      description: "Gourmet blend with cinnamon, dark chocolate, and mocha hints. High in fiber, great for breakfast or snacking.",
      price: "₹399",
      originalPrice: "₹449",
      image: "/assets/products/NJ_Granola.png",
      rating: 4.9,
      reviews: 89,
      category: "Breakfast",
      benefits: ["High Fiber", "Cinnamon & Dark Chocolate", "Breakfast Perfect", "Gourmet Blend"]
    },
    {
      id: 3,
      name: "NJ Signature Granola Cookies",
      displayName: "NJ Signature Granola Cookies",
      description: "Wholesome cookies made from granola, free from refined sugar, preservatives, and artificial additives.",
      price: "₹249",
      originalPrice: "₹299",
      image: "/assets/products/NJ_GranolaCookies.png",
      rating: 4.7,
      reviews: 156,
      category: "Cookies",
      benefits: ["No Preservatives", "Refined Sugar Free", "Wholesome Granola", "Artificial Free"]
    },
    {
      id: 4,
      name: "NJ Special Bliss Bites (Dates & Nuts Ladoo)",
      displayName: "NJ Special Bliss Bites",
      description: "Rich in fiber and protein, this refined sugar free laddoo is perfect for pre/post workout nourishment.",
      price: "₹329",
      originalPrice: "₹379",
      image: "/assets/products/NJ_BlissBites.png",
      rating: 4.8,
      reviews: 203,
      category: "Energy",
      benefits: ["High Protein", "Pre/Post Workout", "Dates & Nuts", "Energy Boost"]
    },
    {
      id: 5,
      name: "Foxnut & Millet Crunch (Roasted)",
      displayName: "Foxnut & Millet Crunch",
      description: "Roasted foxnuts and millet blend for a crunchy, guilt-free snack full of minerals and light on calories.",
      price: "₹199",
      originalPrice: "₹249",
      image: "/assets/products/NJ_MilletCrunch.png",
      rating: 4.6,
      reviews: 78,
      category: "Snacks",
      benefits: ["Low Calorie", "Minerals", "Crunchy", "Guilt-Free"]
    },
    {
      id: 6,
      name: "NJ Ragi Sattva (Nachani Ladoo)",
      displayName: "NJ Ragi Sattva",
      description: "Gluten free and refined sugar free Ragi ladoos that promote immunity, bone strength, and energy.",
      price: "₹279",
      originalPrice: "₹329",
      image: "/assets/products/NJ_RagiSattva.png",
      rating: 4.7,
      reviews: 92,
      category: "Health",
      benefits: ["Gluten-Free", "Immunity", "Bone Strength", "Energy"]
    },
    {
      id: 7,
      name: "NJ Signature Nutri Bars / Bites",
      displayName: "NJ Signature Nutri Bars",
      description: "Dark chocolate-flavored bars packed with nutrients. Ideal for healthy snacking and sustained energy.",
      price: "₹349",
      originalPrice: "₹399",
      image: "/assets/products/NJ_NutriBars.png",
      rating: 4.8,
      reviews: 167,
      category: "Energy",
      benefits: ["Dark Chocolate", "Nutrient-Dense", "Sustained Energy", "Healthy Snacking"]
    },
    {
      id: 8,
      name: "Jewel's Omega Crunch (Roasted Trail Mix)",
      displayName: "Jewel's Omega Crunch",
      description: "A heart-healthy roasted trail mix, rich in omega-3 and clean plant-based ingredients.",
      price: "₹399",
      originalPrice: "₹449",
      image: "/assets/products/NJ_OmegaCrunch.png",
      rating: 4.9,
      reviews: 134,
      category: "Trail Mix",
      benefits: ["Heart-Healthy", "Omega-3", "Plant-Based", "Trail Mix"]
    },
    {
      id: 9,
      name: "Jewel's Gun Powder (Podi Masala)",
      displayName: "Jewel's Gun Powder",
      description: "South Indian-style spice blend (podi) perfect as a dry chutney or seasoning, handcrafted in small batches.",
      price: "₹179",
      originalPrice: "₹219",
      image: "/assets/products/NJ_GunPowder.png",
      rating: 4.7,
      reviews: 89,
      category: "Spices",
      benefits: ["South Indian", "Handcrafted", "Spice Blend", "Small Batch"]
    },
    {
      id: 10,
      name: "NJ Special 100% Peanut Butter",
      displayName: "NJ Special 100% Peanut Butter",
      description: "Pure, refined sugar free peanut butter made with 100% peanuts. No additives, rich in protein and healthy fats.",
      price: "₹299",
      originalPrice: "₹349",
      image: "/assets/products/NJ_PeanutButter.png",
      rating: 4.8,
      reviews: 156,
      category: "Spreads",
      benefits: ["100% Peanuts", "No Additives", "High Protein", "Healthy Fats"]
    },
    {
      id: 11,
      name: "NJ Special Low Fat Hummus",
      displayName: "NJ Special Low Fat Hummus",
      description: "High-protein, fiber-rich hummus with no added oil. Smooth, savory, and gut-friendly.",
      price: "₹249",
      originalPrice: "₹299",
      image: "/assets/products/NJ_Hummus.png",
      rating: 4.6,
      reviews: 112,
      category: "Spreads",
      benefits: ["Low Fat", "High Protein", "No Oil", "Gut-Friendly"]
    },
    {
      id: 12,
      name: "Jewel's Avo Guac Quack",
      displayName: "Jewel's Avo Guac Quack",
      description: "Creamy avocado dip made fresh. Best paired with crackers or used as a sandwich spread.",
      price: "₹329",
      originalPrice: "₹379",
      image: "/assets/products/NJ_GuacQuack.png",
      rating: 4.7,
      reviews: 98,
      category: "Spreads",
      benefits: ["Fresh Avocado", "Creamy", "Sandwich Spread", "Crackers"]
    },
    {
      id: 13,
      name: "Thandai Maharaja Cake",
      displayName: "Thandai Maharaja Cake",
      description: "A celebratory cake infused with thandai spice blend, free from refined flour and sugars.",
      price: "₹599",
      originalPrice: "₹699",
      image: "/assets/products/NJ_MaharajaCake.png",
      rating: 4.9,
      reviews: 67,
      category: "Cakes",
      benefits: ["Thandai", "Celebratory", "No Refined Flour", "No Refined Sugar"]
    },
    {
      id: 14,
      name: "Cambridge of Chocolate (Walnut Dark Chocolate Cake)",
      displayName: "Cambridge of Chocolate",
      description: "Luxurious dark chocolate cake with walnut crunch. Clean, eggless, preservative-free indulgence.",
      price: "₹649",
      originalPrice: "₹749",
      image: "/assets/products/NJ_CambridgeCake.png",
      rating: 4.8,
      reviews: 89,
      category: "Cakes",
      benefits: ["Dark Chocolate", "Walnut", "Eggless", "Preservative-Free"]
    },
    {
      id: 15,
      name: "Khajoor Ka Khazana (Stuffed Dates)",
      displayName: "Khajoor Ka Khazana",
      description: "Decadent dates stuffed with clean ingredients. No sugar or additives, only nature's goodness.",
      price: "₹379",
      originalPrice: "₹429",
      image: "/assets/products/NJ_KhajoorKhazana.png",
      rating: 4.8,
      reviews: 145,
      category: "Traditional",
      benefits: ["Stuffed Dates", "No Additives", "Natural", "Decadent"]
    },
    {
      id: 16,
      name: "Oxford of Love (Strawberry Dark Chocolate Cake)",
      displayName: "Oxford of Love",
      description: "Elegant strawberry and dark chocolate cake, made clean without any preservatives or artificial flavors.",
      price: "₹629",
      originalPrice: "₹729",
      image: "/assets/products/NJ_OxfordCake.png",
      rating: 4.9,
      reviews: 76,
      category: "Cakes",
      benefits: ["Strawberry", "Dark Chocolate", "No Preservatives", "No Artificial Flavors"]
    }
  ];

  const categories = ["All Products", "Traditional", "Breakfast", "Cookies", "Energy", "Snacks", "Health", "Trail Mix", "Spices", "Spreads", "Cakes"];

  const filteredProducts = selectedCategory === 'All Products' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handlePurchase = (productName) => {
    const message = `Hi! I'm interested in purchasing ${productName}. Can you please provide more details about availability and delivery?`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="products-page">
      {/* Header Section */}
      <section className="products-header">
        <div className="products-container">
          <h1 className="products-title">
            Our <span className="products-title-green">Products</span>
          </h1>
          <p className="products-subtitle">
            Discover our range of clean, handcrafted, nutritious products designed to promote health and happiness.
          </p>
          <div className="products-divider"></div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="products-filter">
        <div className="products-container">
          <div className="filter-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-grid-section">
        <div className="products-container">
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-overlay">
                    <button className="wishlist-btn">
                      <Heart size={20} />
                    </button>
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-category-tag">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  {/* Rating */}
                  <div className="product-rating">
                    <div className="product-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                      <span className="rating-number">{product.rating}</span>
                    </div>
                    <span className="product-reviews">({product.reviews} reviews)</span>
                  </div>

                  {/* Benefits */}
                  <div className="product-benefits">
                    {product.benefits.slice(0, 2).map((benefit, index) => (
                      <span key={index} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="product-pricing">
                    <span className="product-price">{product.price}</span>
                    {product.originalPrice && (
                      <span className="product-original-price">{product.originalPrice}</span>
                    )}
                  </div>

                  {/* Buy Button */}
                  <button 
                    className="product-buy-btn"
                    onClick={() => handlePurchase(product.name)}
                  >
                    <ShoppingBag size={18} />
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="products-cta">
        <div className="products-container">
          <div className="cta-content">
            <h2>Can't Find What You're Looking For?</h2>
            <p>Let us know your preferences and we'll create something special just for you!</p>
            <button 
              className="cta-btn"
              onClick={() => handlePurchase("custom product consultation")}
            >
              Get Custom Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
