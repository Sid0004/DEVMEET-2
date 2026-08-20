"use client";

import React from "react";
import Avatar from "@/components/Avatar";
import { CheckCircle2, Copy } from "lucide-react";

export default function WorkspaceSection({
  user,
  copiedInvite,
  setCopiedInvite,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          Workspace Tenancy & Members
        </span>
        <span className="text-[11px] font-mono text-neutral-400">ORGANIZATION</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold tracking-wider">
              Active Workspace
            </div>
            <h3 className="text-base font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
              {user?.organizations?.[0]?.name || `${user?.fullName || user?.username}'s Workspace`}
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Slug: /{user?.organizations?.[0]?.slug || "team"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(`${window.location.origin}/signup?org=${user?.organizations?.[0]?.slug || "team"}`);
                setCopiedInvite(true);
                setTimeout(() => setCopiedInvite(false), 3000);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            {copiedInvite ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedInvite ? "Copied Invite Link" : "Copy Invite Link"}</span>
          </button>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-3 block">
            Workspace Members
          </span>
          <div className="border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
            <div className="p-3.5 flex items-center justify-between bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar} name={user?.fullName || user?.username} size={36} />
                <div>
                  <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                    {user?.fullName || user?.username} (You)
                  </div>
                  <div className="text-xs text-neutral-400 font-mono">{user?.email}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                Owner & Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
