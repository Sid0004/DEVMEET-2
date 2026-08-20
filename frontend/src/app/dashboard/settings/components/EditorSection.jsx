"use client";

import React from "react";

export const SAMPLE_CODE = {
  javascript: `// Devmeet Real-Time Collaboration\nfunction calculateMetrics(users, sessions) {\n  return users.map(u => ({\n    id: u.id,\n    active: sessions.has(u.id)\n  }));\n}`,
  typescript: `// Devmeet CRDT State\ninterface Participant {\n  id: string;\n  cursor: { line: number; ch: number };\n}\nconst syncRoom = (p: Participant): boolean => true;`,
  python: `# Devmeet Collaborative Python\ndef optimize_mesh(peers: list) -> dict:\n    return {peer.id: peer.latency for peer in peers}`,
  cpp: `// Devmeet High-Perf Engine\n#include <iostream>\nint main() {\n    std::cout << "Devmeet Mesh Online\\n";\n    return 0;\n}`,
  java: `// Devmeet Room Coordinator\npublic class Room {\n    private final String id;\n    public Room(String id) { this.id = id; }\n}`,
  go: `// Devmeet Go Worker\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Devmeet Go Worker Ready")\n}`,
  rust: `// Devmeet WebAssembly Worker\npub fn compute_hash(data: &str) -> String {\n    format!("devmeet_{}", data.len())\n}`
};

export default function EditorSection({ preferences, updatePreference }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          Monaco Editor & Canvas Engine
        </span>
        <span className="text-[11px] font-mono text-neutral-400">DEV ENVIRONMENT</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Default Syntax
            </label>
            <select
              value={preferences.defaultLanguage}
              onChange={(e) => updatePreference("defaultLanguage", e.target.value)}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC 13)</option>
              <option value="java">Java 21</option>
              <option value="go">Go 1.22</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Keybinding Mode
            </label>
            <select
              value={preferences.editorKeybinding}
              onChange={(e) => updatePreference("editorKeybinding", e.target.value)}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value="standard">Standard (VS Code default)</option>
              <option value="vim">Vim Mode</option>
              <option value="emacs">Emacs Mode</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Font Size ({preferences.editorFontSize}px)
            </label>
            <select
              value={preferences.editorFontSize}
              onChange={(e) => updatePreference("editorFontSize", Number(e.target.value))}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value={12}>12px (Compact)</option>
              <option value={14}>14px (Standard)</option>
              <option value={16}>16px (Comfortable)</option>
              <option value={18}>18px (Large)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Tab Width
            </label>
            <select
              value={preferences.editorTabSize}
              onChange={(e) => updatePreference("editorTabSize", Number(e.target.value))}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="border border-neutral-300 dark:border-neutral-700 bg-neutral-950 text-neutral-200">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-800 bg-neutral-900 text-[11px] font-mono text-neutral-400">
            <span>PREVIEW [{preferences.defaultLanguage.toUpperCase()}]</span>
            <span>{preferences.editorFontSize}px | {preferences.editorTabSize} SPACES</span>
          </div>
          <pre
            className="p-4 font-mono overflow-x-auto text-emerald-400 select-none text-xs"
            style={{
              fontSize: `${preferences.editorFontSize}px`,
              tabSize: preferences.editorTabSize,
              lineHeight: "1.6",
            }}
          >
            {SAMPLE_CODE[preferences.defaultLanguage] || SAMPLE_CODE.javascript}
          </pre>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Word Wrap</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Wrap long lines to fit viewport width.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.wordWrap}
              onChange={(e) => updatePreference("wordWrap", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Auto Close Brackets</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Insert matching brackets & quotes automatically.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoCloseBrackets}
              onChange={(e) => updatePreference("autoCloseBrackets", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Format On Save</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Automatically format syntax with Prettier before running.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.formatOnSave}
              onChange={(e) => updatePreference("formatOnSave", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Font Ligatures</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Enable contextual ligatures for =, =&gt;, !=, &lt;=.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.fontLigatures}
              onChange={(e) => updatePreference("fontLigatures", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
