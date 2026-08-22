"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const POLISHED_METAL_MATCAP = '/assets/matcap_metal.png';

const PERSPECTIVE = 0.15;
const AXES = ['y', 'x', 'z'];

const RING_ORIENTATION = {
  y: [0, 0, 0],
  x: [Math.PI / 2, 0, 0],
  z: [0, Math.PI / 2, 0],
};

const PX_PER_UNIT = 100;

const DEFAULTS = {
  rings: 4,
  finish: 'metal',
  tint: '#1877F2',
  color: '#1877F2',
  thickness: 5,
  innerRadius: 40,
  gap: 0,
  spin: 2.2,
  hoverBoost: 10,
  dragSensitivity: 3,
  sizePercent: 104,
};

function clamp(v, lo, hi, fallback) {
  const n = typeof v === 'number' && isFinite(v) ? v : fallback;
  return Math.max(lo, Math.min(hi, n));
}

function ringRadii(cfg) {
  const count = clamp(cfg.rings, 1, 6, 4);
  const inner = clamp(cfg.innerRadius, 20, 200, 40) / PX_PER_UNIT;
  const gap = clamp(cfg.gap, 0, 50, 20) / PX_PER_UNIT;
  const tube = (clamp(cfg.thickness, 1, 20, 5) / 100) * 0.6;
  const radii = [];
  for (let k = count - 1; k >= 0; k--) {
    radii.push(inner + k * (gap + tube * 2));
  }
  return radii;
}

function framingRadius(cfg) {
  const count = clamp(cfg.rings, 1, 6, 4);
  const inner = clamp(cfg.innerRadius, 20, 200, 40) / PX_PER_UNIT;
  const tube = (clamp(cfg.thickness, 1, 20, 5) / 100) * 0.6;
  return inner + (count - 1) * tube * 2 + tube;
}

let matcapTexture = null;
let matcapPending = null;

function loadMatcap() {
  if (matcapTexture) return Promise.resolve(matcapTexture);
  if (matcapPending) return matcapPending;
  matcapPending = new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      POLISHED_METAL_MATCAP,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        matcapTexture = texture;
        resolve(texture);
      },
      undefined,
      () => resolve(null)
    );
  });
  return matcapPending;
}

class GyroScene {
  constructor(container, cfg) {
    this.container = container;
    this.cfg = cfg;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 2000);
    this.root = new THREE.Group();

    this.ringList = [];
    this.ambient = new THREE.AmbientLight(0xffffff, 1.2);
    this.key = new THREE.DirectionalLight(0xffffff, 2.0);
    this.key.position.set(2, 4, 3);
    this.fill = new THREE.DirectionalLight(0x60a5fa, 1.2);
    this.fill.position.set(-3, -2, 2);
    this.rim = new THREE.PointLight(0xffffff, 1.8, 100);
    this.rim.position.set(0, 0, 4);

    this.ax = 0.5;
    this.ay = 0.4;
    this.vx = 0;
    this.vy = 0;
    this.isDragging = false;
    this.hovered = false;
    this.lastX = 0;
    this.lastY = 0;
    this.boost = 0;

    this.width = 0;
    this.height = 0;
    this.frameId = 0;
    this.lastT = 0;
    this.disposed = false;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    const el = this.renderer.domElement;
    el.style.position = 'absolute';
    el.style.inset = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.cursor = 'grab';
    el.style.touchAction = 'none';
    container.appendChild(el);

    // Initial instant-render metallic standard material (zero latency)
    this.matcapMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.tint || '#d8d8d8'),
      metalness: 0.88,
      roughness: 0.22,
    });
    this.solidMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(cfg.color || '#1877F2'),
    });
    
    this.camera.add(this.key);
    this.scene.add(this.ambient, this.camera, this.fill, this.rim, this.root);

    this.build();
    this.bindEvents();
    if (cfg.finish === 'metal') this.ensureMatcap();
  }

  ensureMatcap() {
    loadMatcap().then((t) => {
      if (this.disposed || !t) return;
      this.matcapMaterial = new THREE.MeshMatcapMaterial({
        color: new THREE.Color(this.cfg.tint || '#ffffff'),
        matcap: t,
      });
      if (this.cfg.finish === 'metal') {
        for (const r of this.ringList) r.mesh.material = this.matcapMaterial;
      }
      this.step();
    });
  }

  material() {
    return this.cfg.finish === 'metal' ? this.matcapMaterial : this.solidMaterial;
  }

  build() {
    this.clear();
    const tube = (clamp(this.cfg.thickness, 1, 20, 5) / 100) * 0.6;
    const radii = ringRadii(this.cfg);
    const material = this.material();

    let parent = this.root;
    for (let i = 0; i < radii.length; i++) {
      const radius = radii[i];
      const axis = AXES[i % AXES.length];
      const geometry = new THREE.TorusGeometry(radius, tube, 16, 120);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(...RING_ORIENTATION[axis]);

      const pivot = new THREE.Group();
      pivot.add(mesh);
      parent.add(pivot);
      parent = pivot;

      this.ringList.push({
        pivot,
        mesh,
        axis,
        rate: (i + 1) * (i % 2 ? -1 : 1),
      });
    }
  }

  clear() {
    for (const r of this.ringList) {
      r.mesh.geometry.dispose();
      r.pivot.removeFromParent();
    }
    this.ringList = [];
    this.root.clear();
  }

  bindEvents() {
    const el = this.renderer.domElement;
    const down = (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.vx = 0;
      this.vy = 0;
      el.style.cursor = 'grabbing';
    };
    const move = (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      const s = clamp(this.cfg.dragSensitivity, 0, 10, 3) * 0.007;
      this.ay += dx * s;
      this.ax += dy * s;
      this.vy = dx * s;
      this.vx = dy * s;
    };
    const up = () => {
      this.isDragging = false;
      el.style.cursor = 'grab';
    };
    const enter = () => {
      this.hovered = true;
    };
    const leave = () => {
      this.hovered = false;
      up();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    this.unbind = () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }

  start() {
    if (this.disposed) return;
    this.lastT = performance.now();
    // Render an immediate frame so canvas is instantly visible without waiting for rAF
    this.step();
    if (this.frameId) return;
    const loop = () => {
      if (this.disposed) return;
      this.step();
      this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  }

  setSize(width, height) {
    if (this.disposed) return;
    const w = width > 0 ? width : (this.container?.clientWidth || this.container?.offsetWidth || 400);
    const h = height > 0 ? height : (this.container?.clientHeight || this.container?.offsetHeight || 500);
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.updateCamera();
    this.step();
  }

  updateConfig(cfg) {
    if (this.disposed) return;
    const prev = this.cfg;
    this.cfg = cfg;
    if (cfg.finish === 'metal') this.ensureMatcap();
    this.matcapMaterial.color.set(cfg.tint || '#ffffff');
    this.solidMaterial.color.set(cfg.color || '#ffffff');

    if (
      cfg.rings !== prev.rings ||
      cfg.thickness !== prev.thickness ||
      cfg.innerRadius !== prev.innerRadius ||
      cfg.gap !== prev.gap
    ) {
      this.build();
    } else if (cfg.finish !== prev.finish) {
      const material = this.material();
      for (const r of this.ringList) r.mesh.material = material;
    }
    this.updateCamera();
    this.step();
  }

  updateCamera() {
    const w = Math.max(1, this.width || 400);
    const h = Math.max(1, this.height || 500);
    const aspect = w / h;
    const distance = 1 / PERSPECTIVE;
    const sizePct = clamp(this.cfg.sizePercent, 20, 200, 90);
    const span = framingRadius(this.cfg) * 2.9 * (100 / sizePct);
    const visibleHeight = aspect < 1 ? span / aspect : span;

    this.camera.aspect = aspect;
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 2 * Math.atan(visibleHeight / 2 / distance) * (180 / Math.PI);
    this.camera.near = Math.max(0.1, distance - 20);
    this.camera.far = distance + 20;
    this.camera.updateProjectionMatrix();
  }

  step() {
    if (this.disposed) return;
    const now = performance.now();
    let dt = this.lastT > 0 ? (now - this.lastT) / 1000 : 0.016;
    this.lastT = now;
    if (!isFinite(dt) || dt < 0) dt = 0.016;
    if (dt > 0.05) dt = 0.05;

    if (!this.isDragging) {
      const decay = Math.exp(-dt * 2.6);
      this.ay += this.vy;
      this.ax += this.vx;
      this.vx *= decay;
      this.vy *= decay;
    }
    this.root.rotation.x = this.ax;
    this.root.rotation.y = this.ay;

    const want = this.hovered ? clamp(this.cfg.hoverBoost, 0, 10, 5) / 5 : 0;
    this.boost += (want - this.boost) * (1 - Math.exp(-dt * 4));

    const base = clamp(this.cfg.spin, 1, 20, 6) * 0.09 * (1 + this.boost);
    for (const r of this.ringList) {
      r.pivot.rotation[r.axis] += base * r.rate * dt;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    if (typeof this.unbind === 'function') {
      this.unbind();
    }
    this.clear();
    this.matcapMaterial.dispose();
    this.solidMaterial.dispose();
    this.renderer.dispose();
    const el = this.renderer.domElement;
    if (el && el.parentNode === this.container) {
      this.container.removeChild(el);
    }
  }
}

export default function GyroRings(props) {
  const {
    rings = DEFAULTS.rings,
    finish = DEFAULTS.finish,
    tint = '#D8D8D8',
    color = '#1877F2',
    thickness = DEFAULTS.thickness,
    innerRadius = DEFAULTS.innerRadius,
    gap = DEFAULTS.gap,
    spin = DEFAULTS.spin,
    hoverBoost = DEFAULTS.hoverBoost,
    dragSensitivity = DEFAULTS.dragSensitivity,
    sizePercent = DEFAULTS.sizePercent,
    style,
  } = props;

  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  const cfg = {
    rings,
    finish,
    tint,
    color,
    thickness,
    innerRadius,
    gap,
    spin,
    hoverBoost,
    dragSensitivity,
    sizePercent,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scene;
    try {
      scene = new GyroScene(container, cfg);
    } catch (e) {
      console.error('Failed to init GyroScene', e);
      return;
    }
    sceneRef.current = scene;
    const initialWidth = container.clientWidth || container.offsetWidth || 400;
    const initialHeight = container.clientHeight || container.offsetHeight || 500;
    scene.setSize(initialWidth, initialHeight);
    scene.start();

    const updateSize = () => {
      if (container && sceneRef.current) {
        sceneRef.current.setSize(
          container.clientWidth || container.offsetWidth,
          container.clientHeight || container.offsetHeight
        );
      }
    };

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(container);

    const rafInit = requestAnimationFrame(updateSize);
    const timerInit = setTimeout(updateSize, 80);

    const handleResume = () => {
      if (!document.hidden && sceneRef.current) {
        updateSize();
        sceneRef.current.start();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        sceneRef.current?.stop();
      } else {
        handleResume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handleResume);
    window.addEventListener('popstate', handleResume);
    window.addEventListener('focus', handleResume);
    window.addEventListener('touchstart', handleResume, { passive: true });
    window.addEventListener('pointermove', handleResume, { passive: true });
    window.addEventListener('wheel', handleResume, { passive: true });

    return () => {
      cancelAnimationFrame(rafInit);
      clearTimeout(timerInit);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handleResume);
      window.removeEventListener('popstate', handleResume);
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('touchstart', handleResume);
      window.removeEventListener('pointermove', handleResume);
      window.removeEventListener('wheel', handleResume);
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateConfig(cfg);
  }, [
    rings,
    finish,
    tint,
    color,
    thickness,
    innerRadius,
    gap,
    spin,
    hoverBoost,
    dragSensitivity,
    sizePercent,
  ]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Gyroscope 3D interactive rings"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: 200,
        minHeight: 300,
        overflow: 'hidden',
        ...style,
      }}
    />
  );
}
