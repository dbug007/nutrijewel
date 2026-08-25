import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Animated number that counts from 0 up to `value` once it scrolls into view
 * (fires once). Respects prefers-reduced-motion by showing the final value
 * immediately. Keeps the surrounding markup/classes intact — drop it in place
 * of a static stat number.
 *
 * <CountUp value={100} suffix="%" />        -> 100%
 * <CountUp value={1000} suffix="+" />       -> 1000+
 * <CountUp value={5} decimals={1} suffix="★" /> -> 5.0★
 *
 * @param {number} value     target number to count to
 * @param {number} [duration] seconds for the count animation (default 1.6)
 * @param {number} [decimals] fixed decimal places (default 0)
 * @param {string} [prefix]  text before the number (e.g. "₹")
 * @param {string} [suffix]  text after the number (e.g. "+", "%", "★")
 * @param {string} [className]
 */
export default function CountUp({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (reduceMotion) {
      setDisplay(value);
      return undefined;
    }

    let raf = 0;
    let startTs = 0;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const t = Math.min(1, (ts - startTs) / (duration * 1000));
      setDisplay(value * easeOutCubic(t));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [value, duration, reduceMotion]);

  const shown =
    decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
