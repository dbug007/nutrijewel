import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/*
 * The red ribbon that ties itself around a product the moment you tick the
 * ribbon option. Drawn as SVG so it scales to any slot size and needs no asset.
 *
 * The bands sweep in first, then the knot and bows pop, which reads as the
 * ribbon being tied rather than just appearing.
 */

/* Deliberately brighter than --hmp-primary so the ribbon still reads as an object
   on an indulgent-red section, with a gold edge doing the separating. */
const RED = '#E63149';
const RED_DARK = '#9E0F22';
const RED_LIGHT = '#F4586C';
const GOLD = '#E8C765';

export default function RibbonOverlay({ size = 'slot' }) {
  const reduceMotion = useReducedMotion();

  const band = (delay) =>
    reduceMotion
      ? {}
      : {
          initial: { scaleY: 0, opacity: 0 },
          animate: { scaleY: 1, opacity: 1 },
          transition: { duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] },
        };

  const pop = (delay) =>
    reduceMotion
      ? {}
      : {
          initial: { scale: 0, rotate: -35 },
          animate: { scale: 1, rotate: 0 },
          transition: { type: 'spring', stiffness: 620, damping: 16, delay },
        };

  return (
    <motion.svg
      className={`nj-ribbon-overlay is-${size}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
      initial={reduceMotion ? undefined : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.7, transition: { duration: 0.18 } }}
    >
      {/* vertical band, gold-piped down both edges */}
      <motion.g style={{ transformOrigin: '24px 24px' }} {...band(0)}>
        <rect x="19.5" y="0" width="9" height="48" rx="1" fill={RED} />
        <rect x="19.5" y="0" width="0.9" height="48" fill={GOLD} opacity="0.85" />
        <rect x="27.6" y="0" width="0.9" height="48" fill={GOLD} opacity="0.85" />
      </motion.g>
      {/* horizontal band */}
      <motion.rect
        x="0" y="19.5" width="48" height="9" rx="1"
        fill={RED_LIGHT} style={{ transformOrigin: '24px 24px' }}
        {...(reduceMotion
          ? {}
          : {
              initial: { scaleX: 0, opacity: 0 },
              animate: { scaleX: 1, opacity: 1 },
              transition: { duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
            })}
      />

      {/* bow */}
      <motion.g style={{ transformOrigin: '24px 24px' }} {...pop(0.3)}>
        <path d="M24 24 L10.5 13 L13 24 L10.5 35 Z" fill={RED} />
        <path d="M24 24 L37.5 13 L35 24 L37.5 35 Z" fill={RED} />
        <path d="M24 24 L10.5 13 L13 24 Z" fill={RED_DARK} opacity="0.5" />
        <path d="M24 24 L37.5 13 L35 24 Z" fill={RED_DARK} opacity="0.5" />
        <circle cx="24" cy="24" r="5.4" fill={GOLD} />
        <circle cx="24" cy="24" r="4.4" fill={RED_DARK} />
        <circle cx="22.4" cy="22.4" r="1.5" fill={RED_LIGHT} opacity="0.8" />
      </motion.g>
    </motion.svg>
  );
}
