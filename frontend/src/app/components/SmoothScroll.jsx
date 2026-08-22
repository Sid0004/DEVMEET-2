"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  useEffect(() => {
    let lenis;
    let rafId = 0;
    let isRunning = true;

    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      function raf(time) {
        if (!isRunning) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);

      return () => {
        isRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
        lenis.destroy();
        document.documentElement.classList.remove("lenis");
        document.body.classList.remove("lenis");
      };
    } catch (e) {
      console.warn("SmoothScroll lenis init error:", e);
    }
  }, []);

  return <>{children}</>;
}
