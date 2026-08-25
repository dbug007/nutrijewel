import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Plus, GripVertical, Package } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { resolveVariant, formatINR } from '../../utils/hamperPricing';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

/*
 * One product in the builder's picker.
 *
 * Tapping "Add" is the primary way in on every viewport, dragging is an
 * enhancement layered on top, never a requirement. The drag listeners use a
 * distance activation constraint (see HamperBuilder) so a tap still reads as a click.
 */

export default function HamperProductCard({ product, selectedWeight, onWeightChange, onAdd, inBoxQty, disabled }) {
  const reduceMotion = useReducedMotion();
  const mediaRef = useRef(null);
  const variant = resolveVariant(product, selectedWeight);
  const variants = Array.isArray(product.variants) ? product.variants : [];

  // The product image is where the fly-to-basket animation takes off from.
  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product, variant?.weight, mediaRef.current?.getBoundingClientRect());
  };

  // `attributes` is deliberately not spread onto the card: it applies role="button"
  // and tabIndex, which would nest the real Add/weight buttons inside an announced
  // button. Keyboard users add via the Add button, which is the better path anyway.
  const { listeners, setNodeRef, isDragging } = useDraggable({
    id: `pick-${product.id}`,
    data: { product, weight: variant?.weight },
    disabled,
  });

  const discount = variant?.originalPrice > variant?.price
    ? Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      ref={setNodeRef}
      className={`nj-pick-card${isDragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}${inBoxQty > 0 ? ' is-in-box' : ''}`}
      layout={!reduceMotion}
      whileHover={reduceMotion || disabled ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      {...listeners}
    >
      {inBoxQty > 0 && (
        <motion.span
          className="nj-pick-count"
          key={inBoxQty}
          initial={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
          animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 18 }}
          aria-label={`${inBoxQty} in your hamper`}
        >
          {inBoxQty}
        </motion.span>
      )}

      <span className="nj-pick-grip" aria-hidden="true"><GripVertical size={13} /></span>

      <div className="nj-pick-media" ref={mediaRef}>
        {product.image ? (
          <img src={img(product.image)} alt={product.displayName || product.name} loading="lazy" />
        ) : (
          <span className="nj-pick-media-fallback">
            <span className="nj-pick-flag">{product.flag || <Package size={22} />}</span>
          </span>
        )}
        {product.isImported && (
          <span className="nj-pick-imported">{product.flag} {product.origin}</span>
        )}
        {discount > 0 && <span className="nj-pick-off">{discount}% off</span>}
      </div>

      <div className="nj-pick-body">
        <p className="nj-pick-name">{product.displayName || product.name}</p>

        {variants.length > 1 ? (
          <div className="nj-pick-weights" role="group" aria-label={`Weight for ${product.displayName || product.name}`}>
            {variants.map((v) => (
              <button
                key={v.weight}
                type="button"
                className={`nj-pick-weight${v.weight === variant?.weight ? ' is-active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onWeightChange(product.id, v.weight); }}
                aria-pressed={v.weight === variant?.weight}
              >
                {v.weight}
              </button>
            ))}
          </div>
        ) : (
          <p className="nj-pick-single-weight">{variant?.weight}</p>
        )}

        <div className="nj-pick-foot">
          <span className="nj-pick-price">
            {formatINR(variant?.price)}
            {discount > 0 && <s>{formatINR(variant.originalPrice)}</s>}
          </span>
          <button
            type="button"
            className="nj-pick-add"
            onClick={handleAdd}
            disabled={disabled}
            aria-label={`Add ${product.displayName || product.name} ${variant?.weight} to your hamper`}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
