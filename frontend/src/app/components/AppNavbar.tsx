'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import ProfileDropdown from './ProfileDropdown';
import styles from './AppNavbar.module.css';

export default function AppNavbar() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <nav className={styles.navbar}>
      <Link
        href={isAuthenticated ? '/dashboard' : '/'}
        className={`${styles.logo} font-editorial`}
      >
        DevMeet
      </Link>

      <div className={styles.right}>
        <ProfileDropdown />
      </div>
    </nav>
  );
}
