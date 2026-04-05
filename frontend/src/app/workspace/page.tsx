import Link from 'next/link';
import styles from './workspace.module.css';

export default function Workspace() {
  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className="font-editorial italic">DevMeet</h1>
          <p className={styles.activeSessionText}>Active Session</p>
        </div>
        <nav className={styles.navMenu}>
          <a href="#" className={styles.navItemActive}>
            <span className="material-symbols-outlined">code</span>
            <span className="font-tech">Editor</span>
          </a>
          <a href="#" className={styles.navItem}>
            <span className="material-symbols-outlined">chat</span>
            <span className="font-tech">Chat</span>
          </a>
          <a href="#" className={styles.navItem}>
            <span className="material-symbols-outlined">videocam</span>
            <span className="font-tech">Video</span>
          </a>
          <a href="#" className={styles.navItem}>
            <span className="material-symbols-outlined">history</span>
            <span className="font-tech">History</span>
          </a>
          <a href="#" className={styles.navItem}>
            <span className="material-symbols-outlined">settings</span>
            <span className="font-tech">Settings</span>
          </a>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.inviteBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>person_add</span>
            <span className="font-tech uppercase">Invite Pair</span>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <main className={styles.mainCanvas}>
        {/* Top Toolbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.fileInfo}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--color-secondary)' }}>description</span>
              <span className="font-editorial italic" style={{ color: 'var(--color-on-surface)', fontSize: '1.125rem' }}>main.py</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.toolbarActions}>
              <button className={styles.toolbarBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.375rem' }}>screen_share</span>
                <span className="font-tech uppercase">Share Screen</span>
              </button>
              <button className={styles.toolbarBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.375rem' }}>person_add</span>
                <span className="font-tech uppercase">Invite</span>
              </button>
            </div>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.collaborators}>
              <div className={styles.avatarStack}>
                <div className={styles.avatar} style={{ backgroundColor: 'var(--color-secondary)' }}>ER</div>
                <div className={styles.avatar} style={{ backgroundColor: 'var(--color-primary)' }}>MK</div>
                <div className={styles.avatar} style={{ backgroundColor: 'var(--color-tertiary-fixed)', color: 'var(--color-on-surface)' }}>You</div>
              </div>
            </div>
            <Link href="/pricing" className={styles.runCodeBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', marginRight: '0.375rem' }}>play_arrow</span>
              <span className="font-tech">Run Code</span>
            </Link>
          </div>
        </header>

        {/* Editor & Video Panel Split */}
        <div className={styles.workspaceSplit}>

          {/* Code Editor Section */}
          <section className={styles.editorPanel}>
            <div className={styles.fileTree}>
              <h3 className="font-tech uppercase" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}>Explorer</h3>
              <ul className={styles.fileList}>
                <li className={styles.fileItemActive}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>description</span>
                  main.py
                </li>
                <li className={styles.fileItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>folder</span>
                  components
                </li>
                <li className={styles.fileItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>folder</span>
                  utils
                </li>
                <li className={styles.fileItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>settings_ethernet</span>
                  config.env
                </li>
              </ul>
            </div>

            <div className={styles.codeCanvas}>
              <div className={styles.codeScroll}>
                <div className={styles.lineNumbers}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                <div className={styles.codeContent}>
                  <div><span className={styles.tokenKeyword}>import</span> <span className={styles.tokenString}>tensorflow</span> <span className={styles.tokenKeyword}>as</span> <span className={styles.tokenString}>tf</span></div>
                  <div><span className={styles.tokenKeyword}>from</span> <span className={styles.tokenString}>dev_meet</span> <span className={styles.tokenKeyword}>import</span> <span className={styles.tokenFunction}>CollaborativeOptimizer</span></div>
                  <div>&nbsp;</div>
                  <div><span className={styles.tokenComment}># Initialize DevMeet workspace context</span></div>
                  <div><span className={styles.tokenKeyword}>class</span> <span className={styles.tokenFunction}>WorkspaceSession</span>:</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className={styles.tokenKeyword}>def</span> <span className={styles.tokenFunction}>__init__</span>(self, project_id):</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.session = <span className={styles.tokenFunction}>tf.InteractiveSession</span>()</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.optimizer = <span className={styles.tokenFunction}>CollaborativeOptimizer</span>(project_id)</div>
                  <div>&nbsp;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className={styles.tokenKeyword}>def</span> <span className={styles.tokenFunction}>optimize_flow</span>(self, data):</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className={styles.tokenKeyword}>return</span> self.optimizer.<span className={styles.tokenFunction}>apply_gradients</span>(data)</div>
                  <div><span className={styles.cursorPulse}>|</span></div>
                </div>
              </div>

              <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusDot}></span>
                  <span>Connected</span>
                  <span>Python 3.11.4</span>
                </div>
                <div className={styles.statusRight}>
                  <span>UTF-8</span>
                  <span>Ln 12, Col 1</span>
                </div>
              </div>
            </div>
          </section>

          {/* Video & Chat Collaborative Panel */}
          <aside className={styles.collabPanel}>
            {/* Video Feeds Section */}
            <div className={styles.videoGrid}>
              <div className={styles.videoBox}>
                <div className={styles.videoLabel}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>mic</span>
                  Elena Ross
                </div>
              </div>
              <div className={`${styles.videoBox} ${styles.videoBoxLocal}`}>
                <div className={styles.videoLabelLocal}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>mic</span>
                  You (Alex)
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className={styles.chatSection}>
              <div className={styles.chatHeader}>
                <h4 className="font-tech uppercase" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Team Chat</h4>
                <span className={styles.chatBadge}>3 New</span>
              </div>

              <div className={styles.chatMessages}>
                <div className={styles.msgRemote}>
                  <p className={styles.msgMeta}>Marcus • 10:42 AM</p>
                  <div className={styles.msgBubbleRemote}>Should we use the Adam optimizer here instead?</div>
                </div>
                <div className={styles.msgLocal}>
                  <p className={styles.msgMeta}>You • 10:43 AM</p>
                  <div className={styles.msgBubbleLocal}>Good point. Let&apos;s try it for the next run.</div>
                </div>
                <div className={styles.msgRemote}>
                  <p className={styles.msgMeta}>Elena • 10:45 AM</p>
                  <div className={styles.msgBubbleRemote}>Agreed. I&apos;m updating the requirements doc too.</div>
                </div>
              </div>

              <div className={styles.chatInputContainer}>
                <input type="text" placeholder="Send a message..." className={styles.chatInput} />
                <button className={styles.chatSendBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Floating AI Action Button */}
        <Link href="/dashboard" className={styles.fabBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>auto_awesome</span>
        </Link>
      </main>
    </div>
  );
}
