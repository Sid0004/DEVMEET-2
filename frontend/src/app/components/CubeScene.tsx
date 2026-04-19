"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type CubeSceneProps = {
  className?: string;
};

export default function CubeScene({ className }: CubeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(5, 5, 5);
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
    fillLight.position.set(-5, -1, -5);

    scene.add(ambientLight, keyLight, fillLight);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x101820,
      metalness: 0.75,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });

    const stickerColors = [
      0x2563eb,
      0x06b6d4,
      0x14b8a6,
      0xf59e0b,
      0xe11d48,
      0x38bdf8,
    ];

    const stickerMaterials = stickerColors.map(
      (color) =>
        new THREE.MeshPhysicalMaterial({
          color,
          metalness: 0.12,
          roughness: 0.38,
          clearcoat: 0.6,
          emissive: color,
          emissiveIntensity: 0.08,
        })
    );

    const boxGeometry = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const stickerGeometry = new THREE.PlaneGeometry(0.84, 0.84);

    const cubes: THREE.Mesh[] = [];
    const offset = 1;

    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          const miniCube = new THREE.Mesh(boxGeometry, baseMaterial);

          const targetPos = new THREE.Vector3(x * offset, y * offset, z * offset);
          const startPos = new THREE.Vector3(
            x * offset + (Math.random() - 0.5) * 14,
            y * offset + (Math.random() - 0.5) * 14,
            z * offset + (Math.random() - 0.5) * 9 - 5
          );
          const startRot = new THREE.Euler(
            Math.random() * Math.PI * 4,
            Math.random() * Math.PI * 4,
            Math.random() * Math.PI * 4
          );

          miniCube.position.copy(startPos);
          miniCube.rotation.copy(startRot);
          miniCube.userData = {
            targetPos,
            startPos,
            startRot,
            randomOffset: Math.random() * Math.PI * 2,
          };

          const addSticker = (
            px: number,
            py: number,
            pz: number,
            rx: number,
            ry: number,
            matIdx: number
          ) => {
            const sticker = new THREE.Mesh(stickerGeometry, stickerMaterials[matIdx]);
            sticker.position.set(px, py, pz);
            sticker.rotation.set(rx, ry, 0);
            miniCube.add(sticker);
          };

          if (x === 1) addSticker(0.485, 0, 0, 0, Math.PI / 2, 0);
          if (x === -1) addSticker(-0.485, 0, 0, 0, -Math.PI / 2, 1);
          if (y === 1) addSticker(0, 0.485, 0, -Math.PI / 2, 0, 2);
          if (y === -1) addSticker(0, -0.485, 0, Math.PI / 2, 0, 3);
          if (z === 1) addSticker(0, 0, 0.485, 0, 0, 4);
          if (z === -1) addSticker(0, 0, -0.485, Math.PI, 0, 5);

          cubes.push(miniCube);
          cubeGroup.add(miniCube);
        }
      }
    }

    const updateLayout = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      if (window.innerWidth < 900) {
        cubeGroup.position.set(0, 3.2, -2);
        camera.position.z = 13.5;
      } else {
        cubeGroup.position.set(4.1, 0.2, 0);
        camera.position.z = 10.5;
      }
    };

    updateLayout();

    const animState = { progress: 0 };

    const progressTween = gsap.to(animState, {
      progress: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });

    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      frameId = window.requestAnimationFrame(tick);
      const elapsed = clock.getElapsedTime();
      const eased = gsap.parseEase("power2.inOut")(animState.progress);

      cubes.forEach((cube) => {
        const data = cube.userData as {
          targetPos: THREE.Vector3;
          startPos: THREE.Vector3;
          startRot: THREE.Euler;
          randomOffset: number;
        };

        cube.position.lerpVectors(data.startPos, data.targetPos, eased);

        if (eased < 0.99) {
          const drift = (1 - eased) * 0.1;
          cube.position.y += Math.sin(elapsed * 2 + data.randomOffset) * drift;
        }

        const targetQuat = new THREE.Quaternion().identity();
        const startQuat = new THREE.Quaternion().setFromEuler(data.startRot);
        cube.quaternion.slerpQuaternions(startQuat, targetQuat, eased);
      });

      if (animState.progress > 0.95) {
        const speedRamp = (animState.progress - 0.95) * 20;
        cubeGroup.rotation.y += 0.005 * speedRamp;
        cubeGroup.rotation.x += 0.002 * speedRamp;
      } else {
        cubeGroup.rotation.y = animState.progress * Math.PI * 1.35;
        cubeGroup.rotation.x = animState.progress * Math.PI * 0.45;
      }

      renderer.render(scene, camera);
    };

    tick();
    window.addEventListener("resize", updateLayout);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateLayout);
      progressTween.scrollTrigger?.kill();
      progressTween.kill();

      scene.remove(cubeGroup);
      boxGeometry.dispose();
      stickerGeometry.dispose();
      baseMaterial.dispose();
      stickerMaterials.forEach((material) => material.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
