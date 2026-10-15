"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import * as awarenessProtocol from "y-protocols/awareness.js";
import "@/styles/yjs-cursor.css";

const COLLABORATOR_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#ef4444", // Rose
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#3b82f6", // Blue
];

const getUserColor = (idString = "") => {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = idString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLABORATOR_COLORS.length;
  return COLLABORATOR_COLORS[index];
};

export default function CollaborativeMonacoEditor({
  socket,
  roomId,
  user,
  files = [],
  activeFileIndex = 0,
  onFilesChange,
  onCollaboratorsPresence,
  language = "typescript",
  editorTheme = "vs-dark",
  fontSize = 14,
  minimap = false,
  wordWrap = "on",
  tabSize = 2,
  lineNumbers = "on",
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const ydocRef = useRef(null);
  const awarenessRef = useRef(null);
  const bindingRef = useRef(null);
  const injectedStylesRef = useRef(new Set());
  const activeFileIndexRef = useRef(activeFileIndex);
  const filesRef = useRef(files);

  const [isSynced, setIsSynced] = useState(false);
  const [activePeers, setActivePeers] = useState([]);

  useEffect(() => {
    activeFileIndexRef.current = activeFileIndex;
  }, [activeFileIndex]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Inject dynamic styles for collaborator cursors
  const updateCollaboratorStyles = useCallback((clientID, peerUser) => {
    if (typeof document === "undefined") return;
    const styleId = `yjs-user-style-${clientID}`;
    let styleEl = document.getElementById(styleId);

    const color = peerUser?.color || "#6366f1";
    const name = peerUser?.name || "Peer";

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
      injectedStylesRef.current.add(styleId);
    }

    styleEl.innerHTML = `
      .yRemoteSelection-${clientID} {
        background-color: ${color}33 !important;
      }
      .yRemoteSelectionHead-${clientID} {
        position: absolute;
        border-left: 2px solid ${color} !important;
        border-top: 2px solid ${color} !important;
        border-bottom: 2px solid ${color} !important;
        height: 100%;
        box-sizing: border-box;
      }
      .yRemoteSelectionHead-${clientID}::before {
        position: absolute;
        content: " ";
        border: 3px solid ${color} !important;
        border-radius: 4px;
        left: -4px;
        top: -4px;
      }
      .yRemoteSelectionHead-${clientID}::after {
        position: absolute;
        content: "${name.replace(/"/g, '\\"')}" !important;
        top: -18px;
        left: -2px;
        font-size: 10px;
        font-family: var(--font-mono), monospace;
        font-weight: 700;
        line-height: 1.2;
        padding: 1px 5px;
        border-radius: 3px;
        color: #ffffff;
        background-color: ${color};
        white-space: nowrap;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
      }
    `;
  }, []);

  // 1. Initialize authoritative local Y.Doc & Awareness singleton
  useEffect(() => {
    const ydoc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(ydoc);
    ydocRef.current = ydoc;
    awarenessRef.current = awareness;

    // Seed local Y.Doc with initial files if present
    const currentFiles = filesRef.current || [];
    ydoc.transact(() => {
      currentFiles.forEach((file) => {
        const ytext = ydoc.getText(file.name);
        if (ytext.length === 0 && file.content) {
          ytext.insert(0, file.content);
        }
      });
    });

    // Set local awareness state
    const userColor = getUserColor(user?._id || user?.id || socket?.id || "guest");
    awareness.setLocalStateField("user", {
      id: user?._id || user?.id || socket?.id,
      name: user?.fullName || user?.username || "Collaborator",
      color: userColor,
      avatar: user?.avatar,
      currentFile: currentFiles[activeFileIndexRef.current]?.name || "main.ts",
    });

    // Emit local Yjs updates to server
    const handleDocUpdate = (update, origin) => {
      if (origin !== "socket" && socket) {
        socket.emit("yjs-update", {
          roomId,
          update: Array.from(update),
        });
      }

      // Sync updated text to React files state
      if (onFilesChange && ydocRef.current) {
        const latestFiles = filesRef.current.map((f) => ({
          ...f,
          content: ydocRef.current.getText(f.name).toString(),
        }));
        onFilesChange(latestFiles);
      }
    };
    ydoc.on("update", handleDocUpdate);

    // Emit local awareness updates to server
    const handleAwarenessUpdate = ({ added, updated, removed }, origin) => {
      if (origin !== "socket" && socket) {
        const changedClients = added.concat(updated).concat(removed);
        const encoded = awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients);
        socket.emit("awareness-update", {
          roomId,
          update: Array.from(encoded),
        });
      }

      // Compute peers presence
      const states = awareness.getStates();
      const peers = [];
      states.forEach((state, clientID) => {
        if (clientID !== ydoc.clientID && state.user) {
          peers.push({
            clientID,
            ...state.user,
            cursor: state.cursor || null,
          });
          updateCollaboratorStyles(clientID, state.user);
        }
      });

      setActivePeers(peers);
      if (onCollaboratorsPresence) {
        onCollaboratorsPresence(peers);
      }
    };
    awareness.on("update", handleAwarenessUpdate);

    // Socket Event Listeners for Yjs & Awareness
    if (socket) {
      // 1. Initial State Sync Request
      const stateVector = Y.encodeStateVector(ydoc);
      socket.emit("yjs-sync-step-1", {
        roomId,
        stateVector: Array.from(stateVector),
      });

      // 2. State Sync Response
      const onSyncStep2 = ({ update }) => {
        if (update) {
          Y.applyUpdate(ydoc, new Uint8Array(update), "socket");
          setIsSynced(true);
        }
      };
      socket.on("yjs-sync-step-2", onSyncStep2);

      // 3. Incremental Binary Updates
      const onYjsUpdate = ({ update }) => {
        if (update) {
          Y.applyUpdate(ydoc, new Uint8Array(update), "socket");
        }
      };
      socket.on("yjs-update", onYjsUpdate);

      // 4. Awareness updates
      const onRemoteAwareness = ({ update }) => {
        if (update && awarenessRef.current) {
          awarenessProtocol.applyAwarenessUpdate(
            awarenessRef.current,
            new Uint8Array(update),
            "socket"
          );
        }
      };
      socket.on("awareness-update", onRemoteAwareness);

      // 5. Remote file created
      const onFileCreated = ({ file }) => {
        if (file?.name && ydocRef.current) {
          const ytext = ydocRef.current.getText(file.name);
          if (ytext.length === 0 && file.content) {
            ytext.insert(0, file.content);
          }
        }
      };
      socket.on("file-created", onFileCreated);

      // 6. Remote file deleted
      const onFileDeleted = ({ fileName }) => {
        if (fileName && ydocRef.current) {
          const ytext = ydocRef.current.getText(fileName);
          if (ytext.length > 0) {
            ytext.delete(0, ytext.length);
          }
        }
      };
      socket.on("file-deleted", onFileDeleted);

      return () => {
        socket.off("yjs-sync-step-2", onSyncStep2);
        socket.off("yjs-update", onYjsUpdate);
        socket.off("awareness-update", onRemoteAwareness);
        socket.off("file-created", onFileCreated);
        socket.off("file-deleted", onFileDeleted);
        ydoc.off("update", handleDocUpdate);
        awareness.off("update", handleAwarenessUpdate);
        ydoc.destroy();

        // Clean up injected CSS elements
        injectedStylesRef.current.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
        injectedStylesRef.current.clear();
      };
    }
  }, [socket, roomId, user, onFilesChange, onCollaboratorsPresence, updateCollaboratorStyles]);

  // 2. Bind Monaco Editor with Y.Doc and Awareness on mount or tab switch
  const bindMonaco = useCallback(() => {
    if (!editorRef.current || !ydocRef.current || !awarenessRef.current) return;

    const editor = editorRef.current;
    const ydoc = ydocRef.current;
    const awareness = awarenessRef.current;
    const currentFiles = filesRef.current || [];
    const activeFile = currentFiles[activeFileIndex] || currentFiles[0];

    if (!activeFile) return;

    // Clean up previous binding
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    const ytext = ydoc.getText(activeFile.name);
    // Seed text if empty
    if (ytext.length === 0 && activeFile.content) {
      ytext.insert(0, activeFile.content);
    }

    // Update currentFile in awareness
    awareness.setLocalStateField("currentFile", activeFile.name);

    // Create new Monaco Binding
    const model = editor.getModel();
    if (model) {
      bindingRef.current = new MonacoBinding(
        ytext,
        model,
        new Set([editor]),
        awareness
      );
    }
  }, [activeFileIndex]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor movement in awareness
    editor.onDidChangeCursorPosition((e) => {
      if (awarenessRef.current) {
        awarenessRef.current.setLocalStateField("cursor", {
          line: e.position.lineNumber,
          column: e.position.column,
          file: filesRef.current[activeFileIndexRef.current]?.name || "main.ts",
        });
      }
    });

    // Explicitly set theme
    monaco.editor.setTheme(editorTheme || "vs-dark");

    bindMonaco();
  };

  // Keep theme synced
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(editorTheme || "vs-dark");
    }
  }, [editorTheme]);

  // Re-bind whenever active file tab changes
  useEffect(() => {
    if (editorRef.current && ydocRef.current) {
      bindMonaco();
    }
  }, [activeFileIndex, bindMonaco]);

  const currentFile = files[activeFileIndex] || files[0];
  const filePeers = activePeers.filter((p) => p.currentFile === currentFile?.name);

  return (
    <div className="relative w-full h-full flex flex-col min-h-0 bg-[#1e1e1e] font-mono">
      {/* Editor Sub-Header Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181818] border-b border-[#2d2d2d] text-xs text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSynced ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-[11px] font-medium text-neutral-300">
              {isSynced ? "CRDT Connected" : "Syncing CRDT..."}
            </span>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-[11px] text-neutral-400">
            {currentFile ? currentFile.name : "workspace"}
          </span>
        </div>

        {/* Active Collaborators on this file */}
        <div className="flex items-center gap-2">
          {filePeers.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                Viewing here:
              </span>
              <div className="flex -space-x-1.5 overflow-hidden">
                {filePeers.map((peer, idx) => (
                  <div
                    key={peer.clientID || idx}
                    className="relative group flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shadow-sm ring-1 ring-neutral-900"
                    style={{ backgroundColor: peer.color || "#6366f1" }}
                    title={`${peer.name} (Line ${peer.cursor?.line || 1})`}
                  >
                    {peer.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Monaco Container */}
      <div className="relative flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme={editorTheme}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            minimap: { enabled: minimap },
            wordWrap,
            tabSize,
            lineNumbers,
            automaticLayout: true,
            fontFamily: "var(--font-mono), monospace",
            cursorBlinking: "smooth",
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}
