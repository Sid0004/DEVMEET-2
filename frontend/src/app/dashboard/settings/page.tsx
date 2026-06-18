'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCredentials, logout } from '@/redux/features/authSlice';
import { apiRequest } from '../../../lib/api';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'preferences'>('appearance');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Editor & Collaboration Preferences
  const [editorFontSize, setEditorFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_editor_font_size');
      return saved ? parseInt(saved, 10) : 14;
    }
    return 14;
  });

  const [editorTabSize, setEditorTabSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_editor_tab_size');
      return saved ? parseInt(saved, 10) : 2;
    }
    return 2;
  });

  const [editorMinimap, setEditorMinimap] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_editor_minimap');
      return saved ? saved === 'true' : false;
    }
    return false;
  });

  const [editorWordWrap, setEditorWordWrap] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_editor_word_wrap');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  const [editorLineNumbers, setEditorLineNumbers] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_editor_line_numbers');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  const [muteOnJoin, setMuteOnJoin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_call_mute_on_join');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  const [cameraOffOnJoin, setCameraOffOnJoin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_call_camera_off_on_join');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  const [soundNotifications, setSoundNotifications] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devmeet_notifications_sound');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSuccess(null);

    localStorage.setItem('devmeet_editor_font_size', editorFontSize.toString());
    localStorage.setItem('devmeet_editor_tab_size', editorTabSize.toString());
    localStorage.setItem('devmeet_editor_minimap', editorMinimap.toString());
    localStorage.setItem('devmeet_editor_word_wrap', editorWordWrap.toString());
    localStorage.setItem('devmeet_editor_line_numbers', editorLineNumbers.toString());
    localStorage.setItem('devmeet_call_mute_on_join', muteOnJoin.toString());
    localStorage.setItem('devmeet_call_camera_off_on_join', cameraOffOnJoin.toString());
    localStorage.setItem('devmeet_notifications_sound', soundNotifications.toString());

    setPrefSuccess('Workspace preferences saved successfully!');
    setTimeout(() => setPrefSuccess(null), 3000);
  };

  // Submit Profile Form
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const response = await apiRequest<{ data: any }>('/api/v1/users/update-profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName, username }),
      });

      if (response.data) {
        dispatch(setCredentials({ user: response.data }));
        setProfileSuccess('Profile updated successfully.');
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit Password Form
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      await apiRequest('/api/v1/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      setPasswordSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await apiRequest('/api/v1/users/logout', { method: 'POST' });
    } catch {
      // proceed regardless
    } finally {
      dispatch(logout());
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      {/* Back button */}
      <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Dashboard
      </button>

      {/* Header title */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>System Settings</h1>
        <p className={styles.subtitle}>Configure your preferences and account security.</p>
      </div>

      <div className={styles.layout}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`${styles.tabBtn} ${activeTab === 'appearance' ? styles.activeTabBtn : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>palette</span>
            <span>Appearance</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`${styles.tabBtn} ${activeTab === 'account' ? styles.activeTabBtn : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>security</span>
            <span>Profile & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.activeTabBtn : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>settings</span>
            <span>Workspace & Calls</span>
          </button>
          
          <div className={styles.actionSeparator}></div>
          
          <button onClick={handleSignOut} className={styles.signOutSidebarBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Dynamic content cards */}
        <main className={styles.contentArea}>
          {activeTab === 'appearance' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Theme Options</h2>
                <p className={styles.cardSubtitle}>Select how DevMeet should look on your device.</p>
              </div>

              <div className={styles.themeGrid}>
                <div
                  onClick={() => setTheme('light')}
                  className={`${styles.themeTile} ${theme === 'light' ? styles.activeThemeTile : ''}`}
                >
                  <span className={`material-symbols-outlined ${styles.tileIcon}`}>light_mode</span>
                  <span className={styles.tileLabel}>Light</span>
                </div>
                <div
                  onClick={() => setTheme('dark')}
                  className={`${styles.themeTile} ${theme === 'dark' ? styles.activeThemeTile : ''}`}
                >
                  <span className={`material-symbols-outlined ${styles.tileIcon}`}>dark_mode</span>
                  <span className={styles.tileLabel}>Dark</span>
                </div>
                <div
                  onClick={() => setTheme('system')}
                  className={`${styles.themeTile} ${theme === 'system' ? styles.activeThemeTile : ''}`}
                >
                  <span className={`material-symbols-outlined ${styles.tileIcon}`}>settings_suggest</span>
                  <span className={styles.tileLabel}>System</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'account' && (
            <>
              {/* Profile card */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Profile Information</h2>
                  <p className={styles.cardSubtitle}>Update your display name and login username.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Username</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. janedoe"
                        required
                      />
                    </div>
                  </div>

                  {profileSuccess && (
                    <div className={styles.statusMessage + ' ' + styles.successMessage}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span>
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className={styles.statusMessage + ' ' + styles.errorMessage}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className={styles.buttonContainer}>
                    <button
                      type="submit"
                      disabled={profileLoading || (fullName === user?.fullName && username === user?.username)}
                      className={styles.saveBtn}
                    >
                      <span>{profileLoading ? 'Saving Changes...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              </section>

              {/* Password change card */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Change Password</h2>
                  <p className={styles.cardSubtitle}>Keep your account secure by modifying your password regularly.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Current Password</label>
                    <input
                      type="password"
                      className={styles.inputField}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>New Password</label>
                      <input
                        type="password"
                        className={styles.inputField}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        className={styles.inputField}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {passwordSuccess && (
                    <div className={styles.statusMessage + ' ' + styles.successMessage}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span>
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className={styles.statusMessage + ' ' + styles.errorMessage}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className={styles.buttonContainer}>
                    <button
                      type="submit"
                      disabled={passwordLoading || !oldPassword || !newPassword || !confirmPassword}
                      className={styles.saveBtn}
                    >
                      <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </section>

              {/* Session Account Details card */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Account Metadata</h2>
                  <p className={styles.cardSubtitle}>Core information associated with your collaborative identity.</p>
                </div>

                <div className={styles.form}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email Address</span>
                    <span className={styles.detailValue}>{user?.email || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>User ID</span>
                    <span className={styles.detailValue} style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {user?.id || user?._id || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Authentication Status</span>
                    <span className={styles.detailValue} style={{ color: 'var(--color-secondary)' }}>
                      Active Session
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'preferences' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Workspace & Meeting Preferences</h2>
                <p className={styles.cardSubtitle}>Customize your coding workspace editor and default meeting connection behaviors.</p>
              </div>

              <form onSubmit={handleSavePreferences} className={styles.form}>
                
                {/* Editor preferences subsection */}
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  Code Editor Settings
                </h3>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Editor Font Size</label>
                    <select
                      value={editorFontSize}
                      onChange={(e) => setEditorFontSize(parseInt(e.target.value, 10))}
                      className={styles.selectField}
                    >
                      <option value={12}>12 px</option>
                      <option value={14}>14 px</option>
                      <option value={16}>16 px</option>
                      <option value={18}>18 px</option>
                      <option value={20}>20 px</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Tab / Indentation Size</label>
                    <select
                      value={editorTabSize}
                      onChange={(e) => setEditorTabSize(parseInt(e.target.value, 10))}
                      className={styles.selectField}
                    >
                      <option value={2}>2 Spaces</option>
                      <option value={4}>4 Spaces</option>
                      <option value={8}>8 Spaces</option>
                    </select>
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Show Minimap</span>
                    <span className={styles.toggleDesc}>Display a visual outline of code at the right side of the editor canvas.</span>
                  </div>
                  <label className={styles.toggleContainer}>
                    <input
                      type="checkbox"
                      checked={editorMinimap}
                      onChange={(e) => setEditorMinimap(e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Enable Word Wrap</span>
                    <span className={styles.toggleDesc}>Automatically wrap long lines of code to fit within the viewport.</span>
                  </div>
                  <label className={styles.toggleContainer}>
                    <input
                      type="checkbox"
                      checked={editorWordWrap}
                      onChange={(e) => setEditorWordWrap(e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Line Numbers</span>
                    <span className={styles.toggleDesc}>Show line index numbers on the left gutter of the editor.</span>
                  </div>
                  <label className={styles.toggleContainer}>
                    <input
                      type="checkbox"
                      checked={editorLineNumbers}
                      onChange={(e) => setEditorLineNumbers(e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.actionSeparator} style={{ margin: '1rem 0 0.5rem 0' }}></div>

                {/* Call preferences subsection */}
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  Video & Audio Settings
                </h3>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Mute Microphone on Join</span>
                    <span className={styles.toggleDesc}>Always enter audio/video calls with your microphone muted by default.</span>
                  </div>
                  <label className={styles.toggleContainer}>
                    <input
                      type="checkbox"
                      checked={muteOnJoin}
                      onChange={(e) => setMuteOnJoin(e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Disable Camera on Join</span>
                    <span className={styles.toggleDesc}>Always enter audio/video calls with your camera turned off by default.</span>
                  </div>
                  <label className={styles.toggleContainer}>
                    <input
                      type="checkbox"
                      checked={cameraOffOnJoin}
                      onChange={(e) => setCameraOffOnJoin(e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Play Sound Alerts</span>
                    <span className={styles.toggleDesc}>Receive sound chimes when other users join or leave the active workspace room.</span>
                  </div>
                  <label className={styles.toggleContainer}>
                    <input
                      type="checkbox"
                      checked={soundNotifications}
                      onChange={(e) => setSoundNotifications(e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                {prefSuccess && (
                  <div className={styles.statusMessage + ' ' + styles.successMessage}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span>
                    <span>{prefSuccess}</span>
                  </div>
                )}

                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.saveBtn}>
                    <span>Save Preferences</span>
                  </button>
                </div>

              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
