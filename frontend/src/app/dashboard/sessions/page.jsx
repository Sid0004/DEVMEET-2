"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderCode,
  Trash2,
  Search,
  Plus,
  ArrowRight,
  Clock,
  Code2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function SessionsPage() {
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest("/api/v1/rooms/history", {
          method: "GET",
        });
        if (response.data) {
          let cleared = [];
          if (typeof window !== "undefined") {
            try {
              cleared = JSON.parse(
                localStorage.getItem("devmeet_cleared_rooms") || "[]"
              );
            } catch (e) {}
          }
          const filtered = response.data.filter(
            (r) => !cleared.includes(r.roomId) && !cleared.includes(r._id)
          );
          setHistory(filtered);
        }
      } catch (error) {
        if (
          !error?.message?.includes("Session expired") &&
          !error?.message?.includes("not logged in")
        ) {
          console.error("Failed to fetch sessions history:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to remove this session from history?"))
      return;
    try {
      if (typeof window !== "undefined") {
        const cleared = JSON.parse(
          localStorage.getItem("devmeet_cleared_rooms") || "[]"
        );
        cleared.push(roomId);
        localStorage.setItem(
          "devmeet_cleared_rooms",
          JSON.stringify(cleared)
        );
      }
      setHistory((prev) => prev.filter((room) => room.roomId !== roomId));
    } catch (error) {
      alert("Failed to remove session.");
    }
  };

  const filteredHistory = history.filter((room) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (room.roomName || "").toLowerCase().includes(q) ||
      (room.roomId || "").toLowerCase().includes(q) ||
      (room.primaryLanguage || "").toLowerCase().includes(q) ||
      (room.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto text-neutral-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <FolderCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Workspace Sessions</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Search, manage, and rejoin all your past and active coding environments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none pl-9 pr-4 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 w-56 sm:w-64 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500 font-medium"
            />
          </div>

          <Link
            href="/dashboard/new"
            className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-none transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-neutral-500 dark:text-neutral-400 text-xs font-mono">
          Loading sessions...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-none shadow-xs text-center">
          <div className="h-12 w-12 rounded-none bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 mb-4">
            <FolderCode className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-base font-bold mb-1">
            {searchQuery ? "No matching sessions" : "No sessions yet"}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs max-w-sm mb-6">
            {searchQuery
              ? "Try adjusting your search terms or filters."
              : "Launch a new workspace session to collaborate with your team."}
          </p>
          <Link
            href="/dashboard/new"
            className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-none transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Session</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredHistory.map((room) => (
            <div
              key={room._id || room.roomId}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-none hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs gap-4"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-none bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 flex-shrink-0 mt-0.5 sm:mt-0">
                  <FolderCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {room.roomName || "Untitled Workspace"}
                    </h4>
                    {room.status === "active" ? (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-none">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] font-mono rounded-none">
                        Archived
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap font-mono">
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-none text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                      #{room.roomId}
                    </span>
                    {room.primaryLanguage && (
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5" />
                        {room.primaryLanguage}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1 font-sans">
                      <Calendar className="w-3 h-3" />
                      {new Date(room.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDeleteRoom(room.roomId)}
                  className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors cursor-pointer"
                  title="Remove Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/workspace?room=${room.roomId}`)}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold rounded-none transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Enter Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
