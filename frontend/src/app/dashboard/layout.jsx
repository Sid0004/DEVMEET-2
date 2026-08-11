"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#e3e3e3] w-full relative">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main
        className="w-full min-h-screen transition-[padding-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pr-8 pt-4 pb-6"
        style={{ paddingLeft: sidebarCollapsed ? "84px" : "276px" }}
      >
        {children}
      </main>
    </div>
  );
}
