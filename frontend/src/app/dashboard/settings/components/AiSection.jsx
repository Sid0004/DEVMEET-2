"use client";

import React from "react";

export default function AiSection({ preferences, updatePreference }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          Artificial Intelligence & Proctoring Engine
        </span>
        <span className="text-[11px] font-mono text-neutral-400">GEMINI LLM</span>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">AI Code Copilot</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Real-time intelligent autocompletion & error fixing.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.aiCopilot}
              onChange={(e) => updatePreference("aiCopilot", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">AI Interview Assistant</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Automated prompt generator & difficulty rubric.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.aiInterviewAssistance}
              onChange={(e) => updatePreference("aiInterviewAssistance", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Gaze & Presence Tracking</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Detect candidate eye drift during technical assessments.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.proctoringGazeDetection}
              onChange={(e) => updatePreference("proctoringGazeDetection", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Automatic Session Summary</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Generate markdown recap of meetings upon completion.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoMeetingSummary}
              onChange={(e) => updatePreference("autoMeetingSummary", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
