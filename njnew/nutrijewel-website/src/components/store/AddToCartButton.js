import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../store/StoreContext';
import { isBuyable } from '../../utils/productAvailability';

/* Adds a product (with an optional selected variant) to the cart.
   Renders nothing for anything not currently on sale: coming soon, out of
   season, or priced on request. */
export default function AddToCartButton({ product, variant, label = 'Add to Cart', className = '' }) {
  const { addToCart } = useStore();
  /* Guarded here rather than at each call site, so a new page cannot
     reintroduce a buy button for something that is not on sale. */
  if (!isBuyable(product)) return null;
  return (
    <motion.button
      type="button"
      className={`nj-add-cart-btn${className ? ` ${className}` : ''}`}
      onClick={(e) => { e.stopPropagation(); addToCart(product, variant); }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Add ${product.displayName || product.name} to cart`}
    >
      <ShoppingCart size={17} />
      <span>{label}</span>
    </motion.button>
  );
}
