import Link from 'next/link';
import styles from './pricing.module.css';

export default function Pricing() {
  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.navBar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo}>
            <span className="font-editorial italic">DevMeet</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#" className="font-tech">Communities</a>
            <Link href="/pricing" className={`font-tech ${styles.navLinkActive}`}>Pricing</Link>
            <a href="#" className="font-tech">Events</a>
          </div>
        </div>
        <div className={styles.navRight}>
          <Link href="/dashboard" className={styles.ctaBtn}>
            <span className="font-tech">Open Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={`${styles.heroKicker} font-tech uppercase`}>Plans & Pricing</span>
        <h1 className={`${styles.heroHeadline} font-editorial italic`}>
          Invest in Your <span className={styles.heroAccent}>Collaboration</span>
        </h1>
        <p className={`${styles.heroSub} font-body`}>
          The ultimate collaboration hub for modern engineering teams. Connect, build, and grow together.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingGrid}>
          {/* Hobby Tier */}
          <div className={styles.pricingCard}>
            <div className={styles.cardTop}>
              <span className={`${styles.tierLabel} font-tech uppercase`}>Hobby</span>
              <div className={styles.priceRow}>
                <span className={`${styles.price} font-editorial`}>Free</span>
              </div>
              <p className={`${styles.tierDesc} font-body`}>Perfect for side projects and individual devs exploring the platform.</p>
            </div>
            <ul className={styles.featureList}>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>groups</span>
                <span className="font-body">Join Public Communities</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>chat</span>
                <span className="font-body">Open Source Collaboration</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>event_available</span>
                <span className="font-body">Access to Virtual Meetups</span>
              </li>
            </ul>
            <Link href="/workspace" className={styles.tierBtn}>
              <span className="font-tech">Get Started</span>
            </Link>
          </div>

          {/* Squad Tier */}
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <div className={styles.featuredBadge}>
              <span className="font-tech uppercase">Most Popular</span>
            </div>
            <div className={styles.cardTop}>
              <span className={`${styles.tierLabel} font-tech uppercase`}>Squad</span>
              <div className={styles.priceRow}>
                <span className={`${styles.price} font-editorial`}>$19</span>
                <span className={`${styles.pricePeriod} font-tech`}>/month</span>
              </div>
              <p className={`${styles.tierDesc} font-body`}>For small teams who need private workspaces and real-time collaboration.</p>
            </div>
            <ul className={styles.featureList}>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '1.25rem' }}>hub</span>
                <span className="font-body">Private Team Hubs</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '1.25rem' }}>forum</span>
                <span className="font-body">Unlimited Voice & Video Channels</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '1.25rem' }}>screen_share</span>
                <span className="font-body">High-Fidelity Pair Programming</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '1.25rem' }}>calendar_month</span>
                <span className="font-body">Priority Event Scheduling</span>
              </li>
            </ul>
            <Link href="/workspace" className={`${styles.tierBtn} ${styles.tierBtnFeatured}`}>
              <span className="font-tech">Start Free Trial</span>
            </Link>
          </div>

          {/* Network Tier */}
          <div className={styles.pricingCard}>
            <div className={styles.cardTop}>
              <span className={`${styles.tierLabel} font-tech uppercase`}>Network</span>
              <div className={styles.priceRow}>
                <span className={`${styles.price} font-editorial`}>$79</span>
                <span className={`${styles.pricePeriod} font-tech`}>/month</span>
              </div>
              <p className={`${styles.tierDesc} font-body`}>Enterprise-grade tooling for organizations that demand full control.</p>
            </div>
            <ul className={styles.featureList}>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>domain</span>
                <span className="font-body">Company-wide Community Management</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>analytics</span>
                <span className="font-body">Member Engagement Analytics</span>
              </li>
              <li>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>verified_user</span>
                <span className="font-body">SSO & Enterprise Governance</span>
              </li>
            </ul>
            <Link href="/dashboard" className={styles.tierBtn}>
              <span className="font-tech">Contact Sales</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <span className="font-tech uppercase" style={{ color: 'var(--color-secondary)', fontSize: '0.75rem', letterSpacing: '0.1em', display: 'block', marginBottom: '1rem' }}>Platform Features</span>
          <h2 className={`${styles.featuresHeadline} font-editorial italic`}>Designed for how modern developers meet.</h2>
          <p className="font-body" style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            We bridge the gap between solo coding and collective innovation with tools built for community first.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconCircle} style={{ backgroundColor: 'rgba(0, 81, 213, 0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '2rem' }}>auto_awesome</span>
            </div>
            <h3 className="font-editorial italic" style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 400 }}>The Collaborative Engine</h3>
            <p className="font-body" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              DevMeet syncs your entire team across continents. Experience zero-latency code sharing integrated with rich social features.
            </p>
            <div className={styles.codeSnippet}>
              <code className="font-tech" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                {'// DevMeet Network Status:'}<br />
                {'connected.nodes: 1,420 | latency: 12ms | active_sprints: 85'}
              </code>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconCircle} style={{ backgroundColor: 'rgba(99, 247, 255, 0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '2rem' }}>forum</span>
            </div>
            <h3 className="font-editorial italic" style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 400 }}>Threaded Team Chat</h3>
            <p className="font-body" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
              Deeply integrated discussions that reference code blocks directly. Keep your team aligned without leaving the workflow.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconCircle} style={{ backgroundColor: 'rgba(0, 81, 213, 0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '2rem' }}>videocam</span>
            </div>
            <h3 className="font-editorial italic" style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 400 }}>Huddle Video Rooms</h3>
            <p className="font-body" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
              Instant huddles for quick syncs or deep-dive pair programming sessions. Low-bandwidth, high-clarity collaboration.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconCircle} style={{ backgroundColor: 'rgba(99, 247, 255, 0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '2rem' }}>monitoring</span>
            </div>
            <h3 className="font-editorial italic" style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 400 }}>Real-time Pulse</h3>
            <p className="font-body" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
              See who&apos;s coding what in real-time. Our Pulse technology ensures you&apos;re never stepping on a teammate&apos;s toes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <h4 className="font-editorial italic" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>DevMeet</h4>
            <p className="font-tech" style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>Built for Collaboration.</p>
          </div>
          <div className={styles.footerCol}>
            <h5 className="font-tech uppercase" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--color-on-surface-variant)' }}>Community</h5>
            <a href="#" className="font-body">Guidelines</a>
            <a href="#" className="font-body">Events</a>
            <Link href="/pricing" className="font-body">Pricing</Link>
          </div>
          <div className={styles.footerCol}>
            <h5 className="font-tech uppercase" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--color-on-surface-variant)' }}>Support</h5>
            <a href="#" className="font-body">Help Center</a>
            <a href="#" className="font-body">Security</a>
          </div>
          <div className={styles.footerCol}>
            <h5 className="font-tech uppercase" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--color-on-surface-variant)' }}>Social</h5>
            <a href="#" className="font-body">Twitter</a>
            <a href="#" className="font-body">Discord</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className="font-tech" style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant)' }}>© 2024 DevMeet. Built for Collaboration.</p>
        </div>
      </footer>
    </div>
  );
}
