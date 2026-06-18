import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { smoothEase } from './motionPresets';
import './HeroSection.css';

/* Cinematic Plate hero — full-bleed food, near-zero words.
   One product photo carries the brand; a kinetic word + signature + single CTA. */
const ROTATING_WORDS = ['Pure.', 'Joyful.', 'Crafted.'];
const HERO_IMAGE = `${process.env.PUBLIC_URL}/images/stuffeddates.jpg`;

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919960637656?text=Hi! I\'m interested in NutriJewel products. Can you help me?',
      '_blank'
    );
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: smoothEase } },
  };

  return (
    <section className="hero-section" aria-label="NutriJewel — handcrafted, guilt-free sweets and snacks">
      {/* Layer 0 — full-bleed image with slow Ken-Burns drift */}
      <motion.img
        className="hero-cinematic-img"
        src={HERO_IMAGE}
        alt="Handcrafted dark-chocolate stuffed dates topped with pistachio and dried rose"
        initial={{ scale: 1 }}
        animate={reduceMotion ? { scale: 1 } : { scale: 1.09 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
      />

      {/* Layers 1-3 — legibility scrim, film grain, gallery frame (all decorative) */}
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-frame" aria-hidden="true" />

      {/* Content — lower-left */}
      <motion.div className="hero-content" variants={stagger} initial="hidden" animate="visible">
        <motion.h1 className="hero-word" variants={fadeUp} aria-label="Pure, joyful, crafted.">
          <span className="hero-word-mask">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ROTATING_WORDS[wordIdx]}
                className="hero-word-text"
                initial={reduceMotion ? false : { y: '115%' }}
                animate={{ y: '0%' }}
                exit={reduceMotion ? { opacity: 0 } : { y: '-115%' }}
                transition={{ duration: 0.5, ease: smoothEase }}
              >
                {ROTATING_WORDS[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p className="hero-signature" variants={fadeUp}>
          Handcrafted by Dt. Ruchika Bachwani
        </motion.p>

        <motion.button className="hero-taste-btn" variants={fadeUp} onClick={handleWhatsApp}>
          <span>Taste Now</span>
          <ChevronRight size={20} />
        </motion.button>
      </motion.div>

      {/* Scroll cue */}
      <div className="hero-scrollcue" aria-hidden="true">
        <span className="hero-scrollcue-line" />
        <ChevronDown size={16} className="hero-scrollcue-chevron" />
      </div>
    </section>
  );
};

export default HeroSection;
