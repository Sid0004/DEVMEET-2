"use client";

import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNavbar />
      <div className="pt-14 flex">
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <main
          className="flex-1 w-full min-h-[calc(100vh-3.5rem)] transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? "64px" : "256px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
