'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';

export default function ConnectStripes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isAnimating) {
          setIsAnimating(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isAnimating]);

  return (
    <section className={styles.connectSection} ref={containerRef}>
      <div className={`${styles.stripesContainer} ${isAnimating ? styles.active : ''}`}>
        <div className={styles.ribbonLeft}></div>
        <div className={styles.ribbonRight}></div>
        <div className={styles.blendCenter}>
          <span className="font-tech">connect</span>
        </div>
      </div>
    </section>
  );
}
