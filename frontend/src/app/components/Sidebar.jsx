"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { apiRequest } from "@/lib/api";
import Avatar from "@/components/Avatar";
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

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Sessions", href: "/dashboard/rooms", icon: Folders },
    { name: "Collaborators", href: "/dashboard/teams", icon: Users },
    { name: "Scheduled", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 h-screen border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#131315] flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header: Logo + Toggle */}
      <div className="h-20 px-3 flex items-center justify-between flex-shrink-0">
        {!sidebarCollapsed ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-1 whitespace-nowrap overflow-hidden"
            >
              <Image
                src="/devmeet_logo.png"
                alt="DevMeet Logo"
                width={26}
                height={26}
                className="rounded-md flex-shrink-0"
              />
              <span className="font-bold text-neutral-900 dark:text-white text-lg tracking-tight">
                DevMeet
              </span>
            </Link>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.12] rounded-full transition-colors flex-shrink-0 cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(false)}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            className="w-full flex items-center justify-center py-3 text-neutral-500 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            {isLogoHovered ? (
              <PanelLeftOpen className="w-5 h-5 text-blue-500 transition-transform scale-110" />
            ) : (
              <Image
                src="/devmeet_logo.png"
                alt="DevMeet Logo"
                width={24}
                height={24}
                className="rounded-md"
              />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 flex flex-col gap-1.5 overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all text-sm font-medium whitespace-nowrap overflow-hidden ${
                isActive
                  ? "bg-neutral-100 text-neutral-900 shadow-sm border border-neutral-200 dark:bg-[#282a2c] dark:text-white dark:border-white/10 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-gray-400 dark:hover:bg-white/[0.1] dark:hover:text-white"
              } ${sidebarCollapsed ? "justify-center px-0 w-11 h-11 mx-auto" : ""}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Settings / Logout */}
      <div className={`p-2.5 border-t border-neutral-200 dark:border-white/10 flex items-center transition-colors duration-300 ${
        sidebarCollapsed ? "flex-col gap-2" : "justify-between gap-1.5"
      }`}>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/[0.1] transition-colors overflow-hidden whitespace-nowrap ${
            sidebarCollapsed ? "justify-center p-0 mx-auto" : "flex-1 min-w-0"
          }`}
          title="Account Settings"
        >
          <Avatar
            src={user?.avatar}
            name={user?.fullName || user?.username || "User"}
            size={32}
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                {user?.fullName || user?.username || "User"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Available
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Action buttons: Settings & Logout */}
        <div className={`flex items-center gap-1 ${sidebarCollapsed ? "flex-col" : ""}`}>
          {!sidebarCollapsed && (
            <Link
              href="/dashboard/settings"
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.1] rounded-full transition-colors flex-shrink-0"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-full transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
            title="Log out"
            aria-label="Log out"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
