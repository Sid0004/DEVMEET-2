'use client';

import React from 'react';
import styles from './Sidebar.module.css';
import Avatar from '@/components/Avatar';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/features/authSlice';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

interface SidebarProps {
  activeTab: 'rooms' | 'history';
  setActiveTab: (tab: 'rooms' | 'history') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
}: SidebarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await apiRequest('/api/v1/users/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Toggle button */}
      <div className={styles.sidebarToggleRow}>
        <button
          className={styles.toggleBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined">
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className={styles.sidebarContent}>
        <nav className={styles.navMenu}>
          <span
            className={activeTab === 'rooms' ? styles.navItemActive : styles.navItem}
            onClick={() => setActiveTab('rooms')}
          >
            <span className="material-symbols-outlined">meeting_room</span>
            {!sidebarCollapsed && <span className="font-tech">Rooms</span>}
          </span>
          <span
            className={activeTab === 'history' ? styles.navItemActive : styles.navItem}
            onClick={() => setActiveTab('history')}
          >
            <span className="material-symbols-outlined">history</span>
            {!sidebarCollapsed && <span className="font-tech">Recent Meetings</span>}
          </span>
        </nav>
      </div>

      {/* User profile + sign-out at bottom */}
      {/* <div className={sidebarCollapsed ? styles.sidebarFooterCollapsed : styles.sidebarFooter}>
        {!sidebarCollapsed ? (
          <div className={styles.userCard}>
            <Avatar
              src={user?.avatarUrl ?? null}
              name={user?.fullName || user?.username || 'User'}
              size={36}
            />
            <div className={styles.userInfo}>
              <span className={`${styles.userName} font-tech`}>
                {user?.fullName || user?.username || 'User'}
              </span>
              <span className={`${styles.userEmail} font-tech`}>
                {user?.email || ''}
              </span>
            </div>
            <button
              className={styles.signOutIconBtn}
              onClick={handleSignOut}
              title="Sign out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        ) : (
          <button
            className={styles.signOutIconBtn}
            onClick={handleSignOut}
            title="Sign out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        )}
      </div> */}
    </aside>
  );
}
