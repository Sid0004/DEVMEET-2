"use client";

import React from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export default function AppearanceSection({
  theme,
  setTheme,
  accent,
  setAccent,
  accentOptions,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          UI Theme & Visual Customization
        </span>
        <span className="text-[11px] font-mono text-neutral-400">DESIGN SYSTEM</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Theme Mode */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
            Interface Theme Mode
          </span>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-3.5 border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                theme === "system"
                  ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800 font-bold"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">System Default</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3.5 border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                theme === "light"
                  ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800 font-bold"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Day Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3.5 border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                theme === "dark"
                  ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800 font-bold"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Midnight Dark</span>
            </button>
          </div>
        </div>

        {/* Accent Colors */}
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
            Accent Brand Palette
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {accentOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccent(opt.id)}
                className={`p-3 border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  accent === opt.id
                    ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800 font-bold"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-black/20 flex items-center justify-center text-white"
                  style={{ backgroundColor: opt.hex }}
                >
                  {accent === opt.id && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-mono">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
