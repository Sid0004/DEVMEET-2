"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import ProfileDropdown from "./ProfileDropdown";
import CommandPalette from "./CommandPalette";
import styles from "./AppNavbar.module.css";

export default function AppNavbar() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className={styles.navbarWrapper}>
        <div className={styles.right}>
          <ProfileDropdown />
        </div>
      </header>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
