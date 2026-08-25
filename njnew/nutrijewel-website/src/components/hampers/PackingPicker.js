import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { RIBBON, findHamperProduct, getPackingOptions } from '../../data/hampers';
import { formatINR } from '../../utils/hamperPricing';

/*
 * Per-item packing, edited inside the basket line.
 *
 * Deliberately not on the product card: adding stays one tap with a sensible
 * default, and the choice is made afterwards on the item you actually kept.
 */

export default function PackingPicker({ line, onSelect, onToggleRibbon }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const options = getPackingOptions(findHamperProduct(line.productId));
  const current = options.find((o) => o.id === line.packingId) || options[0];
  const extras = (line.packingPrice || 0) + (line.ribbon ? line.ribbonPrice || 0 : 0);

  return (
    <div className="nj-packing">
      <button
        type="button"
        className={`nj-packing-toggle${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Packing for ${line.name}: ${current?.name}. Change`}
      >
        <span className="nj-packing-current">
          <span aria-hidden="true">{current?.emoji}</span>
          {current?.name}
          {line.ribbon && <span className="nj-packing-ribbon-dot" title="With ribbon">🎀</span>}
        </span>
        {extras > 0 && <span className="nj-packing-extra">+{formatINR(extras)}</span>}
        <ChevronDown size={12} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="nj-packing-panel"
            initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nj-packing-options" role="radiogroup" aria-label={`Packing for ${line.name}`}>
              {options.map((option) => {
                const isActive = option.id === current?.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`nj-packing-option${isActive ? ' is-active' : ''}`}
                    onClick={() => onSelect(line.key, option.id)}
                    title={option.blurb}
                  >
                    <span className="nj-packing-option-emoji" aria-hidden="true">{option.emoji}</span>
                    <span className="nj-packing-option-name">{option.name}</span>
                    <span className="nj-packing-option-price">
                      {option.price > 0 ? `+${formatINR(option.price)}` : 'Included'}
                    </span>
                    {isActive && <Check size={11} className="nj-packing-option-check" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <label className="nj-packing-ribbon">
              <input
                type="checkbox"
                checked={!!line.ribbon}
                onChange={() => onToggleRibbon(line.key)}
              />
              <span className="nj-packing-ribbon-box" aria-hidden="true">
                {line.ribbon && <Check size={10} />}
              </span>
              <span className="nj-packing-ribbon-label">
                🎀 {RIBBON.name}
                <em>+{formatINR(RIBBON.price)} each</em>
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
