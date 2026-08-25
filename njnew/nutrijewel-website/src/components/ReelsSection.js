import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Volume2, VolumeX, Instagram, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getRevealProps, staggerVariants, smoothEase } from './motionPresets';
import './ReelsSection.css';

/* Reels theater.
   - Strip: exactly ONE video plays at a time (low CPU): the "active" reel
     auto-plays muted and advances to the next when it ends, looping 1->5->1.
     Hovering any reel pauses the rotation and plays THAT reel with sound.
   - Tap any reel to open a full-screen vertical player (sound on) with
     prev/next via arrows, keyboard, or swipe.
   - An ambient blurred wash of the featured reel bleeds colour behind the
     strip for a cinematic feel.
   Videos live in public/reels/ (reel1.mp4 … reel5.mp4) with poster frames
   reelN.jpg. */
const REELS = [
  { src: '/reels/reel1.mp4', poster: '/reels/reel1.jpg' },
  { src: '/reels/reel2.mp4', poster: '/reels/reel2.jpg' },
  { src: '/reels/reel3.mp4', poster: '/reels/reel3.jpg' },
  { src: '/reels/reel4.mp4', poster: '/reels/reel4.jpg' },
  { src: '/reels/reel5.mp4', poster: '/reels/reel5.jpg' },
];

const IG_URL = 'https://instagram.com/nutrijewel';

const reelReveal = {
  hidden: { opacity: 0, y: 34, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: smoothEase } },
};

export default function ReelsSection() {
  const base = process.env.PUBLIC_URL || '';
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const hoverRef = useRef(null);
  const videoRefs = useRef([]);
  const modalVideoRef = useRef(null);

  // Single source of truth for the strip: hovered reel (with sound) if any,
  // else the active reel (muted). Everything paused while the viewer is open.
  useEffect(() => {
    if (openIndex != null) {
      videoRefs.current.forEach((v) => { if (v) { v.pause(); v.muted = true; } });
      return;
    }
    const target = hover != null ? hover : active;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === target) {
        v.loop = hover != null; // loop while hovering; otherwise play once then advance
        v.muted = hover == null; // sound only on hover
        const p = v.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            if (hover != null) { v.muted = true; v.play().catch(() => {}); }
          });
        }
      } else {
        v.pause();
        v.muted = true;
      }
    });
  }, [active, hover, openIndex]);

  const handleEnded = useCallback((i) => {
    if (hoverRef.current != null) return; // hovering: let it loop, do not advance
    setActive((prev) => (i === prev ? (prev + 1) % REELS.length : prev));
  }, []);

  const enter = (i) => { hoverRef.current = i; setHover(i); };
  const leave = (i) => {
    if (hoverRef.current === i) { hoverRef.current = null; setHover(null); }
  };

  const openReel = (i) => setOpenIndex(i);
  const closeReel = useCallback(() => setOpenIndex(null), []);
  const step = useCallback((dir) => {
    setOpenIndex((prev) => (prev == null ? prev : (prev + dir + REELS.length) % REELS.length));
  }, []);

  // Full-screen player: scroll lock + keyboard navigation.
  useEffect(() => {
    if (openIndex == null) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeReel();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, closeReel, step]);

  // Play the open reel with sound whenever it changes (fall back to muted if the
  // browser blocks audio autoplay).
  useEffect(() => {
    const v = modalVideoRef.current;
    if (openIndex == null || !v) return;
    v.currentTime = 0;
    v.muted = false;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { v.muted = true; v.play().catch(() => {}); });
    }
  }, [openIndex]);

  // Swipe navigation for the full-screen player.
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 60) {
      if (Math.abs(dx) >= Math.abs(dy)) step(dx < 0 ? 1 : -1);
      else step(dy < 0 ? 1 : -1);
    }
    touchStart.current = null;
  };

  const glowIndex = hover != null ? hover : active;

  return (
    <section className="nj-reels-section" id="reels" aria-label="NutriJewel reels">
      {/* Ambient blurred wash of the featured reel */}
      <div className="nj-reels-ambient" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.span
            key={glowIndex}
            className="nj-reels-ambient-img"
            style={{ backgroundImage: `url(${base}${REELS[glowIndex].poster})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>

      <div className="nj-reels-head">
        <span className="nj-reels-kicker"><Instagram size={15} /> @nutrijewel</span>
        <h2 className="nj-reels-title">Fresh from the Reels</h2>
        <p className="nj-reels-sub">Hover to preview, tap any reel to watch it full screen.</p>
      </div>

      <motion.div
        className="nj-reels-strip"
        {...(reduceMotion ? {} : { variants: staggerVariants, ...revealProps })}
      >
        {REELS.map((r, i) => {
          const isHovered = hover === i;
          const playing = (hover != null ? hover : active) === i;
          return (
            <motion.div
              key={i}
              className={`nj-reel${playing ? ' is-playing' : ''}${isHovered ? ' is-hover' : ''}`}
              variants={reduceMotion ? undefined : reelReveal}
              whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03, transition: { duration: 0.35, ease: smoothEase } }}
              onMouseEnter={() => enter(i)}
              onMouseLeave={() => leave(i)}
              onClick={() => openReel(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReel(i); } }}
              role="button"
              tabIndex={0}
              aria-label={`Watch reel ${i + 1} full screen`}
            >
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                className="nj-reel-video"
                src={`${base}${r.src}`}
                poster={`${base}${r.poster}`}
                muted
                playsInline
                preload="auto"
                onEnded={() => handleEnded(i)}
              />
              <span className="nj-reel-scrim" aria-hidden="true" />
              <span className="nj-reel-expand" aria-hidden="true"><Maximize2 size={16} /></span>
              <span className={`nj-reel-badge${isHovered ? ' is-on' : ''}`} aria-hidden="true">
                {isHovered ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="nj-reels-cta">
        <a className="nj-reels-follow" href={IG_URL} target="_blank" rel="noopener noreferrer">
          <Instagram size={18} /> Follow @nutrijewel
        </a>
      </div>

      {/* Full-screen vertical player */}
      <AnimatePresence>
        {openIndex != null && (
          <motion.div
            className="nj-reel-viewer"
            role="dialog"
            aria-modal="true"
            aria-label="Reel player"
            onClick={closeReel}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button className="nj-reel-viewer-close" onClick={closeReel} aria-label="Close">
              <X size={22} />
            </button>
            <button
              className="nj-reel-viewer-nav prev"
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Previous reel"
            >
              <ChevronLeft size={26} />
            </button>

            <motion.div
              className="nj-reel-viewer-stage"
              key={openIndex}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: smoothEase }}
            >
              <video
                ref={modalVideoRef}
                className="nj-reel-viewer-video"
                src={`${base}${REELS[openIndex].src}`}
                poster={`${base}${REELS[openIndex].poster}`}
                playsInline
                autoPlay
                loop
                controls
              />
              <a className="nj-reel-viewer-ig" href={IG_URL} target="_blank" rel="noopener noreferrer">
                <Instagram size={16} /> Watch on Instagram
              </a>
            </motion.div>

            <button
              className="nj-reel-viewer-nav next"
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Next reel"
            >
              <ChevronRight size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
