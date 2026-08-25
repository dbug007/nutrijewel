import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { BOX_TIERS } from '../../data/hampers';
import { formatINR } from '../../utils/hamperPricing';

/* Step 1 of the builder: choose how big the gift box is.
   Slot capacity is shown as dots so "size" is legible at a glance without
   having to read a number. */

export default function BoxTierPicker({ boxTierId, slotsUsed = 0, onSelect }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="nj-box-tiers" role="radiogroup" aria-label="Hamper box size">
        {BOX_TIERS.map((tier) => {
          const isSelected = tier.id === boxTierId;
          const willTrim = slotsUsed > tier.slots;

          return (
            <motion.button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`nj-box-tier${isSelected ? ' is-selected' : ''}`}
              style={{ '--tier-accent': tier.accent }}
              onClick={() => onSelect(tier.id)}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSelected && !reduceMotion && (
                <motion.span
                  className="nj-box-tier-ring"
                  layoutId="nj-box-tier-ring"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              {isSelected && reduceMotion && <span className="nj-box-tier-ring" />}

              {tier.isPopular && (
                <span className="nj-box-tier-flag"><Star size={10} /> Most gifted</span>
              )}

              <span className="nj-box-tier-name">{tier.name}</span>

              <span className="nj-box-tier-slots" aria-hidden="true">
                {Array.from({ length: tier.slots }).map((_, i) => (
                  <span key={i} className="nj-box-tier-dot" />
                ))}
              </span>

              <span className="nj-box-tier-count">{tier.slots} items</span>
              <span className="nj-box-tier-price">+ {formatINR(tier.boxPrice)} box</span>
              <span className="nj-box-tier-blurb">{tier.blurb}</span>

              {willTrim && !isSelected && (
                <span className="nj-box-tier-warn">Too small for your {slotsUsed} items</span>
              )}

              {isSelected && (
                <span className="nj-box-tier-check" aria-hidden="true"><Check size={13} /></span>
              )}
            </motion.button>
          );
      })}
    </div>
  );
}
