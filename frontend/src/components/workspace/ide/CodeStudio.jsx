"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/workspace/workspace.module.css";
import ProfileDropdown from "@/app/components/ProfileDropdown";
import { apiRequest } from "@/lib/api";

const CollaborativeMonacoEditor = dynamic(
  () => import("./CollaborativeMonacoEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-neutral-400 font-mono text-xs">
        Connecting to collaborative editor...
      </div>
    ),
  }
);

export const getLanguageFromFilename = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return "cpp";
    case "c":
      return "c";
    case "java":
      return "java";
    case "rs":
      return "rust";
    case "go":
      return "go";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "sh":
    case "bash":
      return "shell";
    case "sql":
      return "sql";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
};

export const renderFileIcon = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const style = {
    fontSize: "9px",
    fontWeight: 800,
    padding: "1px 4px",
    borderRadius: "3px",
    fontFamily: "var(--font-mono), monospace",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "15px",
    flexShrink: 0,
    textTransform: "uppercase",
    letterSpacing: "-0.2px",
  };

  switch (ext) {
    case "ts":
    case "tsx":
      return <span style={{ ...style, backgroundColor: "#007acc", color: "#ffffff" }}>TS</span>;
    case "js":
    case "jsx":
      return <span style={{ ...style, backgroundColor: "#f7df1e", color: "#000000" }}>JS</span>;
    case "py":
      return <span style={{ ...style, backgroundColor: "#3572A5", color: "#ffffff" }}>PY</span>;
    case "cpp":
    case "cxx":
    case "cc":
      return <span style={{ ...style, backgroundColor: "#f34b7d", color: "#ffffff" }}>C++</span>;
    case "c":
      return <span style={{ ...style, backgroundColor: "#555555", color: "#ffffff" }}>C</span>;
    case "java":
      return <span style={{ ...style, backgroundColor: "#b07219", color: "#ffffff" }}>JV</span>;
    case "rs":
      return <span style={{ ...style, backgroundColor: "#dea584", color: "#000000" }}>RS</span>;
    case "go":
      return <span style={{ ...style, backgroundColor: "#00ADD8", color: "#ffffff" }}>GO</span>;
    case "html":
      return <span style={{ ...style, backgroundColor: "#e34c26", color: "#ffffff" }}>HT</span>;
    case "css":
      return <span style={{ ...style, backgroundColor: "#563d7c", color: "#ffffff" }}>CS</span>;
    case "json":
      return <span style={{ ...style, backgroundColor: "#cbcb41", color: "#000000" }}>{}</span>;
    case "md":
      return <span style={{ ...style, backgroundColor: "#083fa1", color: "#ffffff" }}>MD</span>;
    default:
      return <span style={{ ...style, backgroundColor: "#6e7681", color: "#ffffff" }}>TXT</span>;
  }
};

/**
 * CodeStudio Subsystem
 * Encapsulates the entire Developer IDE:
 * - Activity Bar & collapsible File Explorer
 * - Collaborative Monaco CRDT Editor with Yjs awareness
 * - Multi-file tab switching with peer presence avatars
 * - Sandboxed Code Runner & Output Drawer
 */
export default function CodeStudio({
  socket,
  roomId,
  user,
  roomName,
  roomHost,
  files = [],
  setFiles,
  activeFileIndex = 0,
  setActiveFileIndex,
  onEndSession,
  onLeaveRoom,
  editorTheme = "vs-dark",
  editorFontSize = 14,
  editorMinimap = false,
  editorWordWrap = "on",
  editorTabSize = 2,
  editorLineNumbers = "on",
}) {
  // Explorer & Navigation UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [isOpenEditorsOpen, setIsOpenEditorsOpen] = useState(true);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Code Execution States
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null);

  // Collaborator cursor & presence state from Monaco Yjs binding
  const [collaboratorPresence, setCollaboratorPresence] = useState([]);

  // File Handlers
  const handleTabSelect = (index) => {
    setActiveFileIndex(index);
  };

  const handleCreateFile = (filename) => {
    const trimmed = (filename || "").trim();
    if (!trimmed) {
      setIsCreatingFile(false);
      return;
    }
    const alreadyExists = files.some((f) => f.name.toLowerCase() === trimmed.toLowerCase());
    if (alreadyExists) {
      alert("A file with this name already exists.");
      return;
    }

    const newFile = {
      name: trimmed,
      content: "",
      language: getLanguageFromFilename(trimmed),
    };

    const updated = [...files, newFile];
    setFiles(updated);
    const newIdx = updated.length - 1;
    setActiveFileIndex(newIdx);
    setIsCreatingFile(false);
    setNewFileName("");

    if (socket) {
      socket.emit("file-create", { roomId, file: newFile });
      socket.emit("files-change", { files: updated, activeFileIndex: newIdx });
    }
  };

  const handleDeleteFile = (e, index) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert("You cannot delete the only remaining file.");
      return;
    }
    const fileToDelete = files[index];
    const updated = files.filter((_, idx) => idx !== index);
    let newIdx = activeFileIndex;
    if (activeFileIndex >= updated.length) {
      newIdx = updated.length - 1;
    } else if (activeFileIndex === index) {
      newIdx = Math.max(0, index - 1);
    }

    setFiles(updated);
    setActiveFileIndex(newIdx);

    if (socket && fileToDelete) {
      socket.emit("file-delete", { roomId, fileName: fileToDelete.name });
      socket.emit("files-change", { files: updated, activeFileIndex: newIdx });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    const updated = [...files];
    if (updated[activeFileIndex]) {
      updated[activeFileIndex] = {
        ...updated[activeFileIndex],
        language: newLanguage,
      };
      setFiles(updated);
      if (socket) {
        socket.emit("files-change", { files: updated, activeFileIndex });
      }
    }
  };

  const handleDownloadCode = () => {
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;
    const blob = new Blob([activeFile.content || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeFile.name || "code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Execution Runner
  const handleRunCode = async () => {
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    setIsRunningCode(true);
    setIsConsoleOpen(true);
    setConsoleOutput({
      stdout: "Executing code in isolated sandbox...",
      stderr: "",
    });

    try {
      const response = await apiRequest("/api/v1/rooms/run", {
        method: "POST",
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language || getLanguageFromFilename(activeFile.name),
        }),
      });

      const output = response?.data;
      if (output) {
        setConsoleOutput({
          stdout: output.stdout || "",
          stderr: output.stderr || "",
          error: output.exitCode !== 0 ? `Process exited with code ${output.exitCode}` : undefined,
        });
      } else {
        setConsoleOutput({
          stdout: "",
          stderr: "Execution completed with empty output.",
        });
      }
    } catch (err) {
      setConsoleOutput({
        stdout: "",
        stderr: "",
        error: `Execution Error: ${err?.message || String(err)}`,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  return (
    <div className={`${styles.layout} w-full h-full flex`}>
      {/* 1. Activity Bar (Narrow leftmost navigation) */}
      <div className={styles.activityBar}>
        <div className={styles.activityBarTop}>
          <button
            className={`${styles.activityBtn} ${!isSidebarCollapsed ? styles.activityBtnActive : ""}`}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Explorer"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19 5.5H12l-2-2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm0 13H5v-11h14v11z" />
            </svg>
          </button>
          <button className={styles.activityBtn} title="Search (Coming Soon)" disabled>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </div>

        <div className={styles.activityBarBottom}>
          {user?._id === roomHost && onEndSession && (
            <button
              className={styles.activityBtn}
              onClick={onEndSession}
              title="End Session"
              style={{ color: "#ef4444" }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
              </svg>
            </button>
          )}
          {onLeaveRoom && (
            <button className={styles.activityBtn} onClick={onLeaveRoom} title="Leave Room">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            </button>
          )}
          <div className={styles.activityProfile}>
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* 2. Collapsible File Explorer Sidebar */}
      <aside className={`${styles.explorerSidebar} ${isSidebarCollapsed ? styles.explorerSidebarHidden : ""}`}>
        <div className={styles.explorerHeader}>
          <span className={styles.explorerTitle}>Explorer</span>
          <button className={styles.sectionActionBtn} title="More Actions...">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>more_horiz</span>
          </button>
        </div>

        <div className={styles.explorerSections}>
          <div className={styles.scrollableSections}>
            {/* Open Editors */}
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader} onClick={() => setIsOpenEditorsOpen(!isOpenEditorsOpen)}>
                <div className={styles.sectionHeaderLeft}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    {isOpenEditorsOpen ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>Open Editors</span>
                </div>
              </div>

              {isOpenEditorsOpen && (
                <div className={styles.sectionContent}>
                  <ul className={styles.openEditorsList}>
                    {files.map((file, idx) => {
                      if (idx !== activeFileIndex) return null;
                      return (
                        <li
                          key={idx}
                          className={`${styles.openEditorItem} ${styles.openEditorItemActive}`}
                          onClick={() => handleTabSelect(idx)}
                        >
                          <div className={styles.fileItemLeft}>
                            {renderFileIcon(file.name)}
                            <span className={styles.explorerFileName}>{file.name}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Workspace Files */}
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader} onClick={() => setIsFolderOpen(!isFolderOpen)}>
                <div className={styles.sectionHeaderLeft}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    {isFolderOpen ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>{roomName || "Workspace"}</span>
                </div>

                <div className={styles.sectionActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreatingFile(true);
                    }}
                    className={styles.sectionActionBtn}
                    title="New File..."
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>note_add</span>
                  </button>
                </div>
              </div>

              {isFolderOpen && (
                <div className={styles.sectionContent}>
                  {isCreatingFile && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateFile(newFileName);
                      }}
                      className={styles.explorerCreateForm}
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="filename.ts..."
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className={styles.explorerCreateInput}
                        onBlur={() => {
                          if (!newFileName.trim()) setIsCreatingFile(false);
                        }}
                      />
                    </form>
                  )}

                  <ul className={styles.explorerFileList}>
                    {files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      const peersInFile = collaboratorPresence.filter((p) => p.currentFile === file.name);
                      return (
                        <li
                          key={idx}
                          className={`${styles.explorerFileItem} ${isActive ? styles.explorerFileItemActive : ""}`}
                          onClick={() => handleTabSelect(idx)}
                        >
                          <div className={styles.fileItemLeft}>
                            {renderFileIcon(file.name)}
                            <span className={styles.explorerFileName}>{file.name}</span>
                            {peersInFile.length > 0 && (
                              <div className="flex -space-x-1 ml-auto mr-1 items-center">
                                {peersInFile.map((p, pIdx) => (
                                  <span
                                    key={p.clientID || pIdx}
                                    title={`${p.name} (Line ${p.cursor?.line || 1})`}
                                    className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-xs ring-1 ring-black"
                                    style={{ backgroundColor: p.color || "#6366f1" }}
                                  >
                                    {p.name.charAt(0).toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {files.length > 1 && (
                            <button
                              className={styles.explorerFileDeleteBtn}
                              onClick={(e) => handleDeleteFile(e, idx)}
                              title="Delete File"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>close</span>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Outline & Timeline Bottom Sections */}
          <div className={styles.fixedSections}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader} onClick={() => setIsOutlineOpen(!isOutlineOpen)}>
                <div className={styles.sectionHeaderLeft}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    {isOutlineOpen ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>Outline</span>
                </div>
              </div>
              {isOutlineOpen && (
                <div className={styles.sectionContent}>
                  <div className={styles.emptyPlaceholderText}>No outline symbols found.</div>
                </div>
              )}
            </div>

            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader} onClick={() => setIsTimelineOpen(!isTimelineOpen)}>
                <div className={styles.sectionHeaderLeft}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    {isTimelineOpen ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>Timeline</span>
                </div>
              </div>
              {isTimelineOpen && (
                <div className={styles.sectionContent}>
                  <div className={styles.emptyPlaceholderText}>No timeline information.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Main Workspace Canvas Container */}
      <main className={styles.mainCanvasContainer}>
        <div className={styles.workspaceSplit}>
          <section className={styles.editorPanelOverrode}>
            <div className={styles.codeCanvas}>
              {/* Tab Bar */}
              <div className={styles.tabBar}>
                <div className={styles.tabsContainer}>
                  {files.map((file, idx) => {
                    const peersOnThisFile = collaboratorPresence.filter((p) => p.currentFile === file.name);
                    return (
                      <div
                        key={idx}
                        className={idx === activeFileIndex ? styles.tabActive : styles.tab}
                        onClick={() => handleTabSelect(idx)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>
                          description
                        </span>
                        <span>{file.name}</span>

                        {peersOnThisFile.length > 0 && (
                          <div className="flex -space-x-1 ml-1.5 items-center">
                            {peersOnThisFile.map((peer, pIdx) => (
                              <span
                                key={peer.clientID || pIdx}
                                title={`${peer.name} is editing ${file.name}`}
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ring-1 ring-black"
                                style={{ backgroundColor: peer.color || "#6366f1" }}
                              >
                                {peer.name.charAt(0).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}

                        {files.length > 1 && (
                          <span
                            className={`material-symbols-outlined ${styles.tabCloseBtn}`}
                            onClick={(e) => handleDeleteFile(e, idx)}
                          >
                            close
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tab Bar Actions */}
                <div className={styles.tabBarActions}>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className={styles.tabBarRunBtn}
                    title="Run Code"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      {isRunningCode ? "hourglass_empty" : "play_arrow"}
                    </span>
                  </button>
                  <button onClick={handleDownloadCode} className={styles.tabBarRunBtn} title="Download Active File">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                  </button>
                  <select
                    value={files[activeFileIndex]?.language || "TypeScript"}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className={styles.languageSelect}
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="C">C</option>
                    <option value="Java">Java</option>
                    <option value="Rust">Rust</option>
                    <option value="Go">Go</option>
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JSON">JSON</option>
                    <option value="Markdown">Markdown</option>
                    <option value="Shell">Shell</option>
                    <option value="SQL">SQL</option>
                    <option value="YAML">YAML</option>
                  </select>
                </div>
              </div>

              {/* Monaco Editor Binding */}
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                <CollaborativeMonacoEditor
                  socket={socket}
                  roomId={roomId}
                  user={user}
                  files={files}
                  activeFileIndex={activeFileIndex}
                  onFilesChange={(updatedFiles) => setFiles(updatedFiles)}
                  onCollaboratorsPresence={(peers) => setCollaboratorPresence(peers)}
                  language={files[activeFileIndex] ? getLanguageFromFilename(files[activeFileIndex].name) : "typescript"}
                  editorTheme={editorTheme}
                  fontSize={editorFontSize}
                  minimap={editorMinimap}
                  wordWrap={editorWordWrap}
                  tabSize={editorTabSize}
                  lineNumbers={editorLineNumbers}
                />
              </div>

              {/* Collapsible Console Output Drawer */}
              {isConsoleOpen && (
                <div className={styles.consoleDrawer}>
                  <div className={styles.consoleHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span className={styles.consoleTitle}>SANDBOX CONSOLE</span>
                    </div>
                    <button
                      onClick={() => setIsConsoleOpen(false)}
                      style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1.05rem" }}>close</span>
                    </button>
                  </div>
                  <div className={styles.consoleOutputArea}>
                    {!consoleOutput && "No execution output yet. Click Play on the tab bar to run."}
                    {consoleOutput && (
                      <>
                        {consoleOutput.stdout && <div style={{ color: "#a3efff" }}>{consoleOutput.stdout}</div>}
                        {consoleOutput.stderr && <div style={{ color: "#ff7b72", marginTop: "0.25rem" }}>{consoleOutput.stderr}</div>}
                        {consoleOutput.error && <div style={{ color: "#ff7b72", fontWeight: "bold", marginTop: "0.25rem" }}>{consoleOutput.error}</div>}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Status Bar */}
              <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusDot}></span>
                  <span style={{ cursor: "pointer" }} onClick={() => setIsConsoleOpen(!isConsoleOpen)}>
                    {isConsoleOpen ? "Hide Console" : "Show Console"}
                  </span>
                  <span>Connected</span>
                  <span>{files[activeFileIndex]?.language || "TypeScript"}</span>
                </div>
                <div className={styles.statusRight}>
                  <button onClick={handleRunCode} disabled={isRunningCode} className={styles.statusRunBtn}>
                    <span className="material-symbols-outlined" style={{ fontSize: "0.875rem", marginRight: "0.25rem" }}>
                      play_arrow
                    </span>
                    {isRunningCode ? "Running..." : "Run Code"}
                  </button>
                  <span>UTF-8</span>
                  <span>Room: {roomId}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
