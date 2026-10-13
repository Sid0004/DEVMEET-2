"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { Video } from "lucide-react";
import { apiRequest } from "@/lib/api";
import DevmeetConnectIllustration from "../components/DevmeetConnectIllustration";
import InlineCodeJoinBar from "../components/InlineCodeJoinBar";

export default function DashboardOverview() {
  const { user } = useAppSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Fetch History on Mount
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
        if (!error?.message?.includes("Session expired") && !error?.message?.includes("not logged in")) {
          console.error("Failed to fetch history:", error);
        }
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-110px)] flex flex-col items-center justify-center my-auto text-neutral-900 dark:text-white py-4">
      {/* HERO CONNECT ILLUSTRATION SECTION */}
      {!isSearchExpanded && (
        <div className="text-center flex flex-col items-center justify-center mb-8 overflow-hidden">
          <div
            className="relative mb-6 select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Protection Overlay Shield */}
            <div
              className="absolute inset-0 z-10 bg-transparent"
              onContextMenu={(e) => e.preventDefault()}
            />
            <DevmeetConnectIllustration className="w-[440px] sm:w-[500px] md:w-[560px] max-w-full h-auto mb-4" />
          </div>

          <h3 className="text-[30px] sm:text-[34px] font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">
            Connect with someone you know
          </h3>
          <p className="text-[15px] sm:text-[16px] text-neutral-500 dark:text-gray-400 max-w-lg font-normal mb-3">
            Connect, collaborate and code together from anywhere with DevMeet
          </p>
        </div>
      )}

      {/* ACTION CONTROLS BELOW ILLUSTRATION: Search Bar + New Session Button */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-center gap-4 w-full ${
          isSearchExpanded ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        {/* Inline Expandable Code & Link Search Bar */}
        <InlineCodeJoinBar onExpandChange={setIsSearchExpanded} />

        {!isSearchExpanded && (
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2.5 px-6 h-12 rounded-none bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm transition-all border border-[#1a73e8] shadow-sm active:scale-[0.98] flex-shrink-0 cursor-pointer"
          >
            <Video className="w-4 h-4 text-white" />
            <span>New Session</span>
          </Link>
        )}
      </div>
    </div>
  );
}
