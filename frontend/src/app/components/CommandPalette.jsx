"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderCode, LayoutDashboard, Users, Folders, Settings, ArrowRight, X } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch user rooms
      const fetchRooms = async () => {
        setLoading(true);
        try {
          const res = await apiRequest("/api/v1/rooms/history");
          if (res.data) setRooms(res.data);
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      };
      fetchRooms();
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pageNavigation = [
    { name: "Overview Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
    { name: "All Workspaces", href: "/dashboard/rooms", icon: Folders, category: "Navigation" },
    { name: "Team Members", href: "/dashboard/teams", icon: Users, category: "Navigation" },
    { name: "Account Settings", href: "/dashboard/settings", icon: Settings, category: "Navigation" },
  ];

  const filteredPages = pageNavigation.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRooms = rooms.filter(
    (r) =>
      r.roomName.toLowerCase().includes(query.toLowerCase()) ||
      r.roomId.includes(query)
  );

  const isNumericCode = /^\d{4,6}$/.test(query.trim());

  const handleSelect = (href) => {
    onClose();
    router.push(href);
  };

  const handleJoinDirectCode = () => {
    if (!query.trim()) return;
    onClose();
    router.push(`/workspace?room=${query.trim()}`);
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0d0f17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspaces, pages, or enter 6-digit room code..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {/* Direct Code Join Prompt */}
          {isNumericCode && (
            <button
              onClick={handleJoinDirectCode}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 hover:bg-blue-600/25 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">Join Room #{query.trim()}</span>
              </div>
              <span className="text-xs text-blue-300/70">Press Enter</span>
            </button>
          )}

          {/* Workspaces Matching Search */}
          {filteredRooms.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2 pb-1">
                Workspaces & Sessions
              </span>
              {filteredRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => handleSelect(`/workspace?room=${room.roomId}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FolderCode className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{room.roomName}</p>
                      <p className="text-xs text-gray-500">ID: {room.roomId}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Page Navigation */}
          {filteredPages.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2 pb-1">
                Pages
              </span>
              {filteredPages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.href}
                    onClick={() => handleSelect(page.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{page.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </button>
                );
              })}
            </div>
          )}

          {!loading && filteredPages.length === 0 && filteredRooms.length === 0 && !isNumericCode && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
