"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import Avatar from "@/components/Avatar";
import {
  Home,
  Users,
  Folders,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Headphones,
} from "lucide-react";

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Sessions", href: "/dashboard/rooms", icon: Folders },
    { name: "Collaborators", href: "/dashboard/teams", icon: Users },
    { name: "Scheduled", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 h-screen border-r flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
      style={{
        backgroundColor: sidebarCollapsed
          ? "rgba(19, 19, 21, 0)"
          : "rgba(19, 19, 21, 1)",
        borderColor: sidebarCollapsed
          ? "rgba(255, 255, 255, 0)"
          : "rgba(255, 255, 255, 0.1)",
        boxShadow: sidebarCollapsed
          ? "none"
          : "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
      }}
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
              <span className="font-bold text-white text-lg tracking-tight">
                DevMeet
              </span>
            </Link>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.12] rounded-full transition-colors flex-shrink-0"
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
            className="w-full flex items-center justify-center py-3 text-gray-400 hover:text-white transition-colors"
            title="Expand sidebar"
          >
            {isLogoHovered ? (
              <PanelLeftOpen className="w-5 h-5 text-blue-400 transition-transform scale-110" />
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
                  ? "bg-[#282a2c] text-white shadow-md border border-white/10"
                  : "text-gray-400 hover:bg-white/[0.1] hover:text-white"
              } ${sidebarCollapsed ? "justify-center px-0 w-11 h-11 mx-auto" : ""}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Settings */}
      <div
        className="p-3 flex items-center justify-between transition-colors duration-300"
        style={{
          borderTopColor: sidebarCollapsed
            ? "rgba(255, 255, 255, 0)"
            : "rgba(255, 255, 255, 0.1)",
          borderTopWidth: sidebarCollapsed ? "0px" : "1px",
        }}
      >
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 p-1.5 rounded-full hover:bg-white/[0.1] transition-colors flex-1 overflow-hidden whitespace-nowrap ${
            sidebarCollapsed ? "justify-center p-0 mx-auto" : ""
          }`}
          title="Settings"
        >
          <Avatar
            src={user?.avatar}
            name={user?.fullName || user?.username || "User"}
            size={32}
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {user?.fullName || user?.username || "User"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-400">
                  Available
                </span>
              </div>
            </div>
          )}
        </Link>
        {!sidebarCollapsed && (
          <Link
            href="/dashboard/settings"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.1] rounded-full transition-colors flex-shrink-0"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
}
