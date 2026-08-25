const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const sourceIndex = path.join(buildDir, 'index.html');
const siteUrl = 'https://nutrijewel.com';
const productCatalog = require(path.join(__dirname, '..', 'src', 'data', 'products.data.js'));
const hamperData = require(path.join(__dirname, '..', 'src', 'data', 'hampers.data.js'));

// FAQ structured data for /hampers, built from the same array the page renders,
// so the visible copy and the structured data can never drift apart.
const hamperFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: hamperData.HAMPER_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

// Keep this map aligned with React Router public routes.
const routeSeo = {
  about: {
    title: 'About NutriJewel | Dt. Ruchika Bachwani',
    description:
      'Learn about NutriJewel and founder Dt. Ruchika Bachwani. Discover our story, clean-ingredient philosophy, and handcrafted nutrition-first products.',
    canonical: `${siteUrl}/about/`
  },
  products: {
    title: 'NutriJewel Products | Healthy Cakes, Granola, Ladoos & Bars',
    description:
      'Explore NutriJewel top sellers including clean cakes, granola, ladoos, and energy bites crafted with premium ingredients and no artificial preservatives.',
    canonical: `${siteUrl}/products/`
  },
  hampers: {
    title: 'Gift Hampers | Build Your Own Healthy Hamper | NutriJewel',
    description:
      'Build your own NutriJewel gift hamper for Diwali, weddings, corporate gifting and more. Pick a box, add ladoos, granola, cakes and imported treats, and save up to 15%.',
    canonical: `${siteUrl}/hampers/`,
    jsonLd: hamperFaqJsonLd
  },
  services: {
    title: 'NutriJewel Services | Workshops, Nutrition & Healthy Baking',
    description:
      'Discover NutriJewel services including healthy baking workshops, wellness sessions, and guided nutrition experiences for mindful eating.',
    canonical: `${siteUrl}/services/`
  },
  'recipes-blog': {
    title: 'Recipes & Blog | NutriJewel Healthy Living Journal',
    description:
      'Read NutriJewel recipes, clean eating ideas, and practical nutrition tips for joyful, healthy snacking and balanced lifestyle choices.',
    canonical: `${siteUrl}/recipes-blog/`
  },
  contact: {
    title: 'Contact NutriJewel | Order Healthy Snacks on WhatsApp',
    description:
      'Contact NutriJewel for product inquiries, custom orders, and workshop details. Connect on WhatsApp or email for quick support.',
    canonical: `${siteUrl}/contact/`
  }
  // Birthday "Spin & Win" campaign disabled, /spin & /birthday static pages intentionally not generated.
};

function ensureBuiltIndexExists() {
  if (!fs.existsSync(sourceIndex)) {
    throw new Error('build/index.html not found. Run npm run build first.');
  }
}

function replaceMetaByAttribute(html, attribute, value, content) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagRegex = new RegExp(`<meta\\s+[^>]*${escapedAttribute}="${escapedValue}"[^>]*>`, 'i');

  return html.replace(tagRegex, (tag) => tag.replace(/content="[^"]*"/i, `content="${content}"`));
}

function applySeoToHtml(html, seo) {
  let updated = html;

  updated = updated.replace(/<title>[^<]*<\/title>/i, `<title>${seo.title}</title>`);
  updated = updated.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i,
    `<link rel="canonical" href="${seo.canonical}">`
  );

  updated = replaceMetaByAttribute(updated, 'name', 'title', seo.title);
  updated = replaceMetaByAttribute(updated, 'name', 'description', seo.description);
  updated = replaceMetaByAttribute(updated, 'property', 'og:title', seo.title);
  updated = replaceMetaByAttribute(updated, 'property', 'og:description', seo.description);
  updated = replaceMetaByAttribute(updated, 'property', 'og:url', seo.canonical);
  updated = replaceMetaByAttribute(updated, 'property', 'twitter:title', seo.title);
  updated = replaceMetaByAttribute(updated, 'property', 'twitter:description', seo.description);
  updated = replaceMetaByAttribute(updated, 'property', 'twitter:url', seo.canonical);

  return updated;
}

function writeIndexForRoute(route, seo, sourceHtml) {
  const routeDir = path.join(buildDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  let routeHtml = applySeoToHtml(sourceHtml, seo);

  if (seo.jsonLd) {
    const ldScript = `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`;
    routeHtml = routeHtml.replace('</head>', `${ldScript}</head>`);
  }

  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const lowestPrice = (product) => {
  if (product.variants && product.variants.length) {
    return product.variants.reduce((lo, v) => (v.price < lo.price ? v : lo), product.variants[0]).price;
  }
  return product.price;
};

function buildProductHtml(sourceHtml, product) {
  const url = `${siteUrl}/products/${product.id}/`;
  const title = `${product.displayName || product.name} | NutriJewel`;
  const description = product.description || '';
  const image = `${siteUrl}${encodeURI(product.image || '/preview.jpg')}`;

  let html = applySeoToHtml(sourceHtml, {
    title: escapeHtml(title),
    description: escapeHtml(description),
    canonical: url,
  });
  html = replaceMetaByAttribute(html, 'property', 'og:image', image);
  html = replaceMetaByAttribute(html, 'property', 'twitter:image', image);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image,
    description,
    brand: { '@type': 'Brand', name: 'NutriJewel' },
    category: product.category,
    ...(product.comingSoon
      ? {}
      : {
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'INR',
            price: String(lowestPrice(product)),
            availability: 'https://schema.org/InStock',
          },
        }),
  };
  const ldScript = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  return html.replace('</head>', `${ldScript}</head>`);
}

function writeProductPage(product, sourceHtml) {
  const dir = path.join(buildDir, 'products', product.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildProductHtml(sourceHtml, product), 'utf8');
}

function main() {
  ensureBuiltIndexExists();
  const sourceHtml = fs.readFileSync(sourceIndex, 'utf8');
  const routes = Object.keys(routeSeo);

  routes.forEach((route) => {
    writeIndexForRoute(route, routeSeo[route], sourceHtml);
  });

  productCatalog.forEach((product) => writeProductPage(product, sourceHtml));

  console.log(`Created static route index files with SEO metadata for: ${routes.join(', ')}`);
  console.log(`Created ${productCatalog.length} product detail pages with SEO + Product JSON-LD.`);
}

main();
