import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { OFFER_TIERS } from '../../data/hampers';
import { formatINR } from '../../utils/hamperPricing';
import { listItemVariants, staggerVariants, getRevealProps } from '../motionPresets';

/* Plain-language explainer for the tier discounts, so the progress bar in the
   basket doesn't have to carry the whole explanation. */

export default function HamperOffersStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="nj-offers nj-pat nj-pat--plaid nj-pat--red nj-pat--bold nj-pat--fade-t"
      aria-labelledby="nj-offers-title"
    >
      <div className="container">
        <div className="nj-section-head">
          <h2 className="nj-section-title" id="nj-offers-title">
            <TrendingUp size={20} /> The bigger the box, the bigger the saving
          </h2>
          <p className="nj-section-sub">
            Discounts apply automatically as you build. No codes to remember.
          </p>
        </div>

        <motion.div
          className="nj-offers-row"
          variants={reduceMotion ? undefined : staggerVariants}
          {...getRevealProps(reduceMotion)}
        >
          {OFFER_TIERS.map((tier, i) => (
            <motion.div
              className="nj-offer-card"
              key={tier.id}
              variants={reduceMotion ? undefined : listItemVariants}
              style={{ '--offer-step': i }}
            >
              <span className="nj-offer-percent">{tier.percent}%</span>
              <span className="nj-offer-label">off your items</span>
              <span className="nj-offer-threshold">
                when your products cross {formatINR(tier.minItemsTotal)}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <p className="nj-offers-note">
          Discounts are calculated on the products in your hamper. The gift box, wrap and
          hand-written card are charged separately, and never discounted.
        </p>
      </div>
    </section>
  );
}
