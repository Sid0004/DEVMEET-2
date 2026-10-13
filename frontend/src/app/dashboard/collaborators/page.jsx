"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  Users,
  Plus,
  Shield,
  ShieldAlert,
  Building2,
  Mail,
  UserCheck,
  Search,
  Check,
  X,
} from "lucide-react";

export default function CollaboratorsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeOrg, setActiveOrg] = useState("Personal Workspace");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedList, setInvitedList] = useState([]);
  const [searchMember, setSearchMember] = useState("");

  const members = [
    {
      id: "1",
      name: user?.name || user?.email?.split("@")[0] || "You",
      email: user?.email || "you@example.com",
      role: "Admin",
      isYou: true,
      status: "Active",
    },
    ...invitedList,
  ];

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    const newMember = {
      id: String(Date.now()),
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim().toLowerCase(),
      role: "Collaborator",
      isYou: false,
      status: "Invited",
    };
    setInvitedList([...invitedList, newMember]);
    setInviteEmail("");
  };

  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto text-neutral-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Collaborators &amp; Teams</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your workspace members, invite teammates, and configure collaborator permissions.
          </p>
        </div>

        <form onSubmit={handleInvite} className="flex items-center gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 w-56 sm:w-64 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inviteEmail.trim() || !inviteEmail.includes("@")}
            className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-none transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Invite</span>
          </button>
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Left: Organization / Workspace selector */}
        <div className="flex flex-col gap-2 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 p-4 rounded-none shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            Workspaces
          </h3>

          <button
            type="button"
            onClick={() => setActiveOrg("Personal Workspace")}
            className={`flex items-center gap-3 p-3 rounded-none transition-colors border text-left cursor-pointer ${
              activeOrg === "Personal Workspace"
                ? "bg-blue-50 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold"
                : "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">Personal Workspace</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">1 active member</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveOrg("Engineering Team")}
            className={`flex items-center gap-3 p-3 rounded-none transition-colors border text-left cursor-pointer ${
              activeOrg === "Engineering Team"
                ? "bg-blue-50 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold"
                : "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">Engineering Team</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">Shared team org</p>
            </div>
          </button>
        </div>

        {/* Right: Members List */}
        <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-none shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/30">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-0.5">{activeOrg}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeOrg === "Personal Workspace"
                  ? "Your private developer workspace and session sandbox."
                  : "Shared organization workspace for live coding."}
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Filter members..."
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 w-44 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Collaborators ({filteredMembers.length})
            </h3>

            <div className="flex flex-col gap-2.5">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 rounded-none gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-none bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm uppercase">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">{member.name}</p>
                        {member.isYou && (
                          <span className="px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono text-neutral-700 dark:text-neutral-300 rounded-none">
                            YOU
                          </span>
                        )}
                        {member.status === "Invited" && (
                          <span className="px-1.5 py-0.2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[10px] font-mono text-amber-700 dark:text-amber-400 rounded-none">
                            PENDING INVITE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-none">
                      {member.role === "Admin" ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{member.role}</span>
                    </div>

                    {!member.isYou && (
                      <button
                        type="button"
                        onClick={() => setInvitedList(invitedList.filter((m) => m.id !== member.id))}
                        className="p-1.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-none transition-colors"
                        title="Remove member"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
