"use client";

import React, { useState } from "react";
import { User, LogIn, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import Avatar from "@/components/Avatar";

export default function GuestJoinModal({
  roomId,
  roomInfo,
  onJoinSuccess,
  apiBaseUrl,
}) {
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter your name to join the session.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBaseUrl || ""}/api/v1/rooms/${roomId}/guest-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: guestName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to join session as guest.");
      }

      onJoinSuccess(data.data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white tracking-wider uppercase">DEVMEET SESSION</span>
          </div>
          <span className="text-[11px] text-neutral-500">Room: {roomId}</span>
        </div>

        {/* Room Preview */}
        <div className="mb-6 p-3.5 bg-neutral-900/60 border border-neutral-800/80">
          <h2 className="text-sm font-bold text-white truncate mb-1">
            {roomInfo?.roomName || "Technical Workspace"}
          </h2>
          {roomInfo?.host && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar
                src={roomInfo.host.avatar}
                name={roomInfo.host.fullName || roomInfo.host.username}
                size={22}
              />
              <span className="text-xs text-neutral-400">
                Hosted by{" "}
                <span className="text-neutral-200 font-semibold">
                  {roomInfo.host.fullName || roomInfo.host.username}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              What should colleagues call you?
            </label>
            <div className="relative">
              <input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Alex Morgan"
                disabled={isLoading}
                maxLength={40}
                autoFocus
                className="w-full h-11 px-3.5 bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-none"
              />
              <User className="absolute right-3.5 top-3 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !guestName.trim()}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed rounded-none shadow-sm"
          >
            {isLoading ? (
              <span>Connecting as Guest...</span>
            ) : (
              <>
                <span>Join Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ephemeral guest token (6h)</span>
          </div>
          <a
            href={`/login?redirect=${encodeURIComponent(`/workspace?room=${roomId}`)}`}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline text-[11px]"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign in with account</span>
          </a>
        </div>
      </div>
    </div>
  );
}
