import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Gift, ArrowRight } from 'lucide-react';
import BakeryStamp from './BakeryStamp';
import { OCCASIONS, OFFER_TIERS, PRESET_HAMPERS, getBoxTier, getDefaultPacking } from '../data/hampers';
import { products } from '../data/products';
import { resolvePresetLines, computeHamperPricing, formatINR } from '../utils/hamperPricing';
import { revealVariants, listItemVariants, staggerVariants, getRevealProps, smoothEase } from './motionPresets';
import './HampersTeaser.css';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

/* Homepage gateway to /hampers. Shows three real hampers at their real computed
   prices rather than marketing copy, so the section does actual selling. */

const FEATURED_PRESET_IDS = ['diwali-delight', 'corporate-classic', 'new-mom-nourish'];
const TEASER_OCCASION_IDS = ['diwali', 'raksha-bandhan', 'wedding', 'corporate', 'birthday', 'new-mom'];

const HampersTeaser = () => {
  const reduceMotion = useReducedMotion();

  const featured = useMemo(
    () =>
      FEATURED_PRESET_IDS
        .map((id) => PRESET_HAMPERS.find((p) => p.id === id))
        .filter(Boolean)
        .map((preset) => {
          const boxTier = getBoxTier(preset.boxTierId);
          // Priced with default packing, matching the /hampers preset cards.
          const lines = resolvePresetLines(preset, products, getDefaultPacking);
          return { preset, lines, pricing: computeHamperPricing(lines, boxTier, OFFER_TIERS) };
        })
        .filter((p) => p.lines.length > 0),
    []
  );

  const occasions = useMemo(
    () => TEASER_OCCASION_IDS.map((id) => OCCASIONS.find((o) => o.id === id)).filter(Boolean),
    []
  );

  return (
    <section
      className="nj-hteaser nj-pat nj-pat--gingham nj-pat--red nj-pat--bold nj-pat--fade-edges"
      aria-labelledby="nj-hteaser-title"
    >
      <div className="nj-hteaser-glow" aria-hidden="true" />

      <div className="container nj-hteaser-inner">
        <motion.div
          className="nj-hteaser-copy"
          variants={reduceMotion ? undefined : revealVariants}
          {...getRevealProps(reduceMotion)}
        >
          <span className="nj-hteaser-eyebrow">
            <BakeryStamp tone="red">New &middot; Gifting</BakeryStamp>
          </span>

          <h2 className="nj-hteaser-title" id="nj-hteaser-title">
            Gift hampers, built exactly how you want them
          </h2>

          <p className="nj-hteaser-lead">
            Choose a box, fill it with ladoos, granola, cakes and imported treats, and watch
            your price and savings update live. Ready-made hampers for every occasion too -
            Diwali, weddings, corporate gifting, new mums.
          </p>

          <motion.ul
            className="nj-hteaser-occasions"
            variants={reduceMotion ? undefined : staggerVariants}
            {...getRevealProps(reduceMotion)}
          >
            {occasions.map((occasion) => (
              <motion.li key={occasion.id} variants={reduceMotion ? undefined : listItemVariants}>
                <Link to={`/hampers/${occasion.slug}`} style={{ '--chip-accent': occasion.accent }}>
                  <span aria-hidden="true">{occasion.emoji}</span> {occasion.name}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <div className="nj-hteaser-cta">
            <Link to="/hampers" className="nj-hteaser-btn primary">
              <Gift size={17} /> Build your hamper
            </Link>
            <Link to="/hampers#ready-hampers" className="nj-hteaser-btn ghost">
              Ready-made hampers <ArrowRight size={15} />
            </Link>
          </div>

          <p className="nj-hteaser-note">Save up to 15% as your box grows · Bulk &amp; corporate welcome</p>
        </motion.div>

        <motion.div
          className="nj-hteaser-cards"
          variants={reduceMotion ? undefined : staggerVariants}
          {...getRevealProps(reduceMotion)}
        >
          {featured.map(({ preset, lines, pricing }, i) => (
            <motion.div
              className="nj-hteaser-card"
              key={preset.id}
              variants={reduceMotion ? undefined : listItemVariants}
              whileHover={reduceMotion ? undefined : { y: -6, rotate: 0 }}
              style={{ '--card-tilt': `${(i - 1) * 2.4}deg` }}
              transition={{ duration: 0.3, ease: smoothEase }}
            >
              <Link to="/hampers#ready-hampers" aria-label={`${preset.name} hamper, ${formatINR(pricing.total)}`}>
                <div className="nj-hteaser-card-media">
                  <img src={img(preset.image)} alt={preset.name} loading="lazy" />
                  <span className="nj-hteaser-card-count">{lines.length} items</span>
                </div>
                <div className="nj-hteaser-card-body">
                  <strong>{preset.name}</strong>
                  <span className="nj-hteaser-card-price">
                    {formatINR(pricing.total)}
                    {pricing.savings > 0 && <em>save {formatINR(pricing.savings)}</em>}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HampersTeaser;
