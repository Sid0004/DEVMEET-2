"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Users, Plus, Shield, ShieldAlert, Building2 } from "lucide-react";

export default function TeamsPage() {
  const { user } = useAppSelector((state) => state.auth);
  // Dummy state for preview. In a real app, this would be fetched from the backend.
  const [activeOrg, setActiveOrg] = useState("Personal Workspace");
  const members = [
    {
      id: "1",
      name: user?.fullName || user?.username || "You",
      email: user?.email || "you@example.com",
      role: "Admin",
      isYou: true,
    },
    // Add dummy members if it wasn't personal workspace, but we'll leave it empty for now
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-light mb-2">Teams & Organizations</h1>
          <p className="text-gray-400 font-light">
            Manage your workspaces, invite members, and configure roles.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Organization
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Left Sidebar: Org Selector */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Your Organizations
          </h3>

          <button
            onClick={() => setActiveOrg("Personal Workspace")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors border ${
              activeOrg === "Personal Workspace"
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                : "bg-[#111] border-white/5 text-gray-400 hover:bg-[#161616]"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${activeOrg === "Personal Workspace" ? "bg-blue-500/20" : "bg-white/5"}`}
            >
              <Users className="w-4 h-4" />
            </div>
            <span className="font-medium">Personal Workspace</span>
          </button>

          {/* Example of another org */}
          <button
            onClick={() => setActiveOrg("Acme Corp")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors border ${
              activeOrg === "Acme Corp"
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                : "bg-[#111] border-white/5 text-gray-400 hover:bg-[#161616]"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${activeOrg === "Acme Corp" ? "bg-blue-500/20" : "bg-white/5"}`}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-medium">Acme Corp</span>
          </button>
        </div>

        {/* Right Content: Org Details */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
            <div>
              <h2 className="text-xl font-medium mb-1">{activeOrg}</h2>
              <p className="text-sm text-gray-400 font-light">
                {activeOrg === "Personal Workspace"
                  ? "Your independent, private sandbox."
                  : "Collaborate with your team members securely."}
              </p>
            </div>
            {activeOrg !== "Personal Workspace" && (
              <button className="px-4 py-2 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                Invite Members
              </button>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Members ({members.length})
            </h3>

            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-black/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{member.name}</p>
                        {member.isYou && (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-gray-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-light">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    {member.role === "Admin" ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-300">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {activeOrg === "Personal Workspace" && (
              <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-light">
                Personal workspaces cannot have multiple members. Create a new
                organization to invite colleagues.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
