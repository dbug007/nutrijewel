import React, { useEffect, useRef } from 'react';

/* Self-contained canvas confetti — no external library.
   Fire a burst by changing `fireKey` to a new value (e.g. increment a counter).
   Respects prefers-reduced-motion (renders an inert canvas, no animation). */

const COLORS = ['#93B559', '#6D8A3C', '#D1E8A7', '#DCC99C', '#F4D58D', '#FAF9F6', '#E8743B', '#E5499B'];

export default function Confetti({ fireKey = 0 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fireKey) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined; // canvas unavailable (blocked, or a non-browser env)
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = window.innerWidth;
    const H = window.innerHeight;
    const particles = [];
    const count = 180;

    for (let i = 0; i < count; i++) {
      const fromCenter = i % 3 === 0;
      const leftSide = i % 2 === 0;
      particles.push({
        x: fromCenter ? W / 2 : leftSide ? W * 0.1 : W * 0.9,
        y: fromCenter ? H * 0.18 : H * 0.95,
        vx: fromCenter ? (Math.random() - 0.5) * 9 : (leftSide ? 1 : -1) * (Math.random() * 9 + 4),
        vy: fromCenter ? Math.random() * 3 + 2 : -(Math.random() * 15 + 9),
        size: Math.random() * 8 + 5,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.35,
        life: 0,
        ttl: Math.random() * 70 + 100,
        shape: Math.random() > 0.5 ? 'rect' : 'circ',
      });
    }

    const gravity = 0.22;
    const drag = 0.992;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of particles) {
        p.life += 1;
        if (p.life > p.ttl) continue;
        alive += 1;
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        const fade = Math.max(0, 1 - p.life / p.ttl);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive > 0 && elapsed < 4500) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [fireKey]);

  return <canvas ref={canvasRef} className="nj-confetti-canvas" aria-hidden="true" />;
}
