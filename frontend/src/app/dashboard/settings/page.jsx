"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { User, Mail, Briefcase, Camera } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-light mb-2">Account Settings</h1>
        <p className="text-gray-400 font-light">
          Manage your personal profile and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Card */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#161616]">
            <h2 className="text-lg font-medium">Personal Information</h2>
          </div>

          <div className="p-6 flex flex-col md:flex-row gap-12">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-32 w-32 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center relative group">
                <span className="text-4xl text-blue-400 font-light uppercase">
                  {user?.fullName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "U"}
                </span>

                {/* Hover overlay for changing picture */}
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-xs font-medium">Change</span>
                </div>
              </div>
            </div>

            {/* Details Form */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ""}
                    className="bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed font-light"
                  />

                  <p className="text-xs text-gray-500">
                    Username cannot be changed.
                  </p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed font-light"
                  />
                </div>
              </div>

              {/* Profession */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Profession Role
                </label>
                <select
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-light"
                  defaultValue="Student"
                >
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5 flex justify-end">
                <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#111] border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-red-400 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-400 font-light mb-6">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
