"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";

export default function LobbyHeader({ verifiedRoom, onClose }) {
  if (!verifiedRoom) return null;

  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight leading-none">
              {verifiedRoom.roomName || `Room #${verifiedRoom.roomId}`}
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 leading-none">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Code: <span className="font-mono text-gray-300">{verifiedRoom.roomId}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        title="Close Pre-Join Lobby (Esc)"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
