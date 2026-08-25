import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { OCCASIONS } from '../../data/hampers';
import Shelf from '../Shelf';

/* Occasion picker. Selecting one themes the page accent, filters the ready-made
   hampers below, and names the hamper when it reaches the cart. */

export default function OccasionRail({ occasionId, onSelect }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="nj-occasions" aria-labelledby="nj-occasions-title">
      <div className="container">
        <div className="nj-section-head">
          <h2 className="nj-section-title" id="nj-occasions-title">What's the occasion?</h2>
          <p className="nj-section-sub">
            Pick one and we'll suggest hampers built for it, or skip straight to building your own.
          </p>
        </div>

        <Shelf label="Occasions" arrows>
          {OCCASIONS.map((occasion) => {
            const isActive = occasion.id === occasionId;
            return (
              <motion.button
                key={occasion.id}
                type="button"
                className={`nj-occasion-card${isActive ? ' is-active' : ''}`}
                style={{ '--occasion-accent': occasion.accent }}
                onClick={() => onSelect(isActive ? null : occasion.id)}
                aria-pressed={isActive}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="nj-occasion-emoji" aria-hidden="true">{occasion.emoji}</span>
                <span className="nj-occasion-name">{occasion.name}</span>
                <span className="nj-occasion-blurb">{occasion.blurb}</span>
                {isActive && (
                  <span className="nj-occasion-check" aria-hidden="true"><Check size={12} /></span>
                )}
              </motion.button>
            );
          })}
        </Shelf>
      </div>
    </section>
  );
}
