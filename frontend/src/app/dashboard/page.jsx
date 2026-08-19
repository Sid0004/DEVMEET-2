"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import {
  Plus,
  ArrowRight,
  FolderCode,
  Loader2,
  X,
  Copy,
  Check,
  Play,
  AlignLeft,
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Video,
  GitBranch,
  Mail,
  UserPlus,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import PreJoinLobbyModal from "../components/PreJoinLobbyModal";
import DevmeetConnectIllustration from "../components/DevmeetConnectIllustration";
import InlineCodeJoinBar from "../components/InlineCodeJoinBar";

export default function DashboardOverview() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Loading states
  const [globalLoading, setGlobalLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loaderText, setLoaderText] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);

  // Data states
  const [history, setHistory] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [lobbyTargetRoomId, setLobbyTargetRoomId] = useState(null);
  const [activeCardMenuId, setActiveCardMenuId] = useState(null);

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'create'
  const [modalStep, setModalStep] = useState("setup"); // 'setup' | 'invite' | 'success'
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [inviteEmailInput, setInviteEmailInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  // Date Strip Days Generator (Google Meet Style)
  const today = new Date();
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - 1 + i);
    return {
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      dateNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      fullDate: d,
    };
  });

  const formattedHeaderDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  // URL / Code Smart Extractor
  const parseRoomCode = (input) => {
    if (!input) return "";
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/[?&]room=([a-zA-Z0-9]{4,8})/);
    if (urlMatch) return urlMatch[1];
    const codeMatch = trimmed.match(/\b([a-zA-Z0-9]{6})\b/);
    if (codeMatch) return codeMatch[1];
    return trimmed;
  };

  const parsedTargetRoomId = parseRoomCode(joinCode);
  const isValidJoinCode = parsedTargetRoomId.length >= 6;

  // Fetch History on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest("/api/v1/rooms/history", {
          method: "GET",
        });
        if (response.data) {
          let cleared = [];
          if (typeof window !== "undefined") {
            try {
              cleared = JSON.parse(
                localStorage.getItem("devmeet_cleared_rooms") || "[]"
              );
            } catch (e) {}
          }
          const filtered = response.data.filter(
            (r) => !cleared.includes(r.roomId) && !cleared.includes(r._id)
          );
          setHistory(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleJoinRoom = (e) => {
    if (e) e.preventDefault();
    if (!isValidJoinCode) return;
    setLobbyTargetRoomId(parsedTargetRoomId);
  };

  const handleAddInviteEmail = (e) => {
    e.preventDefault();
    if (!inviteEmailInput.trim() || !inviteEmailInput.includes("@")) return;
    if (!inviteEmails.includes(inviteEmailInput.trim())) {
      setInviteEmails([...inviteEmails, inviteEmailInput.trim()]);
    }
    setInviteEmailInput("");
  };

  const handleRemoveInviteEmail = (emailToRemove) => {
    setInviteEmails(inviteEmails.filter((e) => e !== emailToRemove));
  };

  const handleCreateWorkspace = async (e) => {
    if (e) e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsCreating(true);
    try {
      const response = await apiRequest("/api/v1/rooms/create", {
        method: "POST",
        body: JSON.stringify({
          roomName: newRoomName,
          description: newRoomDescription,
          repoUrl,
          invitedEmails: inviteEmails,
        }),
      });
      if (response.data?.roomId) {
        setCreatedRoomId(response.data.roomId);
        setModalStep("success");
        setHistory((prev) => [response.data, ...prev]);
      }
    } catch (error) {
      alert("Failed to create workspace.");
    } finally {
      setIsCreating(false);
    }
  };

  const joiningLink = typeof window !== "undefined"
    ? `${window.location.origin}/workspace?room=${createdRoomId}`
    : `devmeet.com/workspace?room=${createdRoomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joiningLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetModal = () => {
    setActiveModal(null);
    setTimeout(() => {
      setModalStep("setup");
      setNewRoomName("");
      setNewRoomDescription("");
      setRepoUrl("");
      setInviteEmailInput("");
      setInviteEmails([]);
      setCreatedRoomId("");
      setCopied(false);
    }, 300);
  };

  return (
    <>
      {/* Pre-Join Green Room Lobby Modal */}
      <PreJoinLobbyModal
        isOpen={!!lobbyTargetRoomId}
        roomId={lobbyTargetRoomId}
        onClose={() => setLobbyTargetRoomId(null)}
      />

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {globalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
            <p className="text-white font-medium text-sm">{loaderText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SPOTLIGHT COMMAND CENTER MODAL FOR NEW SESSION */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[500] flex items-start justify-center pt-20 px-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={resetModal}
            />

            {/* Spotlight Command Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-[#1e1f24] border border-white/15 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 text-white"
            >
              <button
                onClick={resetModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                title="Close dialogue"
              >
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                {/* STEP 1: WORKSPACE DETAILS */}
                {modalStep === "setup" && (
                  <motion.div
                    key="step-setup"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-2xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                        <FolderCode className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-[22px] font-medium text-white tracking-tight">
                          New Workspace
                        </h2>
                        <p className="text-xs text-gray-400">Step 1 of 2: Basic Setup</p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newRoomName.trim()) setModalStep("invite");
                      }}
                      className="flex flex-col gap-5"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Workspace Name
                        </label>
                        <input
                          type="text"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          placeholder="e.g. Core Architecture"
                          className="bg-[#141518] border border-white/10 rounded-2xl px-4 py-3 text-white text-[15px] focus:outline-none focus:border-blue-500 transition-colors"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <AlignLeft className="w-3.5 h-3.5" /> Description{" "}
                          <span className="text-gray-500 font-normal lowercase">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          value={newRoomDescription}
                          onChange={(e) => setNewRoomDescription(e.target.value)}
                          placeholder="Briefly describe what your team is building here..."
                          className="bg-[#141518] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors min-h-[75px] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5" /> GitHub Repository Link{" "}
                          <span className="text-gray-500 font-normal lowercase">
                            (optional)
                          </span>
                        </label>
                        <input
                          type="url"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/org/repository"
                          className="bg-[#141518] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!newRoomName.trim()}
                        className="mt-2 w-full h-12 bg-[#c2e7ff] text-[#001d35] font-semibold text-sm rounded-full hover:bg-[#b3dcf7] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        Next: Invite Collaborators <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* STEP 2: INVITE COLLABORATORS (EMAIL) */}
                {modalStep === "invite" && (
                  <motion.div
                    key="step-invite"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-2xl bg-purple-500/15 flex items-center justify-center border border-purple-500/20">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-[22px] font-medium text-white tracking-tight">
                          Invite Team Members
                        </h2>
                        <p className="text-xs text-gray-400">Step 2 of 2: Send Invites</p>
                      </div>
                    </div>

                    <form onSubmit={handleAddInviteEmail} className="flex flex-col gap-4 mb-6">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Invite by Email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={inviteEmailInput}
                          onChange={(e) => setInviteEmailInput(e.target.value)}
                          placeholder="teammate@company.com"
                          className="flex-1 bg-[#141518] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!inviteEmailInput.trim() || !inviteEmailInput.includes("@")}
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-medium transition-colors disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    {/* Added Email Chips */}
                    {inviteEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6 max-h-28 overflow-y-auto p-2 bg-[#141518] rounded-2xl border border-white/5">
                        {inviteEmails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs rounded-full"
                          >
                            <span>{email}</span>
                            <button
                              onClick={() => handleRemoveInviteEmail(email)}
                              className="text-blue-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setModalStep("setup")}
                        className="px-5 h-12 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-full transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateWorkspace}
                        disabled={isCreating}
                        className="flex-1 h-12 bg-[#c2e7ff] text-[#001d35] font-semibold text-sm rounded-full hover:bg-[#b3dcf7] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create & Generate Link <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: GOOGLE MEET STYLE "Here's your joining information" */}
                {modalStep === "success" && (
                  <motion.div
                    key="step-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 flex flex-col items-start text-left"
                  >
                    <h2 className="text-[24px] font-normal text-white mb-2 tracking-tight">
                      Here&apos;s your joining information
                    </h2>
                    <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                      Send this to people that you want to meet with. Make sure that
                      you save it so that you can use it later, too.
                    </p>

                    {/* Copy Box Container */}
                    <div className="w-full p-3.5 bg-[#282a30] border border-white/10 rounded-2xl flex items-center justify-between mb-6">
                      <span className="text-sm font-mono text-gray-200 truncate pr-2">
                        {joiningLink}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
                        title="Copy joining info"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {copied && (
                      <p className="text-xs text-emerald-400 font-medium mb-4 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Joining link copied to clipboard!
                      </p>
                    )}

                    <div className="flex gap-3 w-full mt-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 h-12 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-full transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> Copy Link
                      </button>
                      <button
                        onClick={() => {
                          resetModal();
                          setLobbyTargetRoomId(createdRoomId);
                        }}
                        className="flex-1 h-12 bg-[#c2e7ff] text-[#001d35] font-semibold text-sm rounded-full hover:bg-[#b3dcf7] transition-colors flex items-center justify-center gap-2"
                      >
                        Enter Workspace <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full min-h-[calc(100vh-110px)] flex flex-col items-center justify-center my-auto text-neutral-900 dark:text-white py-4">
        {/* HERO CONNECT ILLUSTRATION SECTION */}
        {!isSearchExpanded && (
          <div className="text-center flex flex-col items-center justify-center mb-8 overflow-hidden">
            <div
              className="relative mb-6 select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Protection Overlay Shield */}
              <div
                className="absolute inset-0 z-10 bg-transparent"
                onContextMenu={(e) => e.preventDefault()}
              />
              <DevmeetConnectIllustration className="w-80 h-auto mb-2" />
            </div>

            <h3 className="text-[28px] font-normal text-neutral-900 dark:text-white mb-2 tracking-tight">
              Connect with someone you know
            </h3>
            <p className="text-[15px] text-neutral-500 dark:text-gray-400 max-w-md font-normal mb-2">
              Connect, collaborate and code together from anywhere with DevMeet
            </p>
          </div>
        )}

        {/* ACTION CONTROLS BELOW ILLUSTRATION: Search Bar + New Session Button */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 w-full ${
          isSearchExpanded ? "max-w-5xl" : "max-w-2xl"
        }`}>
          {/* Inline Expandable Code & Link Search Bar */}
          <InlineCodeJoinBar onExpandChange={setIsSearchExpanded} />

          {!isSearchExpanded && (
            <button
              onClick={() => setActiveModal("create")}
              className="inline-flex items-center gap-2.5 px-6 h-12 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm transition-all shadow-md active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Video className="w-4 h-4 text-white" />
              <span>New Session</span>
            </button>
          )}
        </div>

        {/* Quick Rejoin Pill for Last Active Session */}
        {history.length > 0 && !isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-full text-xs text-neutral-600 dark:text-gray-300 shadow-sm hover:border-blue-500/40 transition-colors"
          >
            <span className="text-neutral-400 dark:text-gray-400 font-normal">Last active:</span>
            <span className="font-medium text-neutral-900 dark:text-white truncate max-w-[160px]">
              {history[0].roomName}
            </span>
            <span className="font-mono text-[11px] text-neutral-500 dark:text-gray-400 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
              #{history[0].roomId}
            </span>
            <button
              type="button"
              onClick={() => setLobbyTargetRoomId(history[0].roomId)}
              className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Play className="w-3 h-3" /> Rejoin
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
