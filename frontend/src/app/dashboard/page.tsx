'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { apiRequest } from '../../lib/api';
import { useAppSelector } from '@/redux/hooks';
import Sidebar from '../components/Sidebar';
import Avatar from '@/components/Avatar';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  interface RoomHistory {
    _id: string;
    roomId: string;
    roomName: string;
    primaryLanguage: string;
    status: 'active' | 'ended' | 'scheduled';
    createdAt: string;
  }

  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'history'>('rooms');
  const [history, setHistory] = useState<RoomHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // New options states
  const [primaryLanguage, setPrimaryLanguage] = useState("TypeScript");
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [loaderText, setLoaderText] = useState("Preparing workspace environment...");

  // Rotate loading texts
  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Contacting server cluster...",
      "Allocating Monaco editor instances...",
      "Configuring live synchronization...",
      "Establishing collaborative socket tunnels...",
      "Workspace ready. Connecting..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      setLoaderText(messages[Math.min(index++, messages.length - 1)]);
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest<{ data: RoomHistory[] }>('/api/v1/rooms/history', {
          method: 'GET'
        });
        if (response.data) {
          setHistory(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch meeting history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await apiRequest(`/api/v1/rooms/${roomId}/delete`, {
        method: 'DELETE'
      });
      setHistory((prev) => prev.filter((room) => room.roomId !== roomId));
      alert("Room deleted successfully.");
    } catch (error) {
      const err = error as { message?: string };
      alert("Failed to delete room: " + (err.message || "Unknown error"));
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return alert("Room name is required.");

    setLoading(true);
    try {
      const response = await apiRequest<{ data: { roomId: string } }>('/api/v1/rooms/create', {
        method: 'POST',
        body: JSON.stringify({ 
          roomName,
          primaryLanguage,
          roomSettings: { interviewMode: isInterviewMode }
        })
      });
      const newRoomId = response.data?.roomId;
      setTimeout(() => {
        router.push(`/workspace?room=${newRoomId}`);
      }, 1000);
    } catch (error) {
      setLoading(false);
      const err = error as { message?: string };
      alert("Failed to create room: " + (err.message || "Unknown error"));
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return alert("Please enter a room code.");

    setLoading(true);
    try {
      await apiRequest<{ data: unknown }>(`/api/v1/rooms/${joinCode.trim()}/join`, {
        method: 'POST'
      });
      setTimeout(() => {
        router.push(`/workspace?room=${joinCode.trim()}`);
      }, 1000);
    } catch (error) {
      setLoading(false);
      const err = error as { message?: string };
      alert("Failed to join room: " + (err.message || "Unknown error"));
    }
  };


  return (
    <>
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <h3 className={`${styles.loaderTitle} font-tech`}>DevMeet</h3>
            <p className={`${styles.loaderText} font-tech`}>{loaderText}</p>
          </div>
        </div>
      )}
      <div className={styles.layout}>
        {/* Sidebar Navigation (Extracted Component) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Canvas */}
        <main
          className={styles.mainCanvas}
          style={{ marginLeft: sidebarCollapsed ? '64px' : '260px' }}
        >
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={`${styles.headerKicker} font-tech`}>Welcome back, {user?.fullName || user?.username || 'Architect'}</span>
              <h2 className={`${styles.headline} font-editorial`}>
                Collaborate with <span style={{ color: 'var(--color-secondary)' }}>DevMeet</span> and Intent.
              </h2>
            </div>
            
          </header>

          {activeTab === 'rooms' ? (
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

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label className="font-tech">Primary Language</label>
                      <select
                        className={styles.selectField}
                        value={primaryLanguage}
                        onChange={(e) => setPrimaryLanguage(e.target.value)}
                      >
                        <option value="TypeScript">TypeScript</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className="font-tech">Workspace Mode</label>
                      <label className={styles.switchGroup}>
                        <input
                          type="checkbox"
                          checked={isInterviewMode}
                          onChange={(e) => setIsInterviewMode(e.target.checked)}
                        />
                        <span className={`${styles.switchLabel} font-tech`}>Interview Mode</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      <span className="font-tech">Initialize Room</span>
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
                      <span className="font-tech">Enter Room</span>
                    </button>
                  </form>
                </div>
              </section>
            </div>
        ) : (
          <section className={styles.recentActivity}>
            <div className={styles.recentHeader}>
              <div>
                <h3 className={`${styles.recentTitle} font-editorial`}>Recent Meetings</h3>
                <p className={styles.recentSubtitle}>Rooms you have hosted or participated in recently.</p>
              </div>
            </div>
            {historyLoading ? (
              <p className="font-tech" style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>Loading history...</p>
            ) : history.length === 0 ? (
              <p className="font-tech" style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>No recent meetings found.</p>
            ) : (
              <div className={styles.historyList}>
                {history.map((room) => (
                  <div key={room._id} className={styles.historyItem}>
                    <div className={styles.itemLeft}>
                      <div className={styles.itemInfo}>
                        <h4 className={`${styles.itemTitle} font-editorial italic`}>
                          {room.roomName}
                        </h4>
                        <div className={`${styles.itemMeta} font-tech`}>
                          <span className={styles.metaItem}>
                            <span className={`material-symbols-outlined ${styles.metaIcon}`}>code</span>
                            {room.roomId}
                          </span>
                          <span className={styles.metaItem}>
                            <span className={`material-symbols-outlined ${styles.metaIcon}`}>terminal</span>
                            {room.primaryLanguage}
                          </span>
                          <span className={styles.metaItem}>
                            <span className={`material-symbols-outlined ${styles.metaIcon}`}>calendar_today</span>
                            {new Date(room.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={room.status === 'active' ? styles.badgeActive : styles.badgeInactive}>
                            {room.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <button
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className={styles.deleteBtn}
                        title="Delete Room"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        Delete
                      </button>
                      <button
                        onClick={() => router.push(`/workspace?room=${room.roomId}`)}
                        className={styles.joinBtn}
                      >
                        Join Room Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}


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
    </>
  );
}
