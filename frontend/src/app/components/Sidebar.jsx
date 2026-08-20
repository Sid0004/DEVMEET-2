"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { apiRequest } from "@/lib/api";
import Avatar from "@/components/Avatar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Home,
  Users,
  Folders,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("/api/v1/users/logout", { method: "POST" });
    } catch {
      // Proceed with local logout regardless of network error
    }
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.removeItem("devmeet-token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const [pendingNavHref, setPendingNavHref] = useState(null);

  const handleNavClick = (e, href) => {
    if (pathname === href) return;

    if (typeof window !== "undefined" && window.__devmeet_unsaved_settings) {
      if (pendingNavHref === href) {
        // Second click: proceed with navigation
        window.__devmeet_unsaved_settings = false;
        setPendingNavHref(null);
      } else {
        // First click: prevent navigation and trigger Discard button wobble!
        e.preventDefault();
        setPendingNavHref(href);
        window.dispatchEvent(new CustomEvent("devmeet:wobble_discard"));
        setTimeout(() => setPendingNavHref(null), 3000);
      }
    } else {
      setPendingNavHref(null);
    }
  };

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Sessions", href: "/dashboard/rooms", icon: Folders },
    { name: "Collaborators", href: "/dashboard/teams", icon: Users },
    { name: "Scheduled", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 h-screen border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header: Logo + Toggle */}
      <div className="h-16 px-3.5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        {!sidebarCollapsed ? (
          <>
            <Link
              href="/dashboard"
              onClick={(e) => handleNavClick(e, "/dashboard")}
              className="flex items-center gap-2.5 px-1 whitespace-nowrap overflow-hidden"
            >
              <Image
                src="/devmeet_logo.png"
                alt="DevMeet Logo"
                width={24}
                height={24}
                className="rounded-none flex-shrink-0"
              />
              <span className="font-mono font-bold uppercase text-neutral-900 dark:text-white text-sm tracking-wider">
                DevMeet
              </span>
            </Link>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800 transition-colors flex-shrink-0 cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(false)}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            className="w-full flex items-center justify-center py-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            {isLogoHovered ? (
              <PanelLeftOpen className="w-5 h-5 text-blue-500 transition-transform scale-110" />
            ) : (
              <Image
                src="/devmeet_logo.png"
                alt="DevMeet Logo"
                width={22}
                height={22}
                className="rounded-none"
              />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 flex flex-col gap-1.5 overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-none transition-all text-xs font-mono uppercase tracking-wider whitespace-nowrap overflow-hidden border ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-bold shadow-xs"
                  : "bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white hover:border-neutral-200 dark:hover:border-neutral-800"
              } ${sidebarCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : ""}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Theme / Settings / Logout */}
      <div
        className={`p-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/60 flex items-center transition-colors duration-300 ${
          sidebarCollapsed ? "flex-col gap-2" : "justify-between gap-1.5"
        }`}
      >
        <Link
          href="/dashboard/settings"
          onClick={(e) => handleNavClick(e, "/dashboard/settings")}
          className={`flex items-center gap-2.5 p-1.5 rounded-none border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors overflow-hidden whitespace-nowrap ${
            sidebarCollapsed ? "justify-center p-0 mx-auto" : "flex-1 min-w-0"
          }`}
          title="Account Settings"
        >
          <div className="border border-neutral-200 dark:border-neutral-700 shrink-0">
            <Avatar
              src={user?.avatar}
              name={user?.fullName || user?.username || "User"}
              size={28}
            />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white truncate">
                {user?.fullName || user?.username || "User"}
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate font-mono">
                @{user?.username || (user?.email ? user.email.split("@")[0] : "user")}
              </span>
            </div>
          )}
        </Link>

        {/* Action buttons: Theme Toggler, Settings, and Logout */}
        <div className={`flex items-center gap-1 ${sidebarCollapsed ? "flex-col" : ""}`}>
          <AnimatedThemeToggler
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none transition-colors flex-shrink-0 cursor-pointer shadow-none bg-transparent"
            title="Toggle theme"
          />

          {!sidebarCollapsed && (
            <Link
              href="/dashboard/settings"
              onClick={(e) => handleNavClick(e, "/dashboard/settings")}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none transition-colors flex-shrink-0 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 border border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-800 rounded-none transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
            title="Log out"
            aria-label="Log out"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
