"use client";

import React from "react";

export default function SettingsSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 animate-pulse space-y-6">
      {/* Skeleton Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-72 bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-9 w-32 bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>

      {/* Skeleton Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Skeleton Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Skeleton Profile Mini Card */}
          <div className="hidden md:flex flex-col items-center p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-center space-y-3">
            <div className="w-28 h-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Skeleton Tabs */}
          <div className="flex md:flex-col gap-1 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-10 w-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50"
              />
            ))}
          </div>
        </div>

        {/* Skeleton Content Panel */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
            {/* Header strip */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
              <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Inputs area */}
            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-24 w-full bg-neutral-200 dark:bg-neutral-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
