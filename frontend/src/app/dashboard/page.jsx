"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  Plus,
  ArrowRight,
  FolderCode,
  Loader2,
  X,
  Copy,
  Check,
  Clock,
  Play,
  AlignLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

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

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'join' or 'create'
  const [modalStep, setModalStep] = useState("setup");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch History on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest("/api/v1/rooms/history", {
          method: "GET",
        });
        if (response.data) {
          setHistory(response.data.slice(0, 3)); // Only take top 3 for overview
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoaderText(`Connecting to room ${joinCode.trim()}...`);
    setGlobalLoading(true);
    try {
      await apiRequest(`/api/v1/rooms/${joinCode.trim()}/join`, {
        method: "POST",
      });
      router.push(`/workspace?room=${joinCode.trim()}`);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to join room. Check your code.",
      );
      setGlobalLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsCreating(true);
    try {
      const response = await apiRequest("/api/v1/rooms/create", {
        method: "POST",
        body: JSON.stringify({
          roomName: newRoomName,
          description: newRoomDescription,
        }),
      });
      if (response.data?.roomId) {
        setCreatedRoomId(response.data.roomId);
        setModalStep("success");
      }
    } catch (error) {
      alert("Failed to create workspace.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setActiveModal(null);
    setTimeout(() => {
      setModalStep("setup");
      setNewRoomName("");
      setNewRoomDescription("");
      setCreatedRoomId("");
      setJoinCode("");
    }, 300);
  };

  return (
    <>
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {globalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white font-medium">{loaderText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals Container */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={resetModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <button
                onClick={resetModal}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* CREATE WORKSPACE MODAL CONTENT */}
              {activeModal === "create" && (
                <AnimatePresence mode="wait">
                  {modalStep === "setup" ? (
                    <motion.div
                      key="setup"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <FolderCode className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-medium text-white">
                          New Workspace
                        </h2>
                      </div>

                      <form
                        onSubmit={handleCreateWorkspace}
                        className="flex flex-col gap-6"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-400">
                            Workspace Name
                          </label>
                          <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="e.g. Core Architecture"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                            required
                            autoFocus
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                            <AlignLeft className="w-4 h-4" /> Description <span className="text-gray-600">(Optional)</span>
                          </label>
                          <textarea
                            value={newRoomDescription}
                            onChange={(e) => setNewRoomDescription(e.target.value)}
                            placeholder="Briefly describe what your team is building here..."
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors min-h-[100px] resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isCreating}
                          className="mt-2 w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              Create Workspace <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 text-center flex flex-col items-center"
                    >
                      <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                        <Check className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h2 className="text-2xl font-medium text-white mb-2">
                        Workspace Ready!
                      </h2>
                      <p className="text-gray-400 text-sm mb-8">
                        Share this 6-digit code with your team to invite them to
                        collaborate.
                      </p>

                      <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-full flex items-center justify-between mb-8">
                        <span className="text-3xl font-mono tracking-[0.2em] text-white ml-4">
                          {createdRoomId}
                        </span>
                        <button
                          onClick={copyToClipboard}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                          title="Copy to clipboard"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          router.push(`/workspace?room=${createdRoomId}`)
                        }
                        className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Enter Workspace
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* JOIN WORKSPACE MODAL CONTENT */}
              {activeModal === "join" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <ArrowRight className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-medium text-white">
                      Join Session
                    </h2>
                  </div>

                  <form
                    onSubmit={handleJoinRoom}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-400">
                        Room Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-center text-2xl tracking-[0.3em] text-white focus:outline-none focus:border-emerald-500/50 transition-colors uppercase font-mono"
                        required
                        autoFocus
                        maxLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      Connect <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8 max-w-6xl mx-auto text-white">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light mb-2">
            Welcome back, {user?.fullName || user?.username || "Architect"}
          </h1>
          <p className="text-gray-400 font-light">
            Here&apos;s what&apos;s happening in your DevMeet environment today.
          </p>
        </div>

        {/* Quick Actions Grid (Redesigned as clean entry points) */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Join Room Card */}
          <button
            onClick={() => setActiveModal("join")}
            className="group flex flex-col items-start p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-emerald-500/50 hover:bg-[#161616] transition-all text-left relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Join Session</h3>
            <p className="text-sm text-gray-400 font-light mb-4">
              Enter a 6-digit access code to join an active room.
            </p>
            <div className="mt-auto flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Connect <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* New Project Workspace */}
          <button
            onClick={() => setActiveModal("create")}
            className="group flex flex-col items-start p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-purple-500/50 hover:bg-[#161616] transition-all text-left relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />

            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FolderCode className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">New Workspace</h3>
            <p className="text-sm text-gray-400 font-light mb-4">
              Configure a long-lived generic project environment.
            </p>
            <div className="mt-auto flex items-center text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Configure <Plus className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>

        {/* Recent Activity Mini-View */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light">Recent Activity</h2>
            <button
              onClick={() => router.push("/dashboard/rooms")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View all →
            </button>
          </div>

          {historyLoading ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 flex justify-center items-center">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center text-gray-500 font-light flex flex-col items-center">
              <Clock className="w-8 h-8 mb-3 opacity-20" />
              Your recent workspaces will appear here once you start
              collaborating.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((room) => (
                <div
                  key={room._id}
                  className="group flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-colors">
                      <FolderCode className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">
                        {room.roomName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                          {room.roomId}
                        </span>
                        {/* We removed primary language, so it no longer shows here */}
                        {room.description && (
                          <span className="truncate max-w-[150px]">{room.description}</span>
                        )}
                        {room.status === "ended" && (
                          <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded">
                            Ended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {room.status !== "ended" && (
                    <button
                      onClick={() => {
                        setLoaderText("Reconnecting...");
                        setGlobalLoading(true);
                        router.push(`/workspace?room=${room.roomId}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-4 h-4" fill="currentColor" /> Resume
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
