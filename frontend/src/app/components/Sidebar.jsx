"use client";

import React from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Folders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await apiRequest("/api/v1/users/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Teams", href: "/dashboard/teams", icon: Users },
    { name: "Workspaces", href: "/dashboard/rooms", icon: Folders },
  ];

  return (
    <aside
      className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-all duration-300 z-40 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center p-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
