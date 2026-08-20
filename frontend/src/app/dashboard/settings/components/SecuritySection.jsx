"use client";

import React from "react";
import { Lock, Loader2, Laptop, LogOut } from "lucide-react";
import { GithubIcon } from "./ProfileSection";

export default function SecuritySection({
  user,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isChangingPassword,
  passwordSuccess,
  passwordError,
  handleChangePassword,
  handleLogout,
  isLoggingOut,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          Authentication & Active Sessions
        </span>
        <span className="text-[11px] font-mono text-neutral-400">JWT & OAUTH</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Connected OAuth Providers */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
            Connected OAuth Providers
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                </svg>
                <div>
                  <div className="text-xs font-bold font-mono">GOOGLE</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {user?.authProvider === "google" || user?.googleId ? "LINKED" : "AVAILABLE"}
                  </div>
                </div>
              </div>
              {user?.authProvider === "google" || user?.googleId ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  CONNECTED
                </span>
              ) : (
                <span className="text-[11px] font-mono text-neutral-400">NOT LINKED</span>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GithubIcon className="w-4 h-4" />
                <div>
                  <div className="text-xs font-bold font-mono">GITHUB</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {user?.authProvider === "github" || user?.githubId ? "LINKED" : "AVAILABLE"}
                  </div>
                </div>
              </div>
              {user?.authProvider === "github" || user?.githubId ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  CONNECTED
                </span>
              ) : (
                <span className="text-[11px] font-mono text-neutral-400">NOT LINKED</span>
              )}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
              Update Account Password
            </span>
            <span className="text-[10px] font-mono text-neutral-400">MIN 8 CHARS</span>
          </div>

          {passwordSuccess && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-mono">
              {passwordError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isChangingPassword ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>

        {/* Active Session & Sign Out */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Laptop className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <div>
              <div className="text-xs font-mono font-bold uppercase flex items-center gap-2">
                <span>Current Browser Session</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Token signed via HMAC-SHA256
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 border border-red-300 dark:border-red-800 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
            <span>Sign Out</span>
          </button>
        </div>

        {/* Danger Zone: Irreversible Account Destruction */}
        <div className="border border-red-300 dark:border-red-900/60 p-4 bg-red-50/40 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-red-700 dark:text-red-300 flex items-center gap-2">
              <span>Permanently Delete Account</span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                IRREVERSIBLE
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Purges all user records, saved room histories, and editor sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert("To delete your account, please contact workspace administration.")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
