import React, { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { OFFERS } from '../../data/birthdayOffers';
import './SpinWheel.css';

const SIZE = 320;
const C = SIZE / 2; // center
const R = 150;      // radius

/* angle measured from the top (12 o'clock), increasing clockwise */
const polar = (cx, cy, r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
};

function buildSegments(offers) {
  const total = offers.reduce((s, o) => s + o.weight, 0);
  let start = 0;
  return offers.map((o) => {
    const angle = (o.weight / total) * 360;
    const end = start + angle;
    const seg = { ...o, start, end, mid: start + angle / 2, angle };
    start = end;
    return seg;
  });
}

function arcPath(start, end) {
  const p1 = polar(C, C, R, start);
  const p2 = polar(C, C, R, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${C} ${C} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
}

export default function SpinWheel({ onResult, disabled = false }) {
  const reduce = useReducedMotion();
  const segments = useMemo(() => buildSegments(OFFERS), []);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const spinningRef = useRef(false);

  const resolve = (finalRotation) => {
    // Which slice sits under the fixed top pointer after rotating clockwise by R.
    const a = ((360 - (finalRotation % 360)) % 360 + 360) % 360;
    const winner =
      segments.find((s) => a >= s.start && a < s.end) || segments[segments.length - 1];
    spinningRef.current = false;
    setSpinning(false);
    onResult(winner);
  };

  const spin = () => {
    if (spinningRef.current || disabled) return;
    spinningRef.current = true;
    setSpinning(true);
    const next = rotation + 360 * 6 + Math.random() * 360;
    setRotation(next);
    if (reduce) resolve(next); // no animation → resolve immediately
  };

  return (
    <div className="nj-wheel-wrap">
      <div className="nj-wheel-stage">
        <div className="nj-wheel-glow" aria-hidden="true" />
        <div className="nj-wheel-pointer" aria-hidden="true" />

        <motion.div
          className="nj-wheel-spinner"
          animate={{ rotate: rotation }}
          transition={reduce ? { duration: 0 } : { duration: 4.2, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => {
            if (spinningRef.current && !reduce) resolve(rotation);
          }}
        >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="nj-wheel-svg">
          <circle cx={C} cy={C} r={R + 5} className="nj-wheel-rim" />
          {segments.map((s) => (
            <path key={s.id} d={arcPath(s.start, s.end)} fill={s.color} stroke="#FAF9F6" strokeWidth="2.5" />
          ))}
          {segments.map((s) => {
            const flip = s.mid > 90 && s.mid < 270;
            const ry = C - R * 0.62;
            return (
              <g key={`${s.id}-label`} transform={`rotate(${s.mid} ${C} ${C})`}>
                <text
                  x={C}
                  y={ry}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${flip ? 90 : -90} ${C} ${ry})`}
                  className={`nj-wheel-label${s.angle < 26 ? ' is-narrow' : ''}`}
                  fill={s.textColor}
                >
                  {s.wheelLabel || s.label}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r="34" className="nj-wheel-hubring" />
        </svg>
      </motion.div>

      <button
        type="button"
        className={`nj-wheel-hub${spinning ? ' is-spinning' : ''}`}
        onClick={spin}
        disabled={spinning || disabled}
        aria-label="Spin the wheel"
      >
        {spinning ? '…' : 'SPIN'}
      </button>
      </div>

      <button
        type="button"
        className="nj-wheel-cta"
        onClick={spin}
        disabled={spinning || disabled}
      >
        {spinning ? 'Spinning…' : disabled ? 'Already spun' : 'SPIN THE WHEEL 🎡'}
      </button>
    </div>
  );
}
