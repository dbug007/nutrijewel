import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../store/StoreContext';

/* Adds a product (with an optional selected variant) to the cart.
   Renders nothing for Coming Soon products. */
export default function AddToCartButton({ product, variant, label = 'Add to Cart', className = '' }) {
  const { addToCart } = useStore();
  if (!product || product.comingSoon) return null;
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
