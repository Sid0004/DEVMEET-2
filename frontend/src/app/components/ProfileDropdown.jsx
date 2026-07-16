"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuHeading,
  MenuSeparator,
} from "@headlessui/react";
import styles from "./ProfileDropdown.module.css";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { apiRequest } from "../../lib/api";
import Avatar from "@/components/Avatar";

export default function ProfileDropdown() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await apiRequest("/api/v1/users/logout", { method: "POST" });
    } catch {
      // proceed regardless
    } finally {
      dispatch(logout());
      router.push("/");
    }
  };

  const displayName = user?.fullName || user?.username || "User";

  return (
    <Menu>
      {/* ── Trigger ── */}
      <MenuButton
        className={styles.profileCircle}
        title={user ? "Account menu" : "Login"}
      >
        {user ? (
          <Avatar src={user?.avatarUrl ?? null} name={displayName} size={32} />
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.25rem" }}
          >
            account_circle
          </span>
        )}
      </MenuButton>

      {/* ── Dropdown ── */}
      <MenuItems
        anchor={{ to: "bottom end", gap: "8px" }}
        transition
        className={styles.menuItems}
      >
        {user ? (
          <>
            {/* User info header */}
            <div className={styles.profileHeader}>
              <Avatar
                src={user?.avatarUrl ?? null}
                name={displayName}
                size={40}
              />
              <div>
                <p className={styles.profileName}>
                  {user.fullName || user.username || "DevMeet User"}
                </p>
                <p className={styles.profileEmail}>{user.email || ""}</p>
              </div>
            </div>

            <MenuSeparator className={styles.separator} />

            {/* Navigation */}
            <MenuSection>
              <MenuHeading className={styles.menuHeading}>
                Workspace
              </MenuHeading>
              <MenuItem>
                <Link href="/dashboard" className={styles.menuItem}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.1rem" }}
                  >
                    dashboard
                  </span>
                  Dashboard
                </Link>
              </MenuItem>
            </MenuSection>

            <MenuSeparator className={styles.separator} />

            {/* Account actions */}
            <MenuSection>
              <MenuHeading className={styles.menuHeading}>Account</MenuHeading>
              <MenuItem>
                <Link href="/dashboard/settings" className={styles.menuItem}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.1rem" }}
                  >
                    settings
                  </span>
                  Settings
                </Link>
              </MenuItem>
            </MenuSection>

            <MenuSeparator className={styles.separator} />

            {/* Sign out */}
            <MenuItem>
              <button
                onClick={handleLogout}
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.1rem" }}
                >
                  logout
                </span>
                Sign Out
              </button>
            </MenuItem>
          </>
        ) : (
          <>
            <div
              className={styles.profileHeader}
              style={{ paddingBottom: "0.75rem" }}
            >
              <p className={styles.profileName}>Welcome to DevMeet</p>
              <p className={styles.profileEmail}>
                Collaborative coding, reimagined
              </p>
            </div>

            <MenuSeparator className={styles.separator} />

            <MenuItem>
              <Link href="/login" className={styles.menuItem}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.1rem" }}
                >
                  login
                </span>
                Login
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/signup" className={styles.menuItem}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.1rem" }}
                >
                  person_add
                </span>
                Sign Up
              </Link>
            </MenuItem>
          </>
        )}
      </MenuItems>
    </Menu>
  );
}
