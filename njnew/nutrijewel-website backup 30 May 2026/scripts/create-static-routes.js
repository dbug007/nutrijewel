const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const sourceIndex = path.join(buildDir, 'index.html');
const siteUrl = 'https://nutrijewel.com';

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
  const routeHtml = applySeoToHtml(sourceHtml, seo);
  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
}

function main() {
  ensureBuiltIndexExists();
  const sourceHtml = fs.readFileSync(sourceIndex, 'utf8');
  const routes = Object.keys(routeSeo);

  routes.forEach((route) => {
    writeIndexForRoute(route, routeSeo[route], sourceHtml);
  });

  console.log(`Created static route index files with SEO metadata for: ${routes.join(', ')}`);
}

main();
