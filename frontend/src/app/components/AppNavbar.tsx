'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <Image
          src="/devmeet_logo.png"
          alt="DevMeet Logo"
          width={28}
          height={28}
          style={{ borderRadius: '4px' }}
        />
        <span>DevMeet</span>
      </Link>

      <div className={styles.right}>
        <ProfileDropdown />
      </div>
    </nav>
  );
}
