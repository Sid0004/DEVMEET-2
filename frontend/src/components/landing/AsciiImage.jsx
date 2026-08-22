"use client";

import React, { useEffect, useRef } from 'react';

const DEFAULT_IMAGE = '/originkit/features-04/focus.png';

const DEFAULTS = {
  fit: 'cover',
  focusY: 19,
  columns: 200,
  ramp: ' .:-=+*#%@',
  invert: false,
  contrast: 100,
  colorMode: 'mono',
  inkColor: '#333333',
  reveal: true,
  revealOptions: { size: 80, softness: 16 }
};

const contrastAt = (value) => 0.5 + (value / 100) * 2;

const clampFocus = (value) =>
  Math.min(100, Math.max(0, typeof value === 'number' ? value : 50));

function placeRect(imgW, imgH, boxW, boxH, fit, focusY) {
  const scale =
    fit === 'contain'
      ? Math.min(boxW / imgW, boxH / imgH)
      : Math.max(boxW / imgW, boxH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const f = fit === 'cover' ? clampFocus(focusY) / 100 : 0.5;
  return { dx: (boxW - dw) / 2, dy: (boxH - dh) * f, dw, dh };
}

function resolveImageSrc(image) {
  if (!image) return undefined;
  if (typeof image === 'string') return image.trim() || undefined;
  return image.src || undefined;
}

export default function AsciiImage(props) {
  const {
    image,
    fit = DEFAULTS.fit,
    focusY = DEFAULTS.focusY,
    columns = DEFAULTS.columns,
    ramp = DEFAULTS.ramp,
    invert = DEFAULTS.invert,
    contrast = DEFAULTS.contrast,
    colorMode = DEFAULTS.colorMode,
    inkColor = DEFAULTS.inkColor,
    reveal = DEFAULTS.reveal,
    revealOptions = DEFAULTS.revealOptions,
    style
  } = props;

  const canvasRef = useRef(null);
  const offRef = useRef(null);
  const samplerRef = useRef(null);
  const imgRef = useRef(null);
  const revealRef = useRef(null);
  const maskRef = useRef(null);
  const blobsRef = useRef([]);
  const seededRef = useRef(false);
  const pointer = useRef({ x: -9999, y: -9999, inside: false });

  const src = resolveImageSrc(image) || DEFAULT_IMAGE;
  const revealSize = revealOptions?.size ?? DEFAULTS.revealOptions.size;
  const revealSoftness = revealOptions?.softness ?? DEFAULTS.revealOptions.softness;

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext('2d');
    if (!context) return;
    const canvas = canvasEl;
    const ctx = context;

    const chars = ramp && ramp.length > 0 ? ramp : DEFAULTS.ramp;
    const punch = contrastAt(contrast);

    let raf = 0;
    let alive = true;
    let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

    const BLOB_COUNT = 5;
    blobsRef.current = Array.from({ length: BLOB_COUNT }, () => ({
      x: 0,
      y: 0
    }));
    seededRef.current = false;

    function getSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 300;
      return { w, h, dpr };
    }

    function buildAscii() {
      const img = imgRef.current;
      if (!img) return;
      const { w, h, dpr } = getSize();
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));

      const cols = Math.max(8, Math.round(columns));
      const cellW = (w * dpr) / cols;
      const fontPx = cellW * 1.7;
      const cellH = fontPx;
      const rows = Math.max(1, Math.floor((h * dpr) / cellH));

      let sampler = samplerRef.current;
      if (!sampler) {
        sampler = document.createElement('canvas');
        samplerRef.current = sampler;
      }
      sampler.width = cols;
      sampler.height = rows;
      const sctx = sampler.getContext('2d', { willReadFrequently: true });
      if (!sctx) return;

      const place = placeRect(
        img.width,
        img.height,
        canvas.width,
        canvas.height,
        fit,
        focusY
      );
      sctx.clearRect(0, 0, cols, rows);
      sctx.drawImage(
        img,
        place.dx / cellW,
        place.dy / cellH,
        place.dw / cellW,
        place.dh / cellH
      );

      let data;
      try {
        data = sctx.getImageData(0, 0, cols, rows).data;
      } catch (e) {
        imgRef.current = null;
        return;
      }

      let off = offRef.current;
      if (!off) {
        off = document.createElement('canvas');
        offRef.current = off;
      }
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext('2d');
      if (!octx) return;
      octx.clearRect(0, 0, off.width, off.height);
      octx.font = `${fontPx.toFixed(2)}px ui-monospace, monospace`;
      octx.textBaseline = 'top';

      const last = chars.length - 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const rr = data[i];
          const gg = data[i + 1];
          const bb = data[i + 2];
          let lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
          lum = (lum - 0.5) * punch + 0.5;
          if (invert) lum = 1 - lum;
          lum = lum < 0 ? 0 : lum > 1 ? 1 : lum;
          const ch = chars[Math.round(lum * last)];
          if (ch === ' ') continue;
          octx.fillStyle =
            colorMode === 'image'
              ? `rgb(${Math.min(255, rr + 30)}, ${Math.min(255, gg + 30)}, ${Math.min(255, bb + 30)})`
              : inkColor;
          octx.fillText(ch, c * cellW, r * cellH);
        }
      }

      coverRect = place;
    }

    function ensureLayer(ref) {
      let layer = ref.current;
      if (!layer) {
        layer = document.createElement('canvas');
        ref.current = layer;
      }
      if (layer.width !== canvas.width || layer.height !== canvas.height) {
        layer.width = canvas.width;
        layer.height = canvas.height;
      }
      return layer;
    }

    function updateBlobs() {
      const blobs = blobsRef.current;
      if (blobs.length === 0) return;
      const { dpr } = getSize();
      const tx = pointer.current.x * dpr;
      const ty = pointer.current.y * dpr;
      if (!seededRef.current) {
        for (const blob of blobs) {
          blob.x = tx;
          blob.y = ty;
        }
        seededRef.current = true;
        return;
      }
      blobs[0].x += (tx - blobs[0].x) * 0.35;
      blobs[0].y += (ty - blobs[0].y) * 0.35;
      for (let i = 1; i < blobs.length; i++) {
        blobs[i].x += (blobs[i - 1].x - blobs[i].x) * 0.35;
        blobs[i].y += (blobs[i - 1].y - blobs[i].y) * 0.35;
      }
    }

    function paint() {
      const off = offRef.current;
      if (!off) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0);

      const img = imgRef.current;
      if (!reveal || !pointer.current.inside || !img) return;

      const { dpr } = getSize();
      const blobs = blobsRef.current;
      const photo = ensureLayer(revealRef);
      const pctx = photo.getContext('2d');
      const mask = ensureLayer(maskRef);
      const mctx = mask.getContext('2d');
      if (!pctx || !mctx) return;

      pctx.globalCompositeOperation = 'source-over';
      pctx.clearRect(0, 0, photo.width, photo.height);
      pctx.drawImage(
        img,
        coverRect.dx,
        coverRect.dy,
        coverRect.dw,
        coverRect.dh
      );

      mctx.clearRect(0, 0, mask.width, mask.height);
      mctx.save();
      mctx.filter = `blur(${(revealSoftness * dpr).toFixed(1)}px)`;
      mctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < blobs.length; i++) {
        const t = blobs.length <= 1 ? 0 : i / (blobs.length - 1);
        const radius = revealSize * dpr * (1 - t * 0.5);
        mctx.beginPath();
        mctx.arc(blobs[i].x, blobs[i].y, radius, 0, Math.PI * 2);
        mctx.fill();
      }
      mctx.restore();

      pctx.globalCompositeOperation = 'destination-in';
      pctx.drawImage(mask, 0, 0);
      pctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(photo, 0, 0);
    }

    let isIntersecting = true;
    let isLooping = false;

    function startLoop() {
      if (isLooping || !alive || !isIntersecting || document.hidden || !reveal) return;
      isLooping = true;
      raf = requestAnimationFrame(loop);
    }

    function stopLoop() {
      isLooping = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function loop() {
      if (!alive || !isLooping) return;
      updateBlobs();
      paint();
      if (pointer.current.inside) {
        raf = requestAnimationFrame(loop);
      } else {
        stopLoop();
        paint(); // Final clean static render
      }
    }

    function onMove(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.current.x = x;
      pointer.current.y = y;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.current.inside = inside;
      if (inside && reveal) {
        startLoop();
      }
    }

    function onLeave() {
      pointer.current.inside = false;
      seededRef.current = false;
      paint();
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!alive) return;
      imgRef.current = img;
      buildAscii();
      paint();
    };
    if (src) img.src = src;

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (!alive) return;
        buildAscii();
        paint();
      });
      ro.observe(canvas);
    }

    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting && pointer.current.inside) {
        startLoop();
      } else {
        stopLoop();
      }
    }, { threshold: 0.05 });
    io.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        paint();
        if (isIntersecting && pointer.current.inside) {
          startLoop();
        }
      }
    };

    const handlePageShow = () => {
      buildAscii();
      paint();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePageShow);

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    return () => {
      alive = false;
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePageShow);
      io.disconnect();
      ro?.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [
    src,
    fit,
    focusY,
    columns,
    ramp,
    invert,
    contrast,
    colorMode,
    inkColor,
    reveal,
    revealSize,
    revealSoftness
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        ...style,
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: reveal ? 'crosshair' : 'default'
      }}
    />
  );
}
