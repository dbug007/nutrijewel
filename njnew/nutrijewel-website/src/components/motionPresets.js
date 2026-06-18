export const smoothEase = [0.22, 1, 0.36, 1];

/* Shared elegant crossfade for auto-rotating / swappable images.
   Pure opacity dissolve (no lateral motion) — calm and premium. */
export const imageCrossfade = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const imageFadeTransition = { duration: 0.8, ease: smoothEase };

export const revealVariants = {
  hidden: { opacity: 0.45, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: smoothEase
    }
  }
};

export const cardVariants = {
  hidden: { opacity: 0.5, y: 10, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: smoothEase
    }
  }
};

export const staggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02
    }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0.55, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: smoothEase
    }
  }
};

export const hoverLift = {
  y: -6,
  transition: {
    duration: 0.28,
    ease: smoothEase
  }
};

export const tapShrink = {
  scale: 0.98,
  transition: {
    duration: 0.16,
    ease: smoothEase
  }
};

export const getRevealProps = (reduceMotion) => {
  if (reduceMotion) {
    return {
      initial: false,
      whileInView: undefined,
      viewport: undefined
    };
  }

  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, amount: 0.01, margin: '0px 0px -14% 0px' }
  };
};
