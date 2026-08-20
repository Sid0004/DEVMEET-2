"use client";

import React from "react";
import Avatar from "@/components/Avatar";
import { X, Upload, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react";

export default function AvatarModal({
  isOpen,
  onClose,
  avatarUrl,
  setAvatarUrl,
  fullName,
  username,
  user,
  handleRandomizeAvatar,
  fileInputRef,
  handleFileUpload,
  setIsSaved,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            Change Profile Photo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black shrink-0 flex items-center justify-center">
            <Avatar
              src={avatarUrl || user?.avatar || null}
              name={fullName || username || "Developer"}
              size={112}
            />
          </div>
          <div>
            <div className="text-xs font-mono font-bold">{fullName || "Developer"}</div>
            <div className="text-[11px] font-mono text-neutral-400">@{username || "user"}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Option 1: Upload from System */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-3 text-left border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold uppercase">Upload from Device</div>
              <div className="text-[11px] text-neutral-400">PNG, JPG, or WEBP under 2MB</div>
            </div>
          </button>

          {/* Option 2: Roll Random Avatar */}
          <button
            type="button"
            onClick={handleRandomizeAvatar}
            className="flex items-center gap-3 p-3 text-left border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold uppercase">Generate Vector Avatar</div>
              <div className="text-[11px] text-neutral-400">Roll random DiceBear vector illustration</div>
            </div>
          </button>

          {/* Option 3: Use Google Photo (if available) */}
          {user?.authProvider === "google" && user?.avatar && (
            <button
              type="button"
              onClick={() => {
                setAvatarUrl(user.avatar);
                onClose();
                setIsSaved(false);
              }}
              className="flex items-center gap-3 p-3 text-left border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <div className="text-xs font-mono font-bold uppercase">Use Google Profile Photo</div>
                <div className="text-[11px] text-neutral-400">Sync with connected Google account</div>
              </div>
            </button>
          )}

          {/* Option 4: Reset to Default */}
          <button
            type="button"
            onClick={() => {
              setAvatarUrl("");
              onClose();
              setIsSaved(false);
            }}
            className="flex items-center gap-3 p-3 text-left border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-neutral-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold uppercase">Reset to Name Seed</div>
              <div className="text-[11px] text-neutral-400">Generate avatar based on your username</div>
            </div>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
