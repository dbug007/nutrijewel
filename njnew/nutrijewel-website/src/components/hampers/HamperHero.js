import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Gift, ArrowDown } from 'lucide-react';
import { smoothEase } from '../motionPresets';
import { scrollToId } from '../../lib/smoothScroll';
import BakeryStamp from '../BakeryStamp';

/* The lid lifts off the box on load, one deliberate flourish, then it settles.
   Everything animated here is skipped under prefers-reduced-motion. */

export default function HamperHero() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: smoothEase },
        };

  return (
    <section className="nj-hero-hampers nj-pat nj-pat--gingham nj-pat--red nj-pat--bold nj-pat--fade-edges">
      <div className="nj-hero-hampers-glow" aria-hidden="true" />

      <div className="container nj-hero-hampers-inner">
        <div className="nj-hero-hampers-copy">
          <motion.span className="nj-hero-hampers-eyebrow" {...reveal(0)}>
            <BakeryStamp tone="red">New &middot; Hand packed</BakeryStamp>
          </motion.span>

          <motion.h1 className="nj-hero-hampers-title" {...reveal(0.08)}>
            Gift hampers,
            <span className="nj-hero-hampers-title-accent"> curated by you.</span>
          </motion.h1>

          <motion.p className="nj-hero-hampers-lead" {...reveal(0.16)}>
            Pick a box. Fill it with whatever you like: ladoos, granola, cakes, imported
            treats. Watch the price and your savings update as you build. Every hamper is
            packed and wrapped by hand.
          </motion.p>

          <motion.div className="nj-hero-hampers-cta" {...reveal(0.24)}>
            <button className="nj-hero-hampers-btn primary" onClick={() => scrollToId('hamper-builder')}>
              <Gift size={17} /> Build your own
            </button>
            <button className="nj-hero-hampers-btn ghost" onClick={() => scrollToId('ready-hampers')}>
              Shop ready hampers
            </button>
          </motion.div>

          <motion.ul className="nj-hero-hampers-points" {...reveal(0.32)}>
            <li>Refined-sugar-free options</li>
            <li>Up to 15% off as your box grows</li>
            <li>Bulk &amp; corporate welcome</li>
          </motion.ul>
        </div>

        {/* ---- The box, drawn in CSS so there's no image to load ---- */}
        <div className="nj-hero-box-stage" aria-hidden="true">
          <motion.div
            className="nj-hero-box"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9, y: 30 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: smoothEase }}
          >
            <motion.div
              className="nj-hero-box-lid"
              initial={reduceMotion ? undefined : { y: 0, rotate: 0 }}
              animate={reduceMotion ? undefined : { y: -26, rotate: -7 }}
              transition={{ duration: 0.9, delay: 0.85, ease: smoothEase }}
            >
              <span className="nj-hero-box-ribbon-h" />
            </motion.div>

            <div className="nj-hero-box-body">
              <span className="nj-hero-box-ribbon-v" />
              {['🍪', '🥜', '🍫', '🌰'].map((emoji, i) => (
                <motion.span
                  key={emoji}
                  className={`nj-hero-box-treat t${i + 1}`}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.6 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.15 + i * 0.11, ease: smoothEase }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.span
            className="nj-hero-box-hint"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <ArrowDown size={13} /> Start below
          </motion.span>
        </div>
      </div>
    </section>
  );
}
