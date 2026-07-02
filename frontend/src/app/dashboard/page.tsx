'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileCode2, Terminal, Plus, ArrowRight, Settings2, Sparkles, Loader2, Play, Trash2 } from 'lucide-react';
import styles from './dashboard.module.css';
import { apiRequest } from '../../lib/api';
import { useAppSelector } from '@/redux/hooks';
import Sidebar from '../components/Sidebar';

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

  // Creation Flow States
  const [creationStep, setCreationStep] = useState<'idle' | 'env' | 'config'>('idle');
  const [primaryLanguage, setPrimaryLanguage] = useState("TypeScript");
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [loaderText, setLoaderText] = useState("Preparing workspace environment...");

  // Join Flow State
  const [isJoinFocused, setIsJoinFocused] = useState(false);

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
        const response = await apiRequest<{ data: RoomHistory[] }>('/api/v1/rooms/history', { method: 'GET' });
        if (response.data) setHistory(response.data);
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
      await apiRequest(`/api/v1/rooms/${roomId}/delete`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((room) => room.roomId !== roomId));
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
        body: JSON.stringify({ roomName, primaryLanguage, roomSettings: { interviewMode: isInterviewMode } })
      });
      const newRoomId = response.data?.roomId;
      setTimeout(() => {
        router.push(`/workspace?room=${newRoomId}`);
      }, 3000); // Give time for the cool animation
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
      await apiRequest<{ data: unknown }>(`/api/v1/rooms/${joinCode.trim()}/join`, { method: 'POST' });
      setTimeout(() => {
        router.push(`/workspace?room=${joinCode.trim()}`);
      }, 1000);
    } catch (error) {
      setLoading(false);
      const err = error as { message?: string };
      alert("Failed to join room: " + (err.message || "Unknown error"));
    }
  };

  // Environment Cards
  const envOptions = [
    { id: 'TypeScript', icon: <FileCode2 />, color: '#3178C6' },
    { id: 'JavaScript', icon: <FileCode2 />, color: '#F7DF1E' },
    { id: 'Python', icon: <Terminal />, color: '#3776AB' },
  ];

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className={styles.loaderOverlay}
          >
            <div className={styles.loaderContainer}>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className={styles.spinnerIcon}
              >
                <Loader2 size={48} color="var(--color-secondary)" />
              </motion.div>
              <h3 className={`${styles.loaderTitle} font-editorial`}>Provisioning Environment</h3>
              <p className={`${styles.loaderText} font-tech`}>{loaderText}</p>
              
              {/* Animated Progress Bar */}
              <div className={styles.progressBarContainer}>
                <motion.div 
                  className={styles.progressBarFill}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.layout}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <main className={styles.mainCanvas} style={{ marginLeft: sidebarCollapsed ? '64px' : '260px' }}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <motion.span 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`${styles.headerKicker} font-tech`}
              >
                Welcome back, {user?.fullName || user?.username || 'Architect'}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className={`${styles.headline} font-editorial`}
              >
                Collaborate with <span style={{ color: 'var(--color-secondary)' }}>DevMeet</span> and Intent.
              </motion.h2>
            </div>
          </header>

          {activeTab === 'rooms' ? (
            <div className={styles.bentoGrid}>
              
              {/* Animated Create Room Flow */}
              <motion.section 
                layout
                className={styles.createRoomCard}
                style={{ overflow: 'hidden' }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconCircle}>
                    <Sparkles size={24} />
                  </div>
                  <h3 className={`${styles.cardTitle} font-editorial italic`}>Create Workspace</h3>
                </div>

                <AnimatePresence mode="wait">
                  {creationStep === 'idle' && (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className={styles.idleStateContainer}
                    >
                      <p className={styles.stepDescription}>Spin up a secure, containerized environment in seconds.</p>
                      <button className={styles.startCreateBtn} onClick={() => setCreationStep('env')}>
                        <Plus size={20} />
                        <span className="font-tech">New Environment</span>
                      </button>
                    </motion.div>
                  )}

                  {creationStep === 'env' && (
                    <motion.div 
                      key="env"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    >
                      <p className={styles.stepDescription}>Select your primary runtime language.</p>
                      <div className={styles.envGrid}>
                        {envOptions.map(env => (
                          <div 
                            key={env.id}
                            className={`${styles.envCard} ${primaryLanguage === env.id ? styles.envCardActive : ''}`}
                            onClick={() => setPrimaryLanguage(env.id)}
                            style={{ '--accent-color': env.color } as React.CSSProperties}
                          >
                            <div className={styles.envIcon}>{env.icon}</div>
                            <span className="font-tech">{env.id}</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                        <button className={styles.secondaryBtn} onClick={() => setCreationStep('idle')}>Cancel</button>
                        <button className={styles.submitBtn} onClick={() => setCreationStep('config')}>
                          Next <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {creationStep === 'config' && (
                    <motion.form 
                      key="config"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleCreateRoom}
                    >
                      <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                        <label className="font-tech">Workspace Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Core Architecture Pairing"
                          className={styles.inputField}
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          autoFocus
                          required
                        />
                      </div>

                      <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
                        <label className="font-tech">Workspace Mode</label>
                        <div className={styles.modeToggleCard} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                          <div className={styles.modeToggleInfo}>
                            <Settings2 size={20} color="var(--color-outline-variant)" />
                            <div>
                              <span className={`${styles.switchLabel} font-tech`}>
                                Interview Assessment Mode <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-surface-variant)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', color: 'var(--color-smoke)' }}>Coming Soon</span>
                              </span>
                              <p className={styles.modeHint}>Enable monitoring and restrict clipboard access.</p>
                            </div>
                          </div>
                          <div className={`${styles.toggleSwitch}`} />
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button type="button" className={styles.secondaryBtn} onClick={() => setCreationStep('env')}>Back</button>
                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                          <Play size={16} fill="currentColor" />
                          <span className="font-tech">Launch</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* Animated Join Room Section */}
              <motion.section 
                layout
                className={`${styles.joinRoomCard} ${isJoinFocused ? styles.joinRoomCardActive : ''}`}
              >
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <h3 className={`${styles.joinTitle} font-editorial`}>Join Session</h3>
                  <p className={styles.joinDescription}>Enter your unique 6-digit access code.</p>
                  <form className={styles.joinInputBox} onSubmit={handleJoinRoom}>
                    <input
                      type="text"
                      placeholder="Room Code"
                      className={`${styles.joinInput} font-tech`}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      onFocus={() => setIsJoinFocused(true)}
                      onBlur={() => setIsJoinFocused(false)}
                      required
                    />
                    <button type="submit" disabled={loading} className={styles.enterRoomBtn}>
                      <ArrowRight size={20} />
                    </button>
                  </form>
                </div>
              </motion.section>
            </div>
          ) : (
            /* History Section remains similar but with motion */
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.recentActivity}>
              <div className={styles.recentHeader}>
                <div>
                  <h3 className={`${styles.recentTitle} font-editorial`}>Session Archives</h3>
                  <p className={styles.recentSubtitle}>Past workspaces and interviews.</p>
                </div>
              </div>
              {historyLoading ? (
                <p className="font-tech text-sm text-gray-500">Loading archives...</p>
              ) : history.length === 0 ? (
                <div className={styles.emptyState}>
                  <Code2 size={48} color="var(--color-outline-variant)" />
                  <p className="font-tech">No sessions found.</p>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {history.map((room, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      key={room._id} className={styles.historyItem}
                    >
                      <div className={styles.itemLeft}>
                        <div className={styles.itemInfo}>
                          <h4 className={`${styles.itemTitle} font-editorial italic`}>{room.roomName}</h4>
                          <div className={`${styles.itemMeta} font-tech`}>
                            <span className={styles.metaItem}>{room.roomId}</span>
                            <span className={styles.metaItem}>{room.primaryLanguage}</span>
                            <span className={styles.metaItem}>
                              {new Date(room.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.itemRight} style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleDeleteRoom(room.roomId)} 
                          style={{ color: '#ef4444', marginRight: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }} 
                          title="Delete Room"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => router.push(`/workspace?room=${room.roomId}`)} className={styles.joinBtn}>
                          Rejoin
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

        </main>
      </div>
    </>
  );
}
