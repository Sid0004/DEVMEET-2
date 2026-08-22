"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const POLISHED_METAL_MATCAP = 'https://framerusercontent.com/images/Wkm2ineJ1Md7Xb1oyjF6dqbAw.png';

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
  tint: '#1877F2', // Default to brand color or metallic silver #D8D8D8
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
    this.ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.key = new THREE.DirectionalLight(0xffffff, 0.9);

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

    this.matcapMaterial = new THREE.MeshMatcapMaterial({
      color: new THREE.Color(cfg.tint || '#ffffff'),
    });
    this.solidMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(cfg.color || '#ffffff'),
    });
    this.key.position.set(0.4, 0.7, 1);
    this.camera.add(this.key);
    this.scene.add(this.ambient, this.camera, this.root);

    this.build();
    this.bindEvents();
    if (cfg.finish === 'metal') this.ensureMatcap();
  }

  ensureMatcap() {
    if (this.matcapMaterial.matcap) return;
    loadMatcap().then((t) => {
      if (this.disposed || !t) return;
      this.matcapMaterial.matcap = t;
      this.matcapMaterial.needsUpdate = true;
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

  unbind = () => {};

  start() {
    this.lastT = performance.now();
    const loop = () => {
      this.frameId = requestAnimationFrame(loop);
      this.step();
    };
    loop();
  }

  setSize(width, height) {
    if (this.disposed || width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.updateCamera();
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
  }

  updateCamera() {
    const w = Math.max(1, this.width);
    const h = Math.max(1, this.height);
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
    let dt = (now - this.lastT) / 1000;
    this.lastT = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
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
    cancelAnimationFrame(this.frameId);
    this.unbind();
    this.clear();
    this.matcapMaterial.dispose();
    this.solidMaterial.dispose();
    this.renderer.dispose();
    const el = this.renderer.domElement;
    if (el.parentNode === this.container) this.container.removeChild(el);
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

  const cfgRef = useRef({});
  cfgRef.current = {
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
      scene = new GyroScene(container, cfgRef.current);
    } catch (e) {
      console.error('Failed to init GyroScene', e);
      return;
    }
    sceneRef.current = scene;
    scene.setSize(container.clientWidth, container.clientHeight);
    scene.start();

    const ro = new ResizeObserver(() => {
      if (container) {
        scene.setSize(container.clientWidth, container.clientHeight);
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateConfig(cfgRef.current);
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
