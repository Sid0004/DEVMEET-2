import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <nav className={styles.navBar}>
        <div className={styles.navLeft}>
          <span className={`${styles.logo} font-editorial`}>DevMeet</span>
          <div className={styles.navLinks}>
            <a href="#" className={`${styles.navLink} ${styles.navLinkActive} font-editorial`}>Collaborate</a>
            <a href="#" className={`${styles.navLink} font-editorial`}>Community</a>
            <a href="#" className={`${styles.navLink} font-editorial`}>Resources</a>
          </div>
        </div>
        <div className={styles.navRight}>
          <button className={`${styles.loginBtn} font-editorial`}>Login</button>
          <button className={`${styles.signUpBtn} font-tech`}>Join DevMeet</button>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.kickerTag}>
            <span className="font-tech uppercase">A Space for Collective Intelligence</span>
          </div>
          <h1 className={`${styles.heroHeadline} font-editorial italic`}>
            Collaborate Without <span className="font-editorial italic" style={{ color: 'var(--color-secondary)' }}>Boundaries</span>
          </h1>
          <p className={`${styles.heroSubheadline} font-body`}>
            Step into a premium workspace engineered for elite builders. A dedicated arena for <span style={{ fontWeight: 900 }}>meetings, technical interviews, and architectural discussions</span> that move at the speed of thought.
          </p>
          <div className={styles.heroActions}>
            <button className={`${styles.primaryBtn} font-tech`}>Start a Session</button>
            <button className={`${styles.secondaryBtn} font-tech`}>View Enterprise Solutions</button>
          </div>

          {/* Creative Brand Visual (Temporarily Hidden) 
          <div className={styles.brandVisualContainer}>
            <div className={styles.brandVisualInner}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <span className={`${styles.brandTextMain} font-editorial`}>DevMeet</span>
                <span className={`${styles.brandTextShadow} font-editorial`}>DevMeet</span>
                <span className={styles.brandBorder}></span>
              </div>
              <div className={styles.motionAccent1}></div>
              <div className={styles.motionAccent2}></div>
            </div>
          </div>
          */}
        </section>

        {/* Use Cases Section */}
        <section className={styles.useCasesSection}>
          <div className={styles.useCasesHeader}>
            <span className="font-tech uppercase" style={{ color: 'var(--color-primary)', fontSize: '0.75rem', letterSpacing: '0.1em', display: 'block', marginBottom: '1rem' }}>Engineered for Every Stage</span>
            <h2 className={`${styles.sectionHeadline} font-editorial italic`}>Precision Built Use Cases</h2>
          </div>
          <div className={styles.useCasesGrid}>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIconCircle} style={{ backgroundColor: 'var(--color-secondary-fixed)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '2rem' }}>video_call</span>
              </div>
              <h3 className="font-editorial italic" style={{ fontSize: '2.25rem', marginBottom: '1rem', fontWeight: 400 }}>Seamless Meetings</h3>
              <p className="font-body" style={{ color: 'var(--color-on-surface-variant)' }}>Crystal clear video coupled with instant context sharing. Turn updates into progress without switching tabs.</p>
            </div>

            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIconCircle} style={{ backgroundColor: 'var(--color-primary-fixed)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>code_blocks</span>
              </div>
              <h3 className="font-editorial italic" style={{ fontSize: '2.25rem', marginBottom: '1rem', fontWeight: 400 }}>Technical Interviews</h3>
              <p className="font-body" style={{ color: 'var(--color-on-surface-variant)' }}>The ultimate sandbox for evaluation. Whiteboarding and live coding that feels native to both candidate and interviewer.</p>
            </div>

            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIconCircle} style={{ backgroundColor: 'var(--color-tertiary-fixed)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)', fontSize: '2rem' }}>forum</span>
              </div>
              <h3 className="font-editorial italic" style={{ fontSize: '2.25rem', marginBottom: '1rem', fontWeight: 400 }}>Deep Discussions</h3>
              <p className="font-body" style={{ color: 'var(--color-on-surface-variant)' }}>For the architects. Map out systems, debate implementations, and reach consensus with shared persistent canvases.</p>
            </div>
          </div>
        </section>

        {/* Real-time Synchronicity Section */}
        <section className={styles.syncSection}>
          <div className={styles.syncContent}>
            <div className={styles.syncKicker}>
              <span className="font-tech uppercase tracking-widest text-secondary text-xs">The Infrastructure</span>
            </div>
            <h2 className={`${styles.sectionHeadline} font-editorial italic`} style={{ textAlign: 'left', marginBottom: '2rem' }}>
              Real-time <br /><span className="font-editorial italic text-secondary">Synchronicity</span>
            </h2>
            <p className="font-body" style={{ fontSize: '1.25rem', color: 'var(--color-on-surface-variant)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              We've eliminated the friction of remote collaboration. Our proprietary engine delivers <strong style={{ color: 'var(--color-on-surface)' }}>zero-lag video</strong> and sub-millisecond sync for all collaborative tools.
            </p>
            <ul className={styles.syncList}>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>check_circle</span>
                <span className="font-body">Global edge network for minimal latency</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>check_circle</span>
                <span className="font-body">Instant state recovery across all participants</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>check_circle</span>
                <span className="font-body">High-fidelity spatial audio for natural flow</span>
              </li>
            </ul>
          </div>
          <div className={styles.syncGraphic}>
            <div className={styles.syncGraphicInner}>
              <div className={styles.spinCircleSecondary}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '3rem' }}>sync</span>
              </div>
              <div className={styles.syncConnector}></div>
              <div className={styles.spinCirclePrimary}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '3rem' }}>bolt</span>
              </div>
            </div>
          </div>
        </section>

        {/* Community CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow}></div>
            <div className={styles.ctaContent}>
              <h3 className={`${styles.ctaHeadline} font-editorial`}>Built for the next <span className="font-editorial italic" style={{ opacity: 0.8 }}>generation</span> of architects.</h3>
              <p className="font-body" style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>Join 50,000+ developers building the future of collaborative software development.</p>
            </div>
            <div className={styles.ctaActions}>
              <button className={styles.ctaBtn}>Join the Circle</button>
              <span className="font-tech uppercase" style={{ fontSize: '0.625rem', letterSpacing: '0.2em', opacity: 0.6 }}>Free for open source</span>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <span className="font-editorial" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block', marginBottom: '1.5rem' }}>DevMeet</span>
            <p className="font-tech uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--color-primary)', lineHeight: 2 }}>© 2024 DevMeet.<br />Built for the Community.</p>
          </div>
          <div className={styles.footerLinksGroup}>
            <h4 className="font-tech uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 'bold', marginBottom: '0.5rem' }}>Platform</h4>
            <a href="#">Community Docs</a>
            <a href="#">API Hub</a>
            <a href="#">Changelog</a>
          </div>
          <div className={styles.footerLinksGroup}>
            <h4 className="font-tech uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 'bold', marginBottom: '0.5rem' }}>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
          <div className={styles.footerLinksGroup}>
            <h4 className="font-tech uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 'bold', marginBottom: '0.5rem' }}>Connect</h4>
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
            <a href="#">Discord</a>
          </div>
        </div>
      </footer>
    </>
  );
}
