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
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
      infinite: false,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <div className="devmeet-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
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
