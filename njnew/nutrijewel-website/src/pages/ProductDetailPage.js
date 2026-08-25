import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Star, ShieldCheck, Leaf, MapPin,
  ChevronRight, ChevronLeft, ChevronDown, X, ZoomIn, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from '../data/products';
import WeightSelector from '../components/WeightSelector';
import AddToCartButton from '../components/store/AddToCartButton';
import WishlistHeart from '../components/store/WishlistHeart';
import './ProductDetailPage.css';

const WHATSAPP = '919960637656';
const SITE = 'https://nutrijewel.com';
const DIET_KEYWORDS = /free|preservative|eggless|vegan|no added|additive|low fat|gluten/i;

const lowestVariant = (p) =>
  p && p.variants && p.variants.length
    ? p.variants.reduce((lo, v) => (v.price < lo.price ? v : lo), p.variants[0])
    : null;

function buildFaqs(product) {
  const name = product.displayName || product.name;
  return [
    ...(product.faqs || []),
    {
      q: `How should I store ${name}?`,
      a: 'Keep it in an airtight container in a cool, dry place. Anything cream-based or perishable should be refrigerated and enjoyed within a few days. Exact storage guidance is printed on every pack.',
    },
    {
      q: 'How fresh is it, and what about shelf life?',
      a: "Everything is handcrafted in small batches and preservative-free, so we make it as fresh as possible. The best-before date is on every pack — we're happy to confirm it on WhatsApp before you order.",
    },
    {
      q: 'How do I order and pay?',
      a: 'Add to cart and check out on WhatsApp, or tap “Buy on WhatsApp”. We confirm availability, delivery and payment with you directly — no payment is taken on the website.',
    },
    {
      q: 'Do you deliver to my city?',
      a: "We ship across India through trusted courier partners, and deliver fresh items locally around Pune. Share your pincode on WhatsApp and we'll confirm options and timing.",
    },
    {
      q: 'Can I customise, gift or order in bulk?',
      a: 'Yes! Message us on WhatsApp for custom sizes, gift packaging, festive hampers, or bulk and corporate orders.',
    },
  ];
}

/* ── Full-screen image lightbox ── */
function Lightbox({ images, index, setIndex, onClose, alt }) {
  const startX = useRef(0);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length, setIndex]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length, setIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose]);

  const multi = images.length > 1;
  return (
    <motion.div
      className="pdp-lightbox"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button className="pdp-lb-close" onClick={onClose} aria-label="Close image viewer">
        <X size={22} />
      </button>
      {multi && <span className="pdp-lb-counter">{index + 1} / {images.length}</span>}

      <div
        className="pdp-lb-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = startX.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 45) (dx > 0 ? next() : prev());
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={images[index]}
            src={images[index]}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        {multi && (
          <>
            <button className="pdp-lb-arrow left" onClick={prev} aria-label="Previous image">
              <ChevronLeft size={26} />
            </button>
            <button className="pdp-lb-arrow right" onClick={next} aria-label="Next image">
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      {multi && (
        <div className="pdp-lb-thumbs" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={img}
              className={`pdp-lb-thumb${i === index ? ' active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => products.find((p) => p.id === slug), [slug]);

  const [selectedVariant, setSelectedVariant] = useState(() => lowestVariant(product));
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const actionsRef = useRef(null);
  const swipeStartX = useRef(0);
  const didSwipe = useRef(false);

  useEffect(() => {
    setSelectedVariant(lowestVariant(product));
    setActiveImage(0);
    setLightboxOpen(false);
    setOpenFaq(0);
  }, [slug, product]);

  const images = useMemo(() => {
    if (!product) return [];
    const list = product.images && product.images.length ? product.images : [product.image];
    return [...new Set(list.filter(Boolean))];
  }, [product]);

  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  useEffect(() => {
    if (!product) return undefined;
    const url = `${SITE}/products/${product.id}`;
    const title = `${product.displayName || product.name} | NutriJewel`;
    const desc = product.description || '';
    const image = product.image ? `${SITE}${encodeURI(product.image)}` : `${SITE}/preview.jpg`;

    const oldTitle = document.title;
    document.title = title;

    const ops = [];
    const apply = (selector, attr, val) => {
      const node = document.head.querySelector(selector);
      if (!node) return;
      const old = node.getAttribute(attr);
      node.setAttribute(attr, val);
      ops.push(() => (old === null ? node.removeAttribute(attr) : node.setAttribute(attr, old)));
    };

    apply('meta[name="description"]', 'content', desc);
    apply('meta[name="title"]', 'content', title);
    apply('link[rel="canonical"]', 'href', url);
    apply('meta[property="og:title"]', 'content', title);
    apply('meta[property="og:description"]', 'content', desc);
    apply('meta[property="og:url"]', 'content', url);
    apply('meta[property="og:image"]', 'content', image);
    apply('meta[property="twitter:title"]', 'content', title);
    apply('meta[property="twitter:description"]', 'content', desc);
    apply('meta[property="twitter:url"]', 'content', url);
    apply('meta[property="twitter:image"]', 'content', image);

    const price = lowestVariant(product)?.price ?? product.price;
    const productLd = document.createElement('script');
    productLd.type = 'application/ld+json';
    productLd.id = 'pdp-jsonld';
    productLd.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image,
      description: desc,
      brand: { '@type': 'Brand', name: 'NutriJewel' },
      category: product.category,
      ...(product.comingSoon
        ? {}
        : {
            offers: {
              '@type': 'Offer',
              url,
              priceCurrency: 'INR',
              price: String(price),
              availability: 'https://schema.org/InStock',
            },
          }),
    });
    document.head.appendChild(productLd);

    const faqLd = document.createElement('script');
    faqLd.type = 'application/ld+json';
    faqLd.id = 'pdp-faq-jsonld';
    faqLd.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: buildFaqs(product).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
    document.head.appendChild(faqLd);

    return () => {
      document.title = oldTitle;
      ops.forEach((fn) => fn());
      ['pdp-jsonld', 'pdp-faq-jsonld'].forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.remove();
      });
    };
  }, [product]);

  if (!product) {
    return (
      <div className="pdp-notfound">
        <h1>Product not found</h1>
        <p>The product you're looking for doesn't exist or may have moved.</p>
        <Link to="/products" className="pdp-notfound-btn">Browse all products</Link>
      </div>
    );
  }

  const price = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const weight = selectedVariant?.weight ?? product.weight;
  const discount =
    originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const comingSoon = !!product.comingSoon;
  const displayTitle = product.displayName || product.name;
  const multiImage = images.length > 1;

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const dietaryTags = (product.features || []).filter((f) => DIET_KEYWORDS.test(f));
  const faqs = buildFaqs(product);

  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);

  const onMainTouchStart = (e) => { swipeStartX.current = e.touches[0].clientX; didSwipe.current = false; };
  const onMainTouchEnd = (e) => {
    const dx = swipeStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 45) { didSwipe.current = true; (dx > 0 ? nextImage() : prevImage()); }
  };
  const onMainClick = () => { if (!didSwipe.current) setLightboxOpen(true); };

  const buyOnWhatsApp = () => {
    const msg = `Hi! I'm interested in purchasing ${product.name} (${weight}) - ₹${price}. Can you please share availability and delivery details?`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="pdp">
      <div className="pdp-container">
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <Link to="/products">Products</Link>
          <ChevronRight size={13} />
          <span className="pdp-breadcrumb-current">{displayTitle}</span>
        </nav>

        <button className="pdp-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={17} /> Back
        </button>

        <div className="pdp-main">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div
              className={`pdp-gallery-main${comingSoon ? ' is-coming-soon' : ''}`}
              onClick={onMainClick}
              onTouchStart={onMainTouchStart}
              onTouchEnd={onMainTouchEnd}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setLightboxOpen(true); }}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={images[activeImage]}
                  src={images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {!comingSoon && (
                <span className="pdp-zoom-hint"><ZoomIn size={14} /> Tap to zoom</span>
              )}
              <div className="pdp-flags">
                {product.isBestSeller && <span className="pdp-flag best">★ Best Seller</span>}
                {product.isChefsSpecial && <span className="pdp-flag chef">Chef's Special</span>}
              </div>
              {comingSoon && (
                <div className="pdp-coming-soon"><span>Coming Soon</span></div>
              )}
              <WishlistHeart productId={product.id} className="on-image" />

              {multiImage && (
                <>
                  <button className="pdp-gallery-arrow left" aria-label="Previous image"
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className="pdp-gallery-arrow right" aria-label="Next image"
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                    <ChevronRight size={20} />
                  </button>
                  <div className="pdp-gallery-dots">
                    {images.map((img, i) => (
                      <span key={img} className={`pdp-gd-dot${i === activeImage ? ' active' : ''}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {multiImage && (
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button
                    key={img}
                    className={`pdp-thumb${i === activeImage ? ' active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pdp-info">
            <span className="pdp-category">{product.category}</span>
            <h1 className="pdp-title">{displayTitle}</h1>
            {product.name !== displayTitle && <p className="pdp-fullname">{product.name}</p>}

            {!comingSoon && (
              <div className="pdp-rating">
                <span className="pdp-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
                </span>
                <span className="pdp-rating-num">5.0</span>
                <span className="pdp-rating-count">· 150+ happy customers</span>
              </div>
            )}

            {!comingSoon ? (
              <div className="pdp-price-row">
                <span className="pdp-price">₹{price}</span>
                {discount > 0 && <span className="pdp-original">₹{originalPrice}</span>}
                {discount > 0 && <span className="pdp-discount">{discount}% OFF</span>}
                <span className="pdp-weight">/ {weight}</span>
              </div>
            ) : (
              <div className="pdp-price-row"><span className="pdp-comingsoon-label">Coming Soon</span></div>
            )}

            {!comingSoon && (
              <WeightSelector product={product} onVariantChange={setSelectedVariant} variant="default" />
            )}

            <div className="pdp-actions" ref={actionsRef}>
              {comingSoon ? (
                <div className="pdp-soon-row">
                  <WishlistHeart productId={product.id} className="pdp-wish-inline" />
                  <span className="pdp-soon-note">
                    Save it to your wishlist — we'll let you know the moment it launches.
                  </span>
                </div>
              ) : (
                <>
                  <AddToCartButton product={product} variant={selectedVariant} className="full pdp-add" />
                  <button className="pdp-buy" onClick={buyOnWhatsApp}>
                    <ShoppingBag size={18} /> Buy on WhatsApp
                  </button>
                </>
              )}
            </div>

            <ul className="pdp-trust">
              <li><Leaf size={15} /> Clean &amp; handcrafted</li>
              <li><ShieldCheck size={15} /> FSSAI 21524037004182</li>
              <li><MapPin size={15} /> Made fresh in Pune</li>
            </ul>

            <p className="pdp-desc">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="pdp-benefits-block">
                <h2 className="pdp-section-label">What makes it special</h2>
                <div className="pdp-benefits">
                  {product.features.map((f, i) => <span key={i} className="pdp-benefit">{f}</span>)}
                </div>
              </div>
            )}

            {/* Allergens & dietary info */}
            <div className="pdp-allergens">
              <h2 className="pdp-section-label">Allergen &amp; dietary info</h2>
              {dietaryTags.length > 0 && (
                <div className="pdp-diet-row">
                  {dietaryTags.map((t, i) => <span key={i} className="pdp-diet-tag">{t}</span>)}
                </div>
              )}
              {product.allergens && product.allergens.length > 0 && (
                <p className="pdp-contains"><strong>Contains:</strong> {product.allergens.join(', ')}.</p>
              )}
              <p className="pdp-allergen-advisory">
                <AlertTriangle size={15} />
                <span>
                  Handcrafted in small batches in a shared kitchen that also handles nuts, dairy, gluten,
                  sesame &amp; soy — traces may be present. If you have a specific allergy, please confirm
                  with us on WhatsApp before ordering.
                </span>
              </p>
            </div>

            {/* Nutrition facts */}
            {!comingSoon && (
              <div className="pdp-nutrition">
                <h2 className="pdp-section-label">Nutrition facts</h2>
                {product.nutrition ? (
                  <div className="pdp-nutri-card">
                    {product.nutrition.serving && (
                      <div className="pdp-nutri-serving">{product.nutrition.serving}</div>
                    )}
                    <table className="pdp-nutri-table">
                      <tbody>
                        {product.nutrition.items.map((row, i) => (
                          <tr key={i}>
                            <th scope="row">{row.label}</th>
                            <td>{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="pdp-nutri-pending">
                    Detailed nutrition facts for this product are on their way. In the meantime, message us
                    on WhatsApp and we'll share the specifics.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FAQs */}
        <section className="pdp-faqs">
          <h2 className="pdp-related-title pdp-faq-title">Frequently asked questions</h2>
          <div className="pdp-faq-list">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div className={`pdp-faq${open ? ' open' : ''}`} key={i}>
                  <button
                    className="pdp-faq-q"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                  >
                    <span>{f.q}</span>
                    <ChevronDown size={18} className="pdp-faq-chevron" />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        className="pdp-faq-a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <p>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {related.length > 0 && (
          <section className="pdp-related">
            <h2 className="pdp-related-title">You may also like</h2>
            <div className="pdp-related-grid">
              {related.map((rel) => {
                const rp = lowestVariant(rel)?.price ?? rel.price;
                return (
                  <Link key={rel.id} to={`/products/${rel.id}`} className="pdp-rel-card">
                    <div className="pdp-rel-img">
                      <img src={rel.image} alt={rel.name} loading="lazy" />
                    </div>
                    <div className="pdp-rel-body">
                      <span className="pdp-rel-cat">{rel.category}</span>
                      <h3 className="pdp-rel-name">{rel.displayName || rel.name}</h3>
                      <span className="pdp-rel-price">{rel.comingSoon ? 'Coming soon' : `₹${rp}`}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky add-to-cart bar */}
      {!comingSoon && (
        <div className={`pdp-sticky${showSticky ? ' show' : ''}`}>
          <div className="pdp-sticky-price">
            <span className="pdp-sticky-amount">₹{price}</span>
            <span className="pdp-sticky-weight">{weight}</span>
          </div>
          <AddToCartButton product={product} variant={selectedVariant} className="full pdp-sticky-add" />
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            index={activeImage}
            setIndex={setActiveImage}
            onClose={() => setLightboxOpen(false)}
            alt={product.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
