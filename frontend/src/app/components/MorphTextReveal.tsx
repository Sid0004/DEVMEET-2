'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './MorphTextReveal.module.css';

interface MorphTextRevealProps {
  text?: string;
}

export default function MorphTextReveal({ text = 'COLLABORATE' }: MorphTextRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<'morph' | 'done'>('morph');
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer to trigger animation when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // ── Blob definitions ────────────────────────────────────────────────────
    const blobs = [
      { cx: W * 0.22, cy: H * 0.5,  rx: 90,  ry: 70,  rot: 0,   color: '#0051d5' },
      { cx: W * 0.5,  cy: H * 0.42, rx: 110, ry: 80,  rot: 0.5, color: '#4d54ff' },
      { cx: W * 0.78, cy: H * 0.55, rx: 95,  ry: 65,  rot: 1.2, color: '#0091ff' },
      { cx: W * 0.38, cy: H * 0.58, rx: 70,  ry: 55,  rot: 2,   color: '#5b00d5' },
      { cx: W * 0.62, cy: H * 0.45, rx: 80,  ry: 60,  rot: 0.8, color: '#0051d5' },
    ];

    // ── Font and letter-target positions ──────────────────────────────────
    const fontSize = Math.round(H * 0.55);
    ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textWidth = ctx.measureText(text).width;
    const letterSpacing = textWidth / text.length;

    const letterTargets = Array.from(text).map((_, i) => ({
      cx: W / 2 - textWidth / 2 + letterSpacing * i + letterSpacing / 2,
      cy: H / 2,
    }));

    // ── Helpers ──────────────────────────────────────────────────────────
    const TOTAL_MS = 2800;

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function drawBlob(
      cx: number, cy: number,
      rx: number, ry: number,
      rot: number, t: number,
      color: string, alpha: number
    ) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(rot + t * 1.5);
      const wobble = 1 + 0.18 * Math.sin(t * 4 + cx);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * wobble, ry / wobble, 0, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0, color + 'ff');
      grad.addColorStop(0.6, color + 'cc');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    function drawGradientText() {
      const grd = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
      grd.addColorStop(0, '#0051d5');
      grd.addColorStop(0.4, '#5b00d5');
      grd.addColorStop(0.7, '#0091ff');
      grd.addColorStop(1, '#0051d5');
      ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = grd;
      ctx.fillText(text, W / 2, H / 2);
    }

    // ── Animation loop ────────────────────────────────────────────────────
    function render(ts: number) {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const rawT = Math.min(elapsed / TOTAL_MS, 1);
      const t = easeInOutCubic(rawT);

      ctx.clearRect(0, 0, W, H);

      if (elapsed < TOTAL_MS) {
        // Morph blobs toward letter targets
        blobs.forEach((blob, i) => {
          const target = letterTargets[i % letterTargets.length];
          drawBlob(
            lerp(blob.cx, target.cx, t),
            lerp(blob.cy, target.cy, t),
            lerp(blob.rx, letterSpacing * 0.38, t),
            lerp(blob.ry, H * 0.28, t),
            blob.rot, rawT, blob.color,
            lerp(1, 0.85, t)
          );
        });

        // Scatter micro-blobs drifting inward
        for (let b = 0; b < 6; b++) {
          const angle = (b / 6) * Math.PI * 2 + rawT * 2;
          const r = lerp(W * 0.3 * (1 - t), 0, t * 0.8);
          const bx = W / 2 + Math.cos(angle) * r;
          const by = H / 2 + Math.sin(angle) * r * 0.5;
          const col = b % 2 === 0 ? '#0051d5' : '#5b00d5';
          drawBlob(bx, by, 28 * (1 - t * 0.7), 22 * (1 - t * 0.7), angle, rawT, col, (1 - t) * 0.6);
        }

        // Cross-fade text in at the tail of the morph
        if (rawT > 0.75) {
          const dissolveT = (rawT - 0.75) / 0.25;
          ctx.save();
          ctx.globalAlpha = dissolveT * dissolveT;
          drawGradientText();
          ctx.restore();
        }

        animFrameRef.current = requestAnimationFrame(render);
      } else {
        // Final static gradient text
        ctx.clearRect(0, 0, W, H);
        drawGradientText();
        setPhase('done');
      }
    }

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isVisible, text]);

  return (
    <section ref={containerRef} className={styles.morphSection}>
      <div className={styles.morphKicker}>
        <span className="font-tech uppercase">Where Ideas Converge</span>
      </div>
      <div className={styles.canvasWrapper}>
        {/* Hidden SVG filters — goo gives liquid blob effect */}
        <svg className={styles.svgFilter} aria-hidden="true">
          <defs>
            <filter id="goo-filter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
                result="goo"
              />
            </filter>
          </defs>
        </svg>

        <canvas
          ref={canvasRef}
          width={1100}
          height={220}
          className={styles.morphCanvas}
          style={{
            filter: phase !== 'done' ? 'url(#goo-filter)' : 'none',
            transition: 'filter 0.5s ease',
          }}
        />

        {/* Shimmer sweep overlay once animation completes */}
        {phase === 'done' && (
          <div className={styles.shimmerOverlay} aria-hidden="true" />
        )}
      </div>

      <p className={`${styles.morphSubtext} font-body`}>
        50,000+ developers. One platform. Infinite possibilities.
      </p>
    </section>
  );
}
