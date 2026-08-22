'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Pillars from '@/components/landing/Pillars';
import Agenda from '@/components/landing/Agenda';
import ConvinceBoss from '@/components/landing/ConvinceBoss';
import MosaicBanner from '@/components/landing/MosaicBanner';
import Testimonials from '@/components/landing/Testimonials';
import Tickets from '@/components/landing/Tickets';
import DeveloperWonderland from '@/components/landing/DeveloperWonderland';
import PrivacyNotice from '@/components/landing/PrivacyNotice';

export default function HomePage() {
  useEffect(() => {
    let lenis;
    let rafId = 0;
    let isRunning = true;

    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.1,
        infinite: false,
      });

      window.lenis = lenis;

      function raf(time) {
        if (!isRunning) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);

      const handleVisibilityChange = () => {
        if (document.hidden) {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        } else if (isRunning && !rafId) {
          rafId = requestAnimationFrame(raf);
        }
      };

      const handlePageShow = () => {
        if (isRunning && !rafId) {
          rafId = requestAnimationFrame(raf);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('popstate', handlePageShow);

      return () => {
        isRunning = false;
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('popstate', handlePageShow);
        if (rafId) cancelAnimationFrame(rafId);
        lenis.destroy();
        window.lenis = null;
      };
    } catch (e) {
      console.warn('Lenis init error:', e);
    }
  }, []);

  return (
    <div className="devmeet-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections — Ending at Developer Wonderland (Hands) */}
      <main style={{ flex: 1 }}>
        <Hero />
        <Pillars />
        <Agenda />
        <ConvinceBoss />
        <MosaicBanner />
        <Testimonials />
        <Tickets />
        <DeveloperWonderland />
      </main>

      {/* Cookie / Privacy Notification */}
      <PrivacyNotice />
    </div>
  );
}
