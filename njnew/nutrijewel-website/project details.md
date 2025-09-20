# NutriJewel Website Project Details

A complete reference document for building the **NutriJewel** website. This site showcases clean, handcrafted, nutritious snacks designed to promote health and happiness.

---

## 🌐 Website Structure

### 🏠 Home Page

* Brand tagline and introduction
* Highlighted health promises
* Featured product section
* Testimonials
* CTA to explore products or contact

### 🏦 About Page

* Founder story
* Brand mission and origin
* Clean eating philosophy
* Artisanal, nutrient-dense focus

### 💼 Products Page

* Full catalog of products with image, description, pricing, ingredients/highlights
* Filter or sort by category (optional)

### 📢 Contact Page

* Inquiry form
* WhatsApp/phone/email links
* Social handles

---

## 📅 Product Catalog

| Product Name   | Display Name                                | Image File Name        | Description                                                                                                   |
| -------------- | ------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Amrit Bites    | NJ Amrit Bites (Dink/Gond Ladoo)            | NJ\_AmritBites.png     | Traditional Dink/Gond ladoos, refined sugar free, ideal for postpartum recovery and bone health support.      |
| Granola        | NJ Signature Granola                        | NJ\_Granola.png        | Gourmet blend with cinnamon, dark chocolate, and mocha hints. High in fiber, great for breakfast or snacking. |
| GranolaCookies | NJ Signature Granola Cookies                | NJ\_GranolaCookies.png | Wholesome cookies made from granola, free from refined sugar, preservatives, and artificial additives.        |
| BlissBites     | NJ Special Bliss Bites (Dates & Nuts Ladoo) | NJ\_BlissBites.png     | Rich in fiber and protein, this refined sugar-free laddoo is perfect for pre/post workout nourishment.        |
| MilletCrunch   | Foxnut & Millet Crunch (Roasted)            | NJ\_MilletCrunch.png   | Roasted foxnuts and millet blend for a crunchy, guilt-free snack full of minerals and light on calories.      |
| RagiSattva     | NJ Ragi Sattva (Nachani Ladoo)              | NJ\_RagiSattva.png     | Gluten-free and sugar-free Ragi ladoos that promote immunity, bone strength, and energy.                      |
| NutriBars      | NJ Signature Nutri Bars / Bites             | NJ\_NutriBars.png      | Dark chocolate-flavored bars packed with nutrients. Ideal for healthy snacking and sustained energy.          |
| OmegaCrunch    | Jewel’s Omega Crunch (Roasted Trail Mix)    | NJ\_OmegaCrunch.png    | A heart-healthy roasted trail mix, rich in omega-3 and clean plant-based ingredients.                         |
| GunPowder      | Jewel’s Gun Powder (Podi Masala)            | NJ\_GunPowder.png      | South Indian-style spice blend (podi) perfect as a dry chutney or seasoning, handcrafted in small batches.    |
| PeanutButter   | NJ Special 100% Peanut Butter               | NJ\_PeanutButter.png   | Pure, sugar-free peanut butter made with 100% peanuts. No additives, rich in protein and healthy fats.        |
| Hummus         | NJ Special Low Fat Hummus                   | NJ\_Hummus.png         | High-protein, fiber-rich hummus with no added oil. Smooth, savory, and gut-friendly.                          |
| GuacQuack      | Jewel’s Avo Guac Quack                      | NJ\_GuacQuack.png      | Creamy avocado dip made fresh. Best paired with crackers or used as a sandwich spread.                        |
| MaharajaCake   | Thandai Maharaja Cake                       | NJ\_MaharajaCake.png   | A celebratory cake infused with thandai spice blend, free from refined flour and sugars.                      |
| CambridgeCake  | Cambridge of Chocolate (Walnut Dark Cake)   | NJ\_CambridgeCake.png  | Luxurious dark chocolate cake with walnut crunch. Clean, eggless, preservative-free indulgence.               |
| KhajoorKhazana | Khajoor Ka Khazana (Stuffed Dates)          | NJ\_KhajoorKhazana.png | Decadent dates stuffed with clean ingredients. No sugar or additives, only nature’s goodness.                 |
| OxfordCake     | Oxford of Love (Strawberry Dark Cake)       | NJ\_OxfordCake.png     | Elegant strawberry and dark chocolate cake, made clean without any preservatives or artificial flavors.       |

> All product images should be placed in `src/assets/products/`

---

## 🎨 Brand Identity

### 🖊️ Color Palette

| Purpose                      | Color     | Description                                                                                      |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| **Primary Brand Color**      | `#93B559` | **Herbal Green** – From your logo; represents health, freshness, and nature.                     |
| **Deep Accent Color**        | `#6D8A3C` | **Earthy Olive** – Adds grounded richness for buttons and CTA hovers.                            |
| **Creamy Background**        | `#FAF9F6` | **Organic Off-White** – Soft and warm base for a clean layout.                                   |
| **Text Primary**             | `#2F2F2F` | **Natural Charcoal** – Deep, readable, warm black tone.                                          |
| **Subtext / Labels**         | `#6B6B6B` | **Muted Grey** – Gentle on the eyes, perfect for descriptions.                                   |
| **Highlight / CTA Accent**   | `#D1E8A7` | **Mint Pastel Green** – Friendly, happy color for callouts and discounts.                        |
| **Luxury Accent (optional)** | `#DCC99C` | **Golden Beige** – For a touch of elegance (used in ribbons, seals, gift-style packaging, etc.). |


### ✏️ Typography

* **Headings:** Playfair Display or similar serif
* **Body:** Inter or similar sans-serif

### 🔹 Tone & Language

* Warm, honest, transparent
* Educational yet approachable
* Focus on wellness and authenticity

---

## 📁 Folder Structure (Suggested)

```bash
/nutrijewel-website/
|
├── public/
│   └── index.html
|
├── src/
│   ├── assets/
│   │   └── products/
│   │       ├── NJ_Granola.png
│   │       ├── NJ_AmritBites.png
│   │       └── ...
│   ├── components/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── styles/
│   └── App.jsx
|
├── README.md
└── package.json
```

---

## 🔮 Development Suggestions

* Use component-driven development (React/Vue/Next)
* Import images dynamically based on standardized filenames
* Use a CMS or JSON file to maintain product catalog
* Integrate WhatsApp contact link with pre-filled inquiry message
* Responsive design and accessibility best practices

---

## 🚀 Future Enhancements

* Product detail pages with ingredients & benefits
* Blog/education section for nutrition tips and recipes
* Cart system if planning ecommerce
* Customer reviews integration
* SEO and Schema optimization

---

## 🤝 Collaboration

For inquiries or help:
**Email:** [hello@nutrijewel.com](mailto:hello@nutrijewel.com)
**Phone/WhatsApp:** +91 996-063-7656
**Founder:** Dt. Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist
**FSSAI:** 21524037004182

---

NutriJewel — Nourish with Intention. Snack with Joy.


| Product Name               | Weight        | Discounted Price | Original Price |
| -------------------------- | ------------- | ---------------- | -------------- |
| **NJ Amrit Bites**         | 1kg, 500g     | 1600, 800        | ₹1549          |
| **NJ Signature Granola**   | 250g, 500g    | ₹550, 999        | ₹699           |
| **NJ Granola Cookies**     | 5 big cookies | ₹499             | ₹649           |
| **NJ Special Bliss Bites** | 1kg, 500g     | 16oo, 800        | ₹1949          |
| **Foxnut & Millet Crunch** | 250g          | ₹299             | ₹749           |
| **NJ Ragi Sattva**         | 1kg, 500g     | ₹1599, 800       | ₹1949          |
| **NJ Nutri Bars / Bites**  | 250g          | 550              | ₹649           |
| **Jewel’s Omega Crunch**   | 250g          | ₹299             | ₹499           |
| **Jewel’s Gun Powder**     | 100g          | ₹99              | ₹449           |
| **100% Peanut Butter**     | 200g          | ₹249             | ₹449           |
| **Low Fat Hummus**         | 200g          | 249              | ₹149           |
| **Jewel’s Avo Guac Quack** | \~100g (est.) | ₹149             | ₹249           |
| **Thandai Maharaja Cake**  | 1kg           | ₹999             | ₹1349          |
| **Cambridge of Chocolate** | 1kg,750g,500g,| ₹1550,1150,850   | ₹1630          |
| **Khajoor Ka Khazana**     | 12 pieces     | ₹999             | ₹1400          |
| **Oxford of Love**         | 1kg           | ₹999             | ₹1349          |


NutriJewel: A Brand Story
Sparked by Passion & Purpose

As a child, my dreams always revolved around food. Whether it was owning a café, sharing recipes, conducting cooking workshops, or launching a healthy snacking brand, I knew my journey would be woven around the joy of cooking and feeding others. Food has always been my passion, my comfort, and my creative outlet.

But as I grew, I noticed a gap especially in India. The resources and ingredients I craved were rare, often inaccessible, or simply didn’t exist. Every trip to the market was a reminder: why shouldn’t healthy, delicious snacks be easy to find at home? This pain point became the seed for NJ.

Leaving a stable corporate job wasn’t easy. But the call to create something meaningful was louder. Before I took the leap, I dove deep into learning — studying the technicalities of food, nutrition, and product development, hence decided to pursue Masters in Nutritional Sciences & Dietetics. I wanted clarity and confidence, not just for myself but for everyone who would one day trust NJ.

NutriJewel was born in 2023, not just as a brand, but as a promise — to make healthy snacking accessible, exciting, and truly Indian. Every product is a reflection of my journey: the challenges, the learning, and the unwavering hope that food can bring people together and make lives better.

Today, NJ stands for more than just snacks. It’s about bringing joy back to eating, making health a habit, and proving that passion, when combined with purpose, can nourish a nation. If you’ve ever struggled to find the right snack, or felt let down by what’s available, know that NutriJewel was created for you — by someone who’s been there, too.

Join us on this journey. Let’s make healthy snacking a celebration, every single day.

— Dt. Ruchika Bachwani
MSc. Nutritional Sciences & Dietetics