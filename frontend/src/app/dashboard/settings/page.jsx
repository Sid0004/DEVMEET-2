"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { apiRequest } from "@/lib/api";
import { User, Mail, Briefcase, Camera, LogOut, Loader2 } from "lucide-react";
import Avatar from "@/components/Avatar";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("/api/v1/users/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.removeItem("devmeet-token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto text-neutral-900 dark:text-white">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-light mb-2">Account Settings</h1>
        <p className="text-neutral-500 dark:text-gray-400 font-light text-sm sm:text-base">
          Manage your personal profile, active sessions, and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#161616]">
            <h2 className="text-base sm:text-lg font-medium">Personal Information</h2>
          </div>

          <div className="p-6 flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-32 w-32 rounded-full overflow-hidden border border-blue-500/20 flex items-center justify-center relative group">
                <Avatar
                  src={user?.avatar || user?.avatarUrl || null}
                  name={user?.fullName || user?.username || "User"}
                  size={128}
                />
              </div>
              <span className="text-xs text-neutral-500 dark:text-gray-400 font-light">Vector Avatar</span>
            </div>

            {/* Details Form */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-neutral-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ""}
                    className="bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 rounded-lg px-4 py-2.5 text-neutral-500 dark:text-gray-500 cursor-not-allowed font-light text-sm"
                  />
                  <p className="text-xs text-neutral-400 dark:text-gray-500">
                    Username cannot be changed.
                  </p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-neutral-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="bg-neutral-100 dark:bg-black/30 border border-neutral-200 dark:border-white/5 rounded-lg px-4 py-2.5 text-neutral-500 dark:text-gray-500 cursor-not-allowed font-light text-sm"
                  />
                </div>
              </div>

              {/* Profession */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-neutral-600 dark:text-gray-400 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Profession Role
                </label>
                <select
                  className="bg-white dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500/50 appearance-none font-light text-sm"
                  defaultValue="Student"
                >
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-white/5 flex justify-end">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Session / Logout Section */}
        <div className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-white mb-1">
                Account Session
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-gray-400 font-light">
                Sign out of your current DevMeet session on this browser.
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-sm font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-[#111] border border-red-200 dark:border-red-500/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-neutral-500 dark:text-gray-400 font-light mb-6">
              Permanently delete your account and all associated workspace data. This
              action cannot be undone.
            </p>
            <button className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-sm font-medium rounded-xl transition-colors cursor-pointer">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
