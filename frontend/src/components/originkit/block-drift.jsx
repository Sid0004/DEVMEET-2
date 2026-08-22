"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Block Drift — sheets of cubes sliding past the camera, front or back.
 */

const DEFAULTS = {
    near: "#929292",
    far: "#0a0a0a",
    edge: "#242424",
    grid: 9,
    blockSize: 10,
    gap: 20,
    layers: 15,
    density: 11,
    cluster: 1,
    edgeWidth: 1,
    fade: 1.4,
    shade: 18,
    clearCentre: 3,
    speed: 12,
    direction: "front",
    driftText: "",
    driftTextColor: "#ffffff",
    driftFont: '600 112px "Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    driftLetterSpacing: '20px',
};

const MAX_GRID = 41;

function clamp(v, lo, hi, fallback) {
    const n = typeof v === "number" && isFinite(v) ? v : fallback;
    return Math.max(lo, Math.min(hi, n));
}

function settingsFor(cfg) {
    const grid = Math.round(clamp(cfg.grid, 3, 31, DEFAULTS.grid));
    const block = 0.12 + clamp(cfg.blockSize, 1, 20, DEFAULTS.blockSize) * 0.05;
    return {
        grid: grid % 2 === 0 ? grid + 1 : grid,
        layers: Math.round(clamp(cfg.layers, 5, 15, DEFAULTS.layers)),
        block,
        spacing: block,
        gap: 0.4 + clamp(cfg.gap, 1, 20, DEFAULTS.gap) * 0.11,
        density: clamp(cfg.density, 1, 20, DEFAULTS.density) / 20,
        cluster: 1.4 - clamp(cfg.cluster, 1, 20, DEFAULTS.cluster) * 0.055,
        edgeWidth: clamp(cfg.edgeWidth, 0, 20, DEFAULTS.edgeWidth) * 0.011,
        fade: clamp(cfg.fade, 1, 20, DEFAULTS.fade) * 0.011,
        shade: clamp(cfg.shade, 0, 20, DEFAULTS.shade) * 0.03,
        speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.09,
        heading: cfg.direction === "back" ? -1 : 1,
        clearCentre: Math.round(clamp(cfg.clearCentre, 0, 5, DEFAULTS.clearCentre)),
    };
}

function buildBlocks(grid, layers) {
    const cells = grid * grid;
    const count = cells * layers;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cell = new Float32Array(count);
    const layer = new Float32Array(count);

    let i = 0;
    for (let l = 0; l < layers; l++) {
        for (let c = 0; c < cells; c++) {
            cell[i] = c;
            layer[i] = l;
            i++;
        }
    }

    geometry.setAttribute("aCell", new THREE.InstancedBufferAttribute(cell, 1));
    geometry.setAttribute("aLayer", new THREE.InstancedBufferAttribute(layer, 1));
    return geometry;
}

const BLOCK_VERTEX = /* glsl */ `
    attribute float aCell;
    attribute float aLayer;

    uniform float uTime;
    uniform float uGrid;
    uniform float uBlock;
    uniform float uSpacing;
    uniform float uGap;
    uniform float uDensity;
    uniform float uCluster;
    uniform float uClearCentre;
    uniform float uHeading;
    uniform float uLayers;

    varying float vDepth;
    varying vec3 vNormal;
    varying float vAlive;
    varying vec2 vFace;

    float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.56);
        return fract(p.x * p.y * 95.43);
    }

    float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
        );
    }

    void main() {
        float cx = mod(aCell, uGrid);
        float cy = floor(aCell / uGrid);
        float mid = (uGrid - 1.0) * 0.5;
        vec2 cell = vec2(cx, cy) - mid;
        vec2 xy = cell * uSpacing;

        float beat = floor(uTime);
        float f = fract(uTime);
        float slide = uHeading > 0.0 ? f : 1.0 - f;
        float depth = aLayer + 1.0 - slide;

        float seed = beat * uHeading + aLayer;
        float n = vnoise(vec2(cx, cy) * uCluster + seed * 19.3);
        float alive = step(n, uDensity);

        float ring = max(abs(cell.x), abs(cell.y));
        alive *= step(uClearCentre + 0.5, ring);

        float dn = depth / max(1.0, uLayers);
        float grow = smoothstep(1.0, 0.84, dn);

        vec3 p = position * uBlock * alive * grow;
        p.xy += xy;
        p.z += uGap - depth * uGap;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vDepth = clamp(dn, 0.0, 1.0);
        vAlive = alive;
        vFace = uv;
        gl_Position = projectionMatrix * mv;
    }
`;

const BLOCK_FRAGMENT = /* glsl */ `
    uniform vec3 uNear;
    uniform vec3 uFar;
    uniform vec3 uEdge;
    uniform float uFade;
    uniform float uShade;
    uniform float uEdgeWidth;

    varying float vDepth;
    varying vec3 vNormal;
    varying float vAlive;
    varying vec2 vFace;

    void main() {
        if (vAlive < 0.5) discard;

        vec3 col = mix(uNear, uFar, pow(vDepth, 1.0 - uFade * 6.0 + 0.8));

        vec3 n = normalize(vNormal);
        float face = 0.5 + 0.5 * dot(n, normalize(vec3(-0.4, 0.55, 0.75)));
        col *= 1.0 - uShade + uShade * face * 1.5;

        if (uEdgeWidth > 0.0001) {
            float e = min(min(vFace.x, 1.0 - vFace.x), min(vFace.y, 1.0 - vFace.y));
            float aa = max(fwidth(e), 0.0001);
            float border = 1.0 - smoothstep(uEdgeWidth - aa, uEdgeWidth + aa, e);
            col = mix(col, uEdge, border * (1.0 - vDepth * 0.65));
        }

        gl_FragColor = vec4(max(col, 0.0), 1.0);
    }
`;

function createTextTexture(text, color = "#ffffff", font = DEFAULTS.driftFont, letterSpacing = DEFAULTS.driftLetterSpacing) {
    if (!text) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = letterSpacing;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

class BlockScene {
    constructor(container, cfg) {
        this.container = container;
        this.cfg = cfg;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, 1, 0.02, 400);

        this.gridUsed = 0;
        this.layersUsed = 0;
        this.time = 0;
        this.width = 0;
        this.height = 0;
        this.frameId = 0;
        this.lastT = 0;
        this.disposed = false;

        const S = settingsFor(cfg);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setClearColor(0x000000, 0);
        const el = this.renderer.domElement;
        el.style.position = "absolute";
        el.style.inset = "0";
        el.style.width = "100%";
        el.style.height = "100%";
        container.appendChild(el);

        this.material = new THREE.ShaderMaterial({
            vertexShader: BLOCK_VERTEX,
            fragmentShader: BLOCK_FRAGMENT,
            uniforms: {
                uTime: { value: 0 },
                uGrid: { value: S.grid },
                uBlock: { value: S.block },
                uSpacing: { value: S.spacing },
                uGap: { value: S.gap },
                uDensity: { value: S.density },
                uCluster: { value: S.cluster },
                uClearCentre: { value: S.clearCentre },
                uHeading: { value: S.heading },
                uLayers: { value: S.layers },
                uNear: { value: new THREE.Color(cfg.near) },
                uFar: { value: new THREE.Color(cfg.far) },
                uEdge: { value: new THREE.Color(cfg.edge) },
                uFade: { value: S.fade },
                uShade: { value: S.shade },
                uEdgeWidth: { value: S.edgeWidth },
            },
        });

        this.gridUsed = S.grid;
        this.layersUsed = S.layers;
        this.geometry = buildBlocks(S.grid, S.layers);
        this.mesh = this.makeMesh(S.grid * S.grid * S.layers);
        this.scene.add(this.mesh);

        this.textMesh = null;
        if (cfg.driftText) {
            const texture = createTextTexture(
                cfg.driftText,
                cfg.driftTextColor || "#ffffff",
                cfg.driftFont || DEFAULTS.driftFont,
                cfg.driftLetterSpacing || DEFAULTS.driftLetterSpacing
            );
            if (texture) {
                const planeGeo = new THREE.PlaneGeometry(4.0, 2.0);
                const planeMat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0,
                    depthWrite: false,
                });
                this.textMesh = new THREE.Mesh(planeGeo, planeMat);
                this.textMesh.position.set(0, 0, -9.0);
                this.scene.add(this.textMesh);
            }
        }
    }

    makeMesh(count) {
        const mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
        const identity = new THREE.Matrix4();
        for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
        mesh.instanceMatrix.needsUpdate = true;
        mesh.frustumCulled = false;
        return mesh;
    }

    start() {
        if (this.disposed) return;
        this.lastT = performance.now();
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
        this.cfg = cfg;
        const S = settingsFor(cfg);
        const u = this.material.uniforms;

        u.uGrid.value = S.grid;
        u.uBlock.value = S.block;
        u.uSpacing.value = S.spacing;
        u.uGap.value = S.gap;
        u.uDensity.value = S.density;
        u.uCluster.value = S.cluster;
        u.uClearCentre.value = S.clearCentre;
        u.uHeading.value = S.heading;
        u.uLayers.value = S.layers;
        u.uFade.value = S.fade;
        u.uShade.value = S.shade;
        u.uEdgeWidth.value = S.edgeWidth;
        u.uNear.value.set(cfg.near || "#929292");
        u.uFar.value.set(cfg.far || "#0a0a0a");
        u.uEdge.value.set(cfg.edge || "#242424");

        this.updateCamera();
        this.step();
    }

    resolveGrid(S, aspect, fov) {
        const tanV = Math.tan((fov * Math.PI) / 360);
        const reach = tanV * S.gap * 1.25 * Math.max(1, aspect);
        const cells = 2 * Math.ceil(reach / S.block) + 1;
        return Math.min(MAX_GRID, Math.max(S.grid, cells));
    }

    updateCamera() {
        const w = Math.max(1, this.width || 400);
        const h = Math.max(1, this.height || 500);
        const aspect = w / h;
        const S = settingsFor(this.cfg);
        const fov = aspect < 1 ? 78 : 62;

        const grid = this.resolveGrid(S, aspect, fov);
        if (grid !== this.gridUsed || S.layers !== this.layersUsed) {
            this.gridUsed = grid;
            this.layersUsed = S.layers;
            this.scene.remove(this.mesh);
            this.mesh.dispose();
            this.geometry.dispose();
            this.geometry = buildBlocks(grid, S.layers);
            this.mesh = this.makeMesh(grid * grid * S.layers);
            this.scene.add(this.mesh);
        }
        this.material.uniforms.uGrid.value = grid;

        this.camera.aspect = aspect;
        this.camera.fov = fov;
        this.camera.position.set(0, 0, 0);
        this.camera.lookAt(0, 0, -1);
        this.camera.near = 0.02;
        this.camera.far = S.gap * (S.layers + 2);
        this.camera.updateProjectionMatrix();
    }

    step() {
        if (this.disposed) return;
        const now = performance.now();
        let dt = this.lastT > 0 ? (now - this.lastT) / 1000 : 0.016;
        this.lastT = now;
        if (!isFinite(dt) || dt < 0) dt = 0.016;
        if (dt > 0.05) dt = 0.05;

        const S = settingsFor(this.cfg);
        this.time += dt * S.speed;
        this.material.uniforms.uTime.value = this.time;

        if (this.textMesh && this.textMesh.visible) {
            const advanceSpeed = Math.max(1.4, S.speed * 0.95);
            this.textMesh.position.z += dt * advanceSpeed;

            const z = this.textMesh.position.z;
            if (z < -3.5) {
                this.textMesh.material.opacity = Math.min(0.92, (z + 9.0) / 4.0);
            } else if (z >= -3.5 && z < -0.2) {
                this.textMesh.material.opacity = 0.92;
            } else if (z >= -0.2 && z <= 1.4) {
                this.textMesh.material.opacity = Math.max(0, (1.4 - z) / 1.6);
            } else {
                this.textMesh.visible = false;
                if (this.textMesh.material.map) this.textMesh.material.map.dispose();
                this.textMesh.material.dispose();
                this.textMesh.geometry.dispose();
                this.scene.remove(this.textMesh);
                this.textMesh = null;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.disposed = true;
        this.stop();
        if (this.textMesh) {
            if (this.textMesh.material.map) this.textMesh.material.map.dispose();
            this.textMesh.material.dispose();
            this.textMesh.geometry.dispose();
        }
        this.mesh.dispose();
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
        const el = this.renderer.domElement;
        if (el && el.parentNode === this.container) {
            this.container.removeChild(el);
        }
    }
}

export default function BlockDrift(props) {
    const {
        near = DEFAULTS.near,
        far = DEFAULTS.far,
        edge = DEFAULTS.edge,
        grid = DEFAULTS.grid,
        blockSize = DEFAULTS.blockSize,
        gap = DEFAULTS.gap,
        layers = DEFAULTS.layers,
        density = DEFAULTS.density,
        cluster = DEFAULTS.cluster,
        edgeWidth = DEFAULTS.edgeWidth,
        fade = DEFAULTS.fade,
        shade = DEFAULTS.shade,
        clearCentre = DEFAULTS.clearCentre,
        speed = DEFAULTS.speed,
        direction = DEFAULTS.direction,
        driftText = DEFAULTS.driftText,
        driftTextColor = DEFAULTS.driftTextColor,
        driftFont = DEFAULTS.driftFont,
        driftLetterSpacing = DEFAULTS.driftLetterSpacing,
        style,
    } = props;

    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    const cfg = {
        near,
        far,
        edge,
        grid,
        blockSize,
        gap,
        layers,
        density,
        cluster,
        edgeWidth,
        fade,
        shade,
        clearCentre,
        speed,
        direction,
        driftText,
        driftTextColor,
        driftFont,
        driftLetterSpacing,
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        let scene;
        try {
            scene = new BlockScene(container, cfg);
        } catch {
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
        near,
        far,
        edge,
        grid,
        blockSize,
        gap,
        layers,
        density,
        cluster,
        edgeWidth,
        fade,
        shade,
        clearCentre,
        speed,
        direction,
        driftText,
        driftTextColor,
        driftFont,
        driftLetterSpacing,
    ]);

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Block drift"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 120,
                minHeight: 120,
                overflow: "hidden",
                ...style,
            }}
        />
    );
}

BlockDrift.displayName = "Block Drift";
BlockDrift.defaultProps = { ...DEFAULTS };
