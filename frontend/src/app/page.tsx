import Link from 'next/link';
import styles from './page.module.css';
import MorphTextReveal from './components/MorphTextReveal';
import TextPressure from './components/TextPressure';

export default function Home() {
  return (
    <>
      <nav className={styles.navBar}>
        <div className={styles.navLeft}>
          <span className={`${styles.logo} font-editorial`}>DevMeet</span>
        </div>
        {/* <div className={styles.navLinks}>
          <a href="#features" className={`${styles.navLink} font-editorial`}>Features</a>
          <a href="#use-cases" className={`${styles.navLink} font-editorial`}>Use Cases</a>
          <a href="#community" className={`${styles.navLink} font-editorial`}>Community</a>
        </div> */}
        <div className={styles.navRight}>
          <Link href="/login" className={`${styles.loginBtn} font-editorial`}>Login</Link>
          <Link href="/workspace" className={`${styles.signUpBtn} font-tech`}>Join DevMeet</Link>
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
            <Link href="/dashboard" className={`${styles.primaryBtn} font-tech`}>Start a Session</Link>
            <Link href="/pricing" className={`${styles.secondaryBtn} font-tech`}>View Enterprise Solutions</Link>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className={styles.useCasesSection}>
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
        <section id="features" className={styles.syncSection}>
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
        <section id="community" className={styles.ctaSection}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow}></div>
            <div className={styles.ctaContent}>
              <h3 className={`${styles.ctaHeadline} font-editorial`}>Built for the next <span className="font-editorial italic" style={{ opacity: 0.8 }}>generation</span> of architects.</h3>
              <p className="font-body" style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>Join 50,000+ developers building the future of collaborative software development.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/workspace" className={styles.ctaBtn}>Join the Circle</Link>
              <span className="font-tech uppercase" style={{ fontSize: '0.625rem', letterSpacing: '0.2em', opacity: 0.6 }}>Free for open source</span>
            </div>
          </div>
        </section>

        {/* Jitter-style Morph Shape → Text Animation */}
        {/* <MorphTextReveal text="COLLABORATE" /> */}
      </main>

      <footer className={styles.premiumFooter}>

        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <div className={styles.footerBrand}>
              <span className={`${styles.footerLogo} font-editorial`}>DevMeet</span>
              <p className="font-body" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
                © 2024 DevMeet. Engineered for the next generation of builders.
              </p>
            </div>
            <div className={styles.footerLinksGrid}>
              <div className={styles.footerLinksGroup}>
                <h4 className="font-tech uppercase">Platform</h4>
                <a href="#">Community Docs</a>
                <a href="#">API Hub</a>
                <a href="#">Changelog</a>
              </div>
              <div className={styles.footerLinksGroup}>
                <h4 className="font-tech uppercase">Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Security</a>
              </div>
              <div className={styles.footerLinksGroup}>
                <h4 className="font-tech uppercase">Social</h4>
                <a href="#">Twitter / X</a>
                <a href="#">GitHub</a>
                <a href="#">Discord</a>
              </div>
            </div>
          </div>
          <div className={styles.footerRight}>
            <TextPressure
              text="CONNECT"
              flex={true}
              scale={false}
              textColor="var(--color-secondary)"
              minFontSize={280}
            />
          </div>
        </div>
      </footer>
    </>
  );
}
