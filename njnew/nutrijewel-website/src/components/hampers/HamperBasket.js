import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { useDroppable } from '@dnd-kit/core';
import { Gift, Minus, Plus, Trash2, ShoppingCart, Sparkles, PartyPopper, Undo2, RotateCcw, X } from 'lucide-react';
import { formatINR } from '../../utils/hamperPricing';
import Confetti from '../birthday/Confetti';
import PackingPicker from './PackingPicker';
import RibbonOverlay from './RibbonOverlay';

const img = (src) => `${process.env.PUBLIC_URL}${src || ''}`;

export const BASKET_DROP_ID = 'nj-hamper-basket';
export const BASKET_SLOTS_ID = 'nj-basket-slots';

/*
 * The live hamper basket. Everything the customer is deciding about, what's in
 * the box, how each item is packed, what it costs, what they've unlocked and
 * what's one more item away, is visible here at all times.
 */

export default function HamperBasket({ builder, shakeKey = 0, onAddToCart, onClose }) {
  const reduceMotion = useReducedMotion();
  const { pricing, boxTier, containerStyle, noteOption, lines } = builder;
  const { setNodeRef, isOver } = useDroppable({ id: BASKET_DROP_ID });

  const [confettiKey, setConfettiKey] = useState(0);
  const wasFull = useRef(false);
  const prevOfferId = useRef(pricing.appliedOffer?.id || null);
  const [tierPulse, setTierPulse] = useState(0);

  // Shake via animation controls, not a changing `key`, remounting would tear
  // down the droppable ref and lose the confetti/tier state.
  const shakeCtrls = useAnimationControls();
  const prevShake = useRef(shakeKey);

  useEffect(() => {
    if (shakeKey !== prevShake.current && shakeKey > 0 && !reduceMotion) {
      shakeCtrls.start({
        x: [0, -8, 8, -5, 5, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      });
    }
    prevShake.current = shakeKey;
  }, [shakeKey, reduceMotion, shakeCtrls]);

  // Celebrate the moment the box fills, once per fill, not on every re-render.
  useEffect(() => {
    if (pricing.isFull && !wasFull.current) setConfettiKey((k) => k + 1);
    wasFull.current = pricing.isFull;
  }, [pricing.isFull]);

  // Pulse the progress bar when a new discount tier unlocks.
  useEffect(() => {
    const id = pricing.appliedOffer?.id || null;
    if (id && id !== prevOfferId.current) setTierPulse((p) => p + 1);
    prevOfferId.current = id;
  }, [pricing.appliedOffer]);

  const emptySlots = Math.max(0, pricing.slots - pricing.slotsUsed);

  return (
    <>
      <Confetti fireKey={confettiKey} />

      <motion.aside
        ref={setNodeRef}
        className={`nj-basket${isOver ? ' is-over' : ''}${pricing.isFull ? ' is-full' : ''}`}
        aria-label="Your hamper"
        animate={shakeCtrls}
      >
        <header className="nj-basket-head">
          <h3 className="nj-basket-title">
            <Gift size={17} /> Your hamper
          </h3>
          <span className="nj-basket-tier">{boxTier.name} {containerStyle.name.toLowerCase()}</span>
          {/* Visible only on the phone sheet, where the grab handle alone is easy to miss. */}
          <button className="nj-basket-close" onClick={onClose} aria-label="Close your hamper">
            <X size={18} />
          </button>
        </header>

        {/* ---- Slot grid: the box, visualised. Also the fly-to-basket target. ---- */}
        <div className="nj-basket-slots" id={BASKET_SLOTS_ID} aria-hidden="true">
          {lines.flatMap((line) =>
            Array.from({ length: line.qty }).map((_, i) => (
              <motion.span
                className="nj-slot is-filled"
                key={`${line.key}-${i}`}
                initial={reduceMotion ? undefined : { scale: 0.5, opacity: 0 }}
                animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 460, damping: 26 }}
                title={`${line.name} (${line.weight}), ${line.packingName || 'packed'}`}
              >
                {line.image ? (
                  <img src={img(line.image)} alt="" />
                ) : (
                  <span className="nj-slot-flag">{line.flag || '✦'}</span>
                )}
                <AnimatePresence>
                  {line.ribbon && <RibbonOverlay key="ribbon" />}
                </AnimatePresence>
              </motion.span>
            ))
          )}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <span className="nj-slot is-empty" key={`empty-${i}`} />
          ))}
        </div>

        <p className="nj-basket-count">
          {pricing.slotsUsed} of {pricing.slots} slots filled
          {pricing.isFull && <span className="nj-basket-full-tag"><PartyPopper size={12} /> Full</span>}
        </p>

        {/* ---- Contents ---- */}
        {pricing.isEmpty ? (
          <div className="nj-basket-empty">
            <span className="nj-basket-empty-icon"><Gift size={30} /></span>
            <p>Your box is empty.</p>
            <p className="nj-basket-empty-sub">Tap a product to drop it in, or drag one over here.</p>
          </div>
        ) : (
          <ul className="nj-basket-lines">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.key}
                  layout={!reduceMotion}
                  initial={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                  animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 40, height: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="nj-basket-line-top">
                    <div className="nj-basket-line-main">
                      <span className="nj-basket-line-name">
                        {line.name}
                        {line.isImported && <span className="nj-basket-imported">{line.flag}</span>}
                      </span>
                      <span className="nj-basket-line-weight">{line.weight}</span>
                    </div>

                    <div className="nj-basket-line-qty">
                      <button
                        onClick={() => builder.setLineQty(line.key, line.qty - 1)}
                        aria-label={`Remove one ${line.name}`}
                      >
                        <Minus size={12} />
                      </button>
                      <span>{line.qty}</span>
                      <button
                        onClick={() => builder.setLineQty(line.key, line.qty + 1)}
                        disabled={pricing.isFull}
                        aria-label={`Add one more ${line.name}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="nj-basket-line-price">{formatINR(line.unitPrice * line.qty)}</span>

                    <button
                      className="nj-basket-line-remove"
                      onClick={() => builder.removeLine(line.key)}
                      aria-label={`Remove ${line.name} from your hamper`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <PackingPicker
                    line={line}
                    onSelect={builder.setLinePacking}
                    onToggleRibbon={builder.toggleLineRibbon}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* ---- Offer progress ---- */}
        <div className="nj-basket-offer">
          <div className="nj-basket-offer-track">
            <motion.div
              className={`nj-basket-offer-fill${pricing.appliedOffer ? ' has-offer' : ''}`}
              animate={{ width: `${Math.round(pricing.offerProgress * 100)}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <AnimatePresence>
              {tierPulse > 0 && !reduceMotion && (
                <motion.div
                  className="nj-basket-offer-pulse"
                  key={tierPulse}
                  initial={{ opacity: 0.85, scaleX: 1 }}
                  animate={{ opacity: 0, scaleX: 1.02 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </div>

          <p className="nj-basket-offer-text">
            {pricing.appliedOffer ? (
              <>
                <Sparkles size={12} />
                <strong>{pricing.appliedOffer.percent}% off unlocked</strong>
                {pricing.nextOffer && (
                  <>
                    {', add '}
                    <strong>{formatINR(pricing.amountToNextOffer)}</strong>
                    {` more for ${pricing.nextOffer.percent}%`}
                  </>
                )}
              </>
            ) : pricing.nextOffer ? (
              <>
                Add <strong>{formatINR(pricing.amountToNextOffer)}</strong> more to unlock{' '}
                <strong>{pricing.nextOffer.percent}% off</strong>
              </>
            ) : (
              'Every hamper is packed and wrapped by hand.'
            )}
          </p>
        </div>

        {/* ---- Price breakdown ---- */}
        <dl className="nj-basket-bill">
          <div>
            <dt>Items ({pricing.slotsUsed})</dt>
            <dd>{formatINR(pricing.itemsTotal)}</dd>
          </div>
          {pricing.packingTotal > 0 && (
            <div>
              <dt>Packing &amp; ribbons</dt>
              <dd>{formatINR(pricing.packingTotal)}</dd>
            </div>
          )}
          <div>
            <dt>
              {boxTier.name} {containerStyle.name.toLowerCase()}
              {containerStyle.price > 0 && <span className="nj-basket-bill-note"> incl. style</span>}
            </dt>
            <dd>{formatINR(pricing.containerTotal)}</dd>
          </div>
          {pricing.notePrice > 0 && (
            <div>
              <dt>{noteOption.name}</dt>
              <dd>{formatINR(pricing.notePrice)}</dd>
            </div>
          )}
          {pricing.discount > 0 && (
            <div className="is-discount">
              <dt>{pricing.appliedOffer.label}</dt>
              <dd>−{formatINR(pricing.discount)}</dd>
            </div>
          )}
        </dl>

        <div className="nj-basket-total">
          <span>Total</span>
          <strong>
            <NumberFlow
              value={pricing.total}
              format={{ style: 'currency', currency: 'INR', maximumFractionDigits: 0 }}
              locales="en-IN"
            />
          </strong>
        </div>

        {/* Screen readers get a plain-text total rather than the animated digits. */}
        <p className="nj-sr-only" aria-live="polite">
          Hamper total {formatINR(pricing.total)}, {pricing.slotsUsed} of {pricing.slots} slots filled.
        </p>

        {pricing.savings > 0 && (
          <p className="nj-basket-savings">You save {formatINR(pricing.savings)}</p>
        )}

        <button
          className="nj-basket-cta"
          onClick={onAddToCart}
          disabled={pricing.isEmpty}
        >
          <ShoppingCart size={16} />
          {pricing.isEmpty ? 'Add something first' : 'Add hamper to cart'}
        </button>

        {/* Both ways back out, side by side and within thumb reach. Start over
            needs no confirmation because Undo can bring it straight back. */}
        {(builder.canUndo || !pricing.isEmpty) && (
          <div className="nj-basket-escape">
            <button
              className="nj-basket-undo"
              onClick={builder.undo}
              disabled={!builder.canUndo}
            >
              <Undo2 size={14} />
              {builder.canUndo ? 'Undo last change' : 'Nothing to undo'}
            </button>
            {!pricing.isEmpty && (
              <button className="nj-basket-clear" onClick={builder.clearHamper}>
                <RotateCcw size={14} /> Start over
              </button>
            )}
          </div>
        )}
      </motion.aside>
    </>
  );
}
