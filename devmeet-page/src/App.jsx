import React, { useRef, useState, useEffect } from 'react';
import { HeaderNavigation } from './components/Navigation';
import { PrimaryWhiteButton, OutlinedButton } from './components/Buttons';
import { AvailabilityBadge } from './components/Badge';
import { DisplayHeadline, ClientAttribution } from './components/Typography';
import { SplitModeContainer, SplitModeCard } from './components/Cards';
import { ManifestoSection } from './components/ManifestoSection';

import heroImg from './assets/hero-hands-mobile.avif';
import { SquigglyText } from './components/ui/squiggly-text';
import { ScrollSplitCard } from './components/ui/scroll-split-card';
import { DeveloperSection, InterviewerSection } from './components/FeatureSections';

function App() {
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const heroRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && headerRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const headerHeight = headerRef.current.offsetHeight;
        setIsScrolled(rect.top <= headerHeight);
      }
      if (heroRef.current) {
        const translateVal = window.scrollY * 0.3;
        heroRef.current.style.transform = `translateY(-${translateVal}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Check initial position on mount
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
  
  return (
    <>
      <div 
        ref={headerRef}
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 20, 
          backgroundColor: isScrolled ? 'var(--color-obsidian-canvas)' : '#000000',
          transition: 'background-color 0.2s ease'
        }}
      >
        <HeaderNavigation />
      </div>
      
      <div style={{ position: 'sticky', top: 0, zIndex: 0, backgroundColor: '#000000' }}>
        <main>
          {/* HERO SECTION */}
          <section 
            ref={heroRef}
            className="section" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              paddingTop: '70px', 
              paddingBottom: 0,
              willChange: 'transform'
            }}
          >
            
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <DisplayHeadline>
                Collaborate without{' '}
                <SquigglyText stepDuration={70} scale={[6, 9]} style={{ color: '#3b82f6' }}>
                  boundaries
                </SquigglyText>
              </DisplayHeadline>
              <p style={{ marginTop: '18px', color: 'var(--color-smoke)', fontSize: '18px', maxWidth: '600px' }}>
                A unified, web-native digital environment to write code, build programs, and communicate simultaneously. No more context switching.
              </p>
              
              {/* Buttons overlapping the image */}
              <div style={{ display: 'flex', gap: '2px', marginTop: '36px', position: 'relative', zIndex: 10 }}>
                <PrimaryWhiteButton onClick={() => console.log('start')}>START CODING</PrimaryWhiteButton>
                <OutlinedButton onClick={() => console.log('demo')} showArrow={true}>REQUEST DEMO</OutlinedButton>
              </div>
            </div>
            
            {/* Full-width Image Container shifted up */}
            <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', overflow: 'hidden', marginTop: '-130px' }}>
              <img 
                src={heroImg} 
                alt="Hero Hand" 
                style={{ width: '100%', minWidth: '1200px', height: 'auto', objectFit: 'cover' }} 
              />
            </div>
          </section>
        </main>
      </div>

      <div 
        ref={contentRef}
        style={{ position: 'relative', zIndex: 10, backgroundColor: 'var(--color-obsidian-canvas)' }}
      >
        <main className="container">
          
          {/* THE PROBLEM / SOLUTION SECTION */}
          <section className="section" id="services" style={{ paddingTop: '120px' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <span className="font-mono uppercase text-caption" style={{ color: 'var(--color-smoke)', letterSpacing: 'var(--tracking-caption)' }}>WHY DEVMEET EXISTS</span>
            </div>
            
            <ScrollSplitCard
              frontText="The fragmented workspace is breaking developer momentum."
              
              // Option B: To use three different texts or images on the front side of each card,
              // simply uncomment the `frontText` or `frontImage` properties inside the cards array below.
              cards={[
                {
                  title: "Zero Local Setup",
                  description: "Run complex programs directly in the browser. Pre-configured runtimes for Python, Go, Rust, and more. No more configuring compilers.",
                  bgColor: "#101010",
                  textColor: "#f3f3f3",
                  // frontText: "Zero Local Setup", // Uncomment for a unique text on this card front
                  // frontImage: "/src/assets/zero-setup.png", // Uncomment for a unique image on this card front
                },
                {
                  title: "Unified Workflow",
                  description: "Editing updates, cursor positions, compiler runs, and file selections sync instantly across all participants under 10 milliseconds.",
                  bgColor: "#067ff1ff",
                  textColor: "#f3f3f3",
                  // frontText: "Unified Syncing", // Uncomment for a unique text on this card front
                  // frontImage: "/src/assets/sync.png", // Uncomment for a unique image on this card front
                },
                {
                  title: "Secure & Tracked",
                  description: "Focus monitors track tab-switching and plagiarism, while session histories are logged keystroke-by-keystroke for replay.",
                  bgColor: "#f3f3f3",
                  textColor: "#101010",
                  // frontText: "Anti-Plagiarism", // Uncomment for a unique text on this card front
                  // frontImage: "/src/assets/security.png", // Uncomment for a unique image on this card front
                },
              ]}
            />
          </section>

          {/* CORE MODES SECTION */}
          <section className="section" id="portfolio">
            <SplitModeContainer>
              <SplitModeCard 
                isDark={true}
                subtitle="Collaboration Mode"
                title="An open workspace for active engineering teams."
                description="All participants have equal edit permissions, can create files, run code, and share links freely to co-author features without friction."
              />
              <SplitModeCard 
                isDark={false}
                subtitle="Assessment Mode"
                title="A locked-down space for technical recruiting."
                description="The candidate's editor is monitored. Clipboard operations are restricted to prevent AI pasting, and interviewers can view active security logs."
              />
            </SplitModeContainer>
          </section>

          {/* DEVELOPER SECTION */}
          <DeveloperSection />

          {/* INTERVIEWER SECTION */}
          <InterviewerSection />

          {/* MANIFESTO SECTION */}
          <section className="section" id="process" style={{ paddingBottom: '120px' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-frost-text)', marginBottom: '40px' }}>
                Built for true development capability.
              </h2>
              <div style={{ color: 'var(--color-frost-text)', fontSize: 'var(--text-body)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                <p>
                  Traditionally, remote collaboration requires navigating a fragmented workspace of video apps, independent editors, terminals, and chat clients. Setup overhead is high. Momentum breaks. Context disappears.
                </p>
                <p>
                  DevMeet consolidates the entire development stack into a single, cohesive interface. Whether you are pair programming a new architecture with a colleague, or evaluating an engineering candidate, the environment should never get in the way of the code.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <footer style={{ borderTop: '1px solid var(--color-onyx-edge)', padding: '40px 0', textAlign: 'center' }}>
          <div className="container">
            <p style={{ fontFamily: 'var(--font-input)', fontSize: 'var(--text-caption)', color: 'var(--color-smoke)' }}>
              © {new Date().getFullYear()} DEVMEET. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
