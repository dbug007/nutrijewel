import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { smoothEase, imageCrossfade } from './motionPresets';
import { scrollToId } from '../lib/smoothScroll';
import './HeroSection.css';

/* Cinematic Plate hero — full-bleed food, near-zero words.
   One product photo carries the brand; a kinetic word + signature + single CTA. */
const ROTATING_WORDS = ['Pure.', 'Joyful.', 'Crafted.'];
/* Soft crossfade slideshow — used on all breakpoints for now;
   desktop-specific art can be swapped in later. */
/* hero-mobile-5 intentionally excluded (not a released product). */
const HERO_IMAGES = [1, 2, 3, 4].map(
  n => `${process.env.PUBLIC_URL}/images/hero-mobile-${n}.jpg`
);

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const [wordIdx, setWordIdx] = useState(0);
  const [heroImg, setHeroImg] = useState(0);
  const heroRef = useRef(null);
  const heroPausedRef = useRef(false);
  const slideTimer = useRef(0);

  const startAutoplay = useCallback(() => {
    clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      if (heroPausedRef.current) return;
      setHeroImg(i => (i + 1) % HERO_IMAGES.length);
    }, 2500);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    startAutoplay();
    return () => clearInterval(slideTimer.current);
  }, [reduceMotion, startAutoplay]);

  // Manual slide select — jump + restart the autoplay clock so the next
  // auto-advance is a full interval away (no jarring quick-skip).
  const selectSlide = (i) => {
    setHeroImg(i);
    if (!reduceMotion) startAutoplay();
  };

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

  const scrollToProducts = () => scrollToId('products');

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: smoothEase } },
  };

  /* Cinematic crossfade + slow Ken-Burns zoom: each photo eases in while
     drifting from 1.0 → 1.08 over 7s, so the hero is never visually static. */
  const heroSlide = reduceMotion
    ? imageCrossfade
    : {
        enter: { opacity: 0, scale: 1 },
        center: {
          opacity: 1,
          scale: 1.08,
          transition: {
            opacity: { duration: 1.1, ease: smoothEase },
            scale: { duration: 7, ease: 'linear' },
          },
        },
        exit: { opacity: 0, transition: { duration: 1.1, ease: smoothEase } },
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
          variants={heroSlide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduceMotion ? { duration: 0 } : undefined}
        />
      </AnimatePresence>

      {/* Layers 1-2 — legibility scrim + subtle film grain (both decorative) */}
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

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
          Handcrafted by Ruchika Bachwani
        </motion.p>

        <motion.button className="hero-taste-btn" variants={fadeUp} onClick={scrollToProducts}>
          <span>Taste Now</span>
          <ChevronRight size={20} />
        </motion.button>
      </motion.div>

      {/* Slide progress — segmented "story" bar; active segment fills over the
          2.5s interval and pauses on hover. Each segment is a jump control. */}
      <div className="hero-progress" role="tablist" aria-label="Hero images">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === heroImg}
            aria-label={`Show image ${i + 1} of ${HERO_IMAGES.length}`}
            className={`hero-progress-seg${i === heroImg ? ' is-active' : ''}`}
            onClick={() => selectSlide(i)}
          >
            <span className="hero-progress-fill" />
          </button>
        ))}
      </div>

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
