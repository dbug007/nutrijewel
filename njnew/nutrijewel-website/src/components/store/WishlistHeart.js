import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../store/StoreContext';

/* Heart toggle for a product. Works for any product (incl. Coming Soon). */
export default function WishlistHeart({ productId, className = '' }) {
  const { isInWishlist, toggleWishlist } = useStore();
  const active = isInWishlist(productId);
  return (
    <motion.button
      type="button"
      className={`nj-heart${active ? ' is-active' : ''}${className ? ` ${className}` : ''}`}
      aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={active}
      title={active ? 'Remove from wishlist' : 'Save to wishlist'}
      onClick={(e) => { e.stopPropagation(); toggleWishlist(productId); }}
      whileTap={{ scale: 0.82 }}
    >
      <Heart size={17} fill={active ? 'currentColor' : 'none'} />
    </motion.button>
  );
}
