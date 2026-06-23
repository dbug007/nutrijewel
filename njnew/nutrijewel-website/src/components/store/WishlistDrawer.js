import React, { useEffect } from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useStore } from '../../store/StoreContext';
import { products } from '../../data/products';
import './store.css';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

const lowestVariant = (p) =>
  p.variants && p.variants.length
    ? p.variants.reduce((lo, v) => (v.price < lo.price ? v : lo), p.variants[0])
    : null;

const priceOf = (p) => {
  const v = lowestVariant(p);
  return v ? v.price : p.price;
};

export default function WishlistDrawer() {
  const {
    wishlist, wishlistOpen, closeWishlist, toggleWishlist, addToCart, openCart,
  } = useStore();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!wishlistOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeWishlist(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [wishlistOpen, closeWishlist]);

  // resolve ids -> live products (drop any that no longer exist)
  const items = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  const handleAdd = (product) => {
    addToCart(product, lowestVariant(product));
    closeWishlist();
    openCart();
  };

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <motion.div
          className="nj-drawer-backdrop"
          onClick={closeWishlist}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.aside
            className="nj-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="nj-drawer-head">
              <h3 className="nj-drawer-title">
                <Heart size={18} /> Wishlist{items.length > 0 ? ` (${items.length})` : ''}
              </h3>
              <button className="nj-drawer-close" onClick={closeWishlist} aria-label="Close wishlist">
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="nj-drawer-empty">
                <span className="nj-empty-icon"><Heart size={34} /></span>
                <p className="nj-empty-title">Your wishlist is empty</p>
                <p className="nj-empty-sub">Tap the heart on anything you love to save it here.</p>
                <button className="nj-ghost-btn" onClick={closeWishlist}>Browse products</button>
              </div>
            ) : (
              <div className="nj-drawer-list">
                <AnimatePresence initial={false}>
                {items.map((product, i) => (
                  <motion.div className="nj-cart-line" key={product.id} layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ opacity: 0, x: 60, transition: { duration: 0.22 } }}
                  >
                    <img className="nj-cart-thumb" src={img((product.images && product.images[0]) || product.image)} alt={product.displayName || product.name} loading="lazy" />
                    <div className="nj-cart-mid">
                      <p className="nj-cart-name">{product.displayName || product.name}</p>
                      <p className="nj-cart-weight">
                        {product.comingSoon ? 'Coming soon' : `from ₹${priceOf(product)}`}
                      </p>
                      {!product.comingSoon && (
                        <button className="nj-wish-add" onClick={() => handleAdd(product)}>
                          <ShoppingCart size={14} /> Add to cart
                        </button>
                      )}
                    </div>
                    <div className="nj-cart-end">
                      <button className="nj-cart-remove" onClick={() => toggleWishlist(product.id)} aria-label={`Remove ${product.displayName || product.name} from wishlist`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
