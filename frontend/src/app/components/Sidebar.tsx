'use client';

import React from 'react';
import styles from './Sidebar.module.css';

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
  setSidebarCollapsed
}: SidebarProps) {
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
          <span className={styles.navItem}>
            <span className="material-symbols-outlined">notes</span>
            {!sidebarCollapsed && <span className="font-tech">Saved Notes</span>}
          </span>
        </nav>
      </div>
    </aside>
  );
}
