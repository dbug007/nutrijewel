import React, { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ShoppingCart, Wand2, Package } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import {
  OFFER_TIERS,
  IMPORTED_PRODUCTS,
  DEFAULT_CONTAINER_STYLE_ID,
  DEFAULT_NOTE_OPTION_ID,
  getBoxTier,
  getOccasion,
  getPresetsForOccasion,
  getDefaultPacking,
  getContainerStyle,
  getNoteOption,
} from '../../data/hampers';
import { products } from '../../data/products';
import { resolvePresetLines, computeHamperPricing, formatINR } from '../../utils/hamperPricing';
import { scrollToId } from '../../lib/smoothScroll';
import Shelf from '../Shelf';
import BakeryStamp from '../BakeryStamp';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

/* Ready-to-gift hampers. Prices are derived from the live product catalog by the
   same engine the builder uses, so a preset can never show a stale price. */

export default function PresetHamperGrid({ occasionId, builder }) {
  const reduceMotion = useReducedMotion();
  const { addHamperToCart, openCart } = useStore();
  const catalog = useMemo(() => [...products, ...IMPORTED_PRODUCTS], []);

  // Presets are priced with the same defaults the builder starts from, default
  // packing per item, standard gift box, no note, so "Add to cart" and
  // "Customise" can never disagree on the price.
  const defaults = useMemo(
    () => ({
      containerStyle: getContainerStyle(DEFAULT_CONTAINER_STYLE_ID),
      noteOption: getNoteOption(DEFAULT_NOTE_OPTION_ID),
    }),
    []
  );

  const presets = useMemo(() => {
    const list = getPresetsForOccasion(occasionId);
    return list.map((preset) => {
      const boxTier = getBoxTier(preset.boxTierId);
      const lines = resolvePresetLines(preset, catalog, getDefaultPacking);
      return {
        preset,
        boxTier,
        lines,
        pricing: computeHamperPricing(lines, boxTier, OFFER_TIERS, defaults),
      };
    }).filter((p) => p.lines.length > 0);
  }, [occasionId, catalog, defaults]);

  const occasion = getOccasion(occasionId);

  const handleAdd = ({ preset, boxTier, lines, pricing }) => {
    addHamperToCart({
      lines,
      pricing,
      boxTier,
      containerStyle: defaults.containerStyle,
      noteOption: defaults.noteOption,
      noteMessage: '',
      occasion: getOccasion(preset.occasionIds?.[0]),
    });
    openCart();
  };

  const handleCustomise = (presetId) => {
    builder.loadPreset(presetId);
    scrollToId('hamper-builder');
  };

  return (
    <section
      className="nj-presets nj-pat nj-pat--windowpane nj-pat--red nj-pat--soft"
      id="ready-hampers"
      aria-labelledby="nj-presets-title"
    >
      <div className="container">
        <div className="nj-section-head">
          <h2 className="nj-section-title" id="nj-presets-title">
            {occasion ? `Hampers for ${occasion.name}` : 'Ready to gift'}
          </h2>
          <p className="nj-section-sub">
            {occasion
              ? occasion.blurb
              : 'Curated boxes, ready to order. Add one as-is, or open it in the builder and make it yours.'}
          </p>
        </div>

        {/* A shelf, not a grid. Nine cards stacked was roughly 4,300px of scrolling
            on a phone; one swipeable row is about 520px. */}
        <Shelf label="Ready-made hampers" arrows>
          <AnimatePresence mode="popLayout" initial={false}>
            {presets.map(({ preset, boxTier, lines, pricing }) => (
              <motion.article
                className="nj-preset-card"
                key={preset.id}
                layout={!reduceMotion}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="nj-preset-media">
                  {preset.image ? (
                    <img src={img(preset.image)} alt={preset.name} loading="lazy" />
                  ) : (
                    <span className="nj-preset-media-fallback"><Package size={28} /></span>
                  )}
                  <BakeryStamp tone="red" frame="postage" className="nj-preset-tier">
                    {boxTier.name} &middot; {lines.length} items
                  </BakeryStamp>
                  {pricing.appliedOffer && (
                    <span className="nj-preset-offer">{pricing.appliedOffer.percent}% off</span>
                  )}
                </div>

                <div className="nj-preset-body">
                  <h3 className="nj-preset-name">{preset.name}</h3>
                  <p className="nj-preset-blurb">{preset.blurb}</p>

                  <ul className="nj-preset-items">
                    {lines.slice(0, 4).map((line) => (
                      <li key={line.key}>
                        <span>{line.name}</span>
                        <small>{line.weight}</small>
                      </li>
                    ))}
                    {lines.length > 4 && (
                      <li className="nj-preset-more">+ {lines.length - 4} more</li>
                    )}
                  </ul>

                  <div className="nj-preset-price">
                    <strong>{formatINR(pricing.total)}</strong>
                    {pricing.savings > 0 && (
                      <>
                        <s>{formatINR(pricing.mrpTotal + pricing.presentationTotal)}</s>
                        <span className="nj-preset-save">save {formatINR(pricing.savings)}</span>
                      </>
                    )}
                  </div>

                  <div className="nj-preset-actions">
                    <button
                      className="nj-preset-btn primary"
                      onClick={() => handleAdd({ preset, boxTier, lines, pricing })}
                    >
                      <ShoppingCart size={15} /> Add to cart
                    </button>
                    <button
                      className="nj-preset-btn ghost"
                      onClick={() => handleCustomise(preset.id)}
                    >
                      <Wand2 size={15} /> Customise
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </Shelf>
      </div>
    </section>
  );
}
