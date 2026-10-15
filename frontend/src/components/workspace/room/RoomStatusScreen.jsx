"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lock, LogOut, RefreshCw, Home, ShieldAlert } from "lucide-react";

/**
 * Premium Brutalist Room Status Screen
 * Replaces crude window.alert() with professional full-screen states
 * for: 'not-found', 'locked', 'ended', 'error'
 */
export default function RoomStatusScreen({
  status = "error",
  message = "",
  roomId = "",
  onRetry = null,
  isGuest = false,
}) {
  const router = useRouter();

  const configs = {
    "not-found": {
      icon: <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />,
      badge: "404 • Not Found",
      badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      title: "Workspace Not Found",
      description:
        message ||
        `The session code "${roomId}" does not exist, has expired, or was entered incorrectly. Verify the link with your team.`,
      primaryAction: {
        label: isGuest ? "Back to DevMeet Home" : "Go to Dashboard",
        href: isGuest ? "/" : "/dashboard",
      },
    },
    locked: {
      icon: <Lock className="w-10 h-10 text-blue-400 mb-2" />,
      badge: "Access Restricted",
      badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
      title: "This Room is Locked",
      description:
        message ||
        "The host has locked this workspace. New participants cannot enter until the host unlocks the session.",
      primaryAction: {
        label: isGuest ? "Return Home" : "Back to Dashboard",
        href: isGuest ? "/" : "/dashboard",
      },
    },
    ended: {
      icon: <LogOut className="w-10 h-10 text-neutral-400 mb-2" />,
      badge: "Session Concluded",
      badgeColor: "border-neutral-700 text-neutral-300 bg-neutral-800/40",
      title: "Meeting Has Ended",
      description:
        message ||
        "The host has officially ended this DevMeet session. All collaborative assets and files have been archived.",
      primaryAction: {
        label: isGuest ? "Back to DevMeet Home" : "Return to Dashboard",
        href: isGuest ? "/" : "/dashboard",
      },
    },
    error: {
      icon: <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />,
      badge: "Connection Error",
      badgeColor: "border-rose-500/30 text-rose-400 bg-rose-500/10",
      title: "Unable to Join Room",
      description:
        message ||
        "An unexpected error occurred while establishing connection to this collaborative workspace.",
      primaryAction: {
        label: isGuest ? "Return Home" : "Back to Dashboard",
        href: isGuest ? "/" : "/dashboard",
      },
    },
  };

  const config = configs[status] || configs["error"];

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-neutral-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono selection:bg-neutral-800">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/60 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f230d_1px,transparent_1px),linear-gradient(to_bottom,#1f1f230d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 max-w-md w-full bg-neutral-900/90 border border-neutral-800/90 rounded-none p-8 shadow-2xl backdrop-blur-xl">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 border ${config.badgeColor}`}
          >
            {config.badge}
          </div>
          {roomId && (
            <span className="text-[11px] text-neutral-500 border border-neutral-800 px-2 py-0.5">
              ROOM: {roomId}
            </span>
          )}
        </div>

        {/* Icon & Title */}
        <div className="mb-4">
          {config.icon}
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">
            {config.title}
          </h1>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-400 leading-relaxed mb-8">
          {config.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full h-10 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-neutral-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Reconnecting
            </button>
          )}

          <Link
            href={config.primaryAction.href}
            className="w-full h-10 flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            {config.primaryAction.label}
          </Link>
        </div>

        {/* Footer brand stamp */}
        <div className="mt-8 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-600">
          <span>DEVMEET CORE ENGINE</span>
          <span>SYSTEM STATE: {status.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
