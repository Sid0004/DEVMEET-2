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
  const [activeTab, setActiveTab] = useState<'appearance' | 'account'>('appearance');

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
        </main>
      </div>
    </div>
  );
}
