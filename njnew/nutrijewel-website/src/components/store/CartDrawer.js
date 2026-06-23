import React, { useEffect } from 'react';
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useStore } from '../../store/StoreContext';
import './store.css';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

export default function CartDrawer() {
  const {
    cart, cartOpen, closeCart, setQty, removeFromCart,
    subtotal, cartCount, checkoutWhatsApp,
  } = useStore();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!cartOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [cartOpen, closeCart]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="nj-drawer-backdrop"
          onClick={closeCart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.aside
            className="nj-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="nj-drawer-head">
              <h3 className="nj-drawer-title">
                <ShoppingCart size={18} /> Your Cart{cartCount > 0 ? ` (${cartCount})` : ''}
              </h3>
              <button className="nj-drawer-close" onClick={closeCart} aria-label="Close cart">
                <X size={20} />
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="nj-drawer-empty">
                <span className="nj-empty-icon"><ShoppingCart size={34} /></span>
                <p className="nj-empty-title">Your cart is empty</p>
                <p className="nj-empty-sub">Add something delicious to get started.</p>
                <button className="nj-ghost-btn" onClick={closeCart}>Browse products</button>
              </div>
            ) : (
              <>
                <div className="nj-drawer-list">
                  <AnimatePresence initial={false}>
                  {cart.map((line, i) => (
                    <motion.div className="nj-cart-line" key={line.key} layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                      exit={{ opacity: 0, x: 60, transition: { duration: 0.22 } }}
                    >
                      <img className="nj-cart-thumb" src={img(line.image)} alt={line.name} loading="lazy" />
                      <div className="nj-cart-mid">
                        <p className="nj-cart-name">{line.name}</p>
                        <p className="nj-cart-weight">{line.weight}</p>
                        <div className="nj-qty">
                          <button onClick={() => setQty(line.key, line.qty - 1)} aria-label="Decrease quantity">
                            <Minus size={14} />
                          </button>
                          <span>{line.qty}</span>
                          <button onClick={() => setQty(line.key, line.qty + 1)} aria-label="Increase quantity">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="nj-cart-end">
                        <button className="nj-cart-remove" onClick={() => removeFromCart(line.key)} aria-label={`Remove ${line.name}`}>
                          <Trash2 size={15} />
                        </button>
                        <span className="nj-cart-price">₹{line.unitPrice * line.qty}</span>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>

                <footer className="nj-drawer-foot">
                  <div className="nj-subtotal">
                    <span>Subtotal</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  <button className="nj-checkout-btn" onClick={checkoutWhatsApp}>
                    <span>Order on WhatsApp</span>
                    <span className="nj-checkout-meta">{cartCount} item{cartCount !== 1 ? 's' : ''} · ₹{subtotal}</span>
                  </button>
                  <p className="nj-drawer-note">No payment now — we'll confirm your order &amp; delivery on WhatsApp.</p>
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
