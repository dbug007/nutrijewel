import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { smoothEase, imageCrossfade } from './motionPresets';
import './HeroSection.css';

/* Cinematic Plate hero — full-bleed food, near-zero words.
   One product photo carries the brand; a kinetic word + signature + single CTA. */
const ROTATING_WORDS = ['Pure.', 'Joyful.', 'Crafted.'];
/* Soft crossfade slideshow — used on all breakpoints for now;
   desktop-specific art can be swapped in later. */
const HERO_IMAGES = [1, 2, 3, 4, 5].map(
  n => `${process.env.PUBLIC_URL}/images/hero-mobile-${n}.jpg`
);

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const [wordIdx, setWordIdx] = useState(0);
  const [heroImg, setHeroImg] = useState(0);
  const heroRef = useRef(null);
  const heroPausedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      if (heroPausedRef.current) return;
      setHeroImg(i => (i + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  // Hold the slideshow while hovering or scrolling.
  useEffect(() => {
    if (reduceMotion) return undefined;
    const el = heroRef.current;
    let resumeTimer = 0;
    const pause = () => { heroPausedRef.current = true; clearTimeout(resumeTimer); };
    const resumeSoon = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { heroPausedRef.current = false; }, 1500);
    };
    const onScroll = () => { pause(); resumeSoon(); };
    if (el) {
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', resumeSoon);
      el.addEventListener('touchstart', pause, { passive: true });
      el.addEventListener('touchend', resumeSoon, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(resumeTimer);
      if (el) {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resumeSoon);
        el.removeEventListener('touchstart', pause);
        el.removeEventListener('touchend', resumeSoon);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduceMotion]);

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <section className="hero-section" ref={heroRef} aria-label="NutriJewel — handcrafted, guilt-free sweets and snacks">
      {/* Layer 0 — full-bleed hero: soft crossfade slideshow (all breakpoints). */}
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={heroImg}
          className="hero-cinematic-img"
          src={HERO_IMAGES[heroImg]}
          alt="NutriJewel handcrafted treats"
          variants={imageCrossfade}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduceMotion ? { duration: 0 } : { duration: 1.1, ease: smoothEase }}
        />
      </AnimatePresence>

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

        <motion.button className="hero-taste-btn" variants={fadeUp} onClick={scrollToProducts}>
          <span>Taste Now</span>
          <ChevronRight size={20} />
        </motion.button>
      </motion.div>

      {/* Scroll cue */}
      <div className="hero-scrollcue" aria-hidden="true">
        <span className="hero-scrollcue-label">Best Sellers</span>
        <span className="hero-scrollcue-line" />
        <ChevronDown size={16} className="hero-scrollcue-chevron" />
      </div>
    </section>
  );
};

export default HeroSection;
