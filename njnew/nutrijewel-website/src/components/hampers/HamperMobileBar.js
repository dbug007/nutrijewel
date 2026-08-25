import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronUp, PartyPopper } from 'lucide-react';
import { formatINR } from '../../utils/hamperPricing';
import RibbonOverlay from './RibbonOverlay';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

export const MOBILE_SLOTS_ID = 'nj-basket-mobile-slots';

/*
 * The phone version of the basket, docked to the bottom of the screen.
 *
 * It is always on screen, even with an empty box, for two reasons: you can watch
 * the box fill as you tap, and it gives the fly-to-basket animation something
 * visible to land in from the very first item.
 *
 * Tapping anywhere on it opens the full basket sheet. The order button lives in
 * the sheet, not here, so nobody orders before seeing the bill.
 */

export default function HamperMobileBar({ pricing, lines, onOpen }) {
  const reduceMotion = useReducedMotion();
  const emptySlots = Math.max(0, pricing.slots - pricing.slotsUsed);

  return (
    <button
      type="button"
      className={`nj-mbar${pricing.isFull ? ' is-full' : ''}`}
      onClick={onOpen}
      aria-label={`Open your hamper. ${pricing.slotsUsed} of ${pricing.slots} slots filled, total ${formatINR(pricing.total)}`}
    >
      <span className="nj-mbar-slots" id={MOBILE_SLOTS_ID} aria-hidden="true">
        {lines.flatMap((line) =>
          Array.from({ length: line.qty }).map((_, i) => (
            <motion.span
              className="nj-mbar-slot is-filled"
              key={`${line.key}-${i}`}
              initial={reduceMotion ? undefined : { scale: 0.3, opacity: 0 }}
              animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            >
              {line.image ? (
                <img src={img(line.image)} alt="" />
              ) : (
                <span className="nj-mbar-flag">{line.flag || '✦'}</span>
              )}
              <AnimatePresence>
                {line.ribbon && <RibbonOverlay key="ribbon" size="mini" />}
              </AnimatePresence>
            </motion.span>
          ))
        )}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <span className="nj-mbar-slot is-empty" key={`e-${i}`} />
        ))}
      </span>

      <span className="nj-mbar-meta">
        <strong>{formatINR(pricing.total)}</strong>
        <span className="nj-mbar-sub">
          {pricing.isFull ? (
            <><PartyPopper size={11} /> Box full</>
          ) : pricing.isEmpty ? (
            'Tap a product to start'
          ) : (
            `${pricing.slotsLeft} slot${pricing.slotsLeft === 1 ? '' : 's'} left`
          )}
          {pricing.appliedOffer ? ` · ${pricing.appliedOffer.percent}% off` : ''}
        </span>
      </span>

      <span className="nj-mbar-open" aria-hidden="true">
        <ChevronUp size={18} />
      </span>
    </button>
  );
}
