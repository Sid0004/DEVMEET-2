'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { apiRequest } from '../../lib/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/features/authSlice';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      // 1. Tell the backend to clear the cookies
      await apiRequest('/api/v1/users/logout', { method: 'POST' });
      
      // 2. Clear the Redux state
      dispatch(logout());
      
      // 3. Redirect to home/login
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if backend fails
      dispatch(logout());
      router.push('/');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return alert("Room name is required.");

    setLoading(true);
    try {
      const response: any = await apiRequest('/api/v1/rooms/create', {
        method: 'POST',
        body: JSON.stringify({ roomName, primaryLanguage: language })
      });
      console.log("Room Created:", response);
      // Ensure we use the 6 digit roomId
      const newRoomId = response?.data?.roomId;
      alert(`Room Created! Code: ${newRoomId}`);
      router.push(`/workspace?room=${newRoomId}`);
    } catch (error: any) {
      alert("Failed to create room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return alert("Please enter a room code.");

    setLoading(true);
    try {
      const response: any = await apiRequest(`/api/v1/rooms/${joinCode.trim()}/join`, {
        method: 'POST'
      });
      console.log("Joined Room:", response);
      router.push(`/workspace?room=${joinCode.trim()}`);
    } catch (error: any) {
      alert("Failed to join room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className="font-editorial italic">DevMeet</h1>
        </div>
        <div className={styles.sidebarContent}>
          <div className={styles.projectInfo}>
            <p className={`${styles.statusLabel} font-tech`}>Project Alpha</p>
            <p className={styles.statusActive}>Active Session</p>
          </div>
          <nav className={styles.navMenu}>
            <a href="#" className={styles.navItemActive}>
              <span className="material-symbols-outlined">meeting_room</span>
              <span className="font-tech">Rooms</span>
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
        </div>
        <div className={styles.sidebarFooter}>
          <Link href="/workspace" className={styles.inviteBtn}>
            <span className="font-tech">Invite Pair</span>
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="font-tech">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className={styles.mainCanvas}>
        <header className={styles.header}>
          <span className={`${styles.headerKicker} font-tech`}>Welcome back, {user?.name || user?.username || 'Architect'}</span>
          <h2 className={`${styles.headline} font-editorial`}>
            Collaborate with <span style={{ color: 'var(--color-secondary)' }}>DevMeet</span> and Intent.
          </h2>
        </header>

        <div className={styles.bentoGrid}>
          {/* Create Room Section */}
          <section className={styles.createRoomCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconCircle}>
                <span className="material-symbols-outlined">add</span>
              </div>
              <h3 className={`${styles.cardTitle} font-editorial italic`}>Create a New DevMeet Room</h3>
            </div>
            <form className={styles.formContainer} onSubmit={handleCreateRoom}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className="font-tech">Room Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Migration"
                    className={styles.inputField}
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className="font-tech">Primary Language</label>
                  <select
                    className={styles.inputField}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>TypeScript</option>
                    <option>Python</option>
                    <option>Rust</option>
                    <option>Go</option>
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  <span className="font-tech">{loading ? "Initializing..." : "Initialize Room"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Join Room Section */}
          <section className={styles.joinRoomCard}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h3 className={`${styles.joinTitle} font-editorial`}>Join an Active Room</h3>
              <p className={styles.joinDescription}>Collaborate instantly. Paste your DevMeet invitation link or enter the unique 6-digit room code.</p>
              <form className={styles.joinInputBox} onSubmit={handleJoinRoom}>
                <input
                  type="text"
                  placeholder="Room Code or Link"
                  className={`${styles.joinInput} font-tech`}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading} className={styles.enterRoomBtn}>
                  <span className="font-tech">{loading ? "Joining..." : "Enter Room"}</span>
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <section className={styles.recentActivity}>
          <div className={styles.recentHeader}>
            <div>
              <h3 className={`${styles.recentTitle} font-editorial`}>Recent Collaborations</h3>
              <p className={styles.recentSubtitle}>Continue where you and your team left off on DevMeet.</p>
            </div>
            <button className={`${styles.viewAllBtn} font-tech`}>View All History</button>
          </div>

          <div className={styles.activityGrid}>
            <div className={styles.activityCard}>
              <div className={styles.cardMeta}>
                <span className={`${styles.badgeActive} font-tech`}>Active Now</span>
              </div>
              <h4 className={`${styles.activityName} font-editorial italic`}>Refactor Engine v2</h4>
              <p className={`${styles.activityDesc} font-tech`}>TypeScript • Last edited 12m ago</p>
            </div>
            <div className={styles.activityCard}>
              <div className={styles.cardMeta}>
                <span className={`${styles.badgeInactive} font-tech`}>2 hours ago</span>
              </div>
              <h4 className={`${styles.activityName} font-editorial italic`}>GraphQL Schema Audit</h4>
              <p className={`${styles.activityDesc} font-tech`}>JavaScript • Last edited 2h ago</p>
            </div>
            <div className={styles.activityCard}>
              <div className={styles.cardMeta}>
                <span className={`${styles.badgeInactive} font-tech`}>1 day ago</span>
              </div>
              <h4 className={`${styles.activityName} font-editorial italic`}>Neural Mesh UI</h4>
              <p className={`${styles.activityDesc} font-tech`}>React • Last edited 1d ago</p>
            </div>
          </div>
        </section>

        {/* DevMeet Live Banner */}
        <section className={styles.liveBanner}>
          <div className={styles.liveBannerContent}>
            <h3 className="font-editorial italic" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              DevMeet Live: <span style={{ color: 'var(--color-tertiary-fixed)' }}>Real-time architectural insights.</span>
            </h3>
            <p className="font-body" style={{ color: 'var(--color-outline-variant)', lineHeight: '1.6', maxWidth: '600px' }}>
              Our new engine doesn&apos;t just suggest syntax; it understands your project&apos;s architectural integrity and provides high-level structural critiques during your sessions.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            <h4 className="font-editorial italic" style={{ fontSize: '1.25rem' }}>DevMeet</h4>
            <p className="font-tech" style={{ fontSize: '0.75rem', color: 'var(--color-outline-variant)' }}>The Editorial Architect.</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#" className="font-tech">Documentation</a>
            <a href="#" className="font-tech">API Reference</a>
            <a href="#" className="font-tech">Privacy</a>
            <a href="#" className="font-tech">Terms</a>
          </div>
          <p className="font-tech" style={{ fontSize: '0.625rem', color: 'var(--color-outline-variant)', marginTop: '2rem' }}>© 2024 DevMeet. Built for Architects.</p>
        </footer>
      </main>
    </div>
  );
}
