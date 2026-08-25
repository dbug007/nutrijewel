import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';

/**
 * 3D pointer-tilt card. Tracks the cursor across the card and tilts it slightly
 * toward the pointer for a sense of depth, springing back on leave. Renders a
 * motion.article and forwards all motion props (variants, initial, whileInView,
 * viewport, whileHover, onClick, onKeyDown, role, tabIndex, style, className),
 * so it is a drop-in replacement for a motion.article.
 *
 * Under prefers-reduced-motion the tilt is disabled and it renders a plain
 * motion.article, so scroll reveals and hover lift still work without the tilt.
 *
 * Note: the tilt writes an inline transform, which overrides any CSS :hover
 * transform. Pass the lift via whileHover (e.g. hoverLift) so the card still
 * rises on hover; box-shadow / border CSS :hover styles are unaffected.
 */
export default function TiltCard({ children, className, style, maxTilt = 7, ...rest }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), spring);

  if (reduceMotion) {
    return (
      <motion.article ref={ref} className={className} style={style} {...rest}>
        {children}
      </motion.article>
    );
  }

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      {...rest}
    >
      {children}
    </motion.article>
  );
}
