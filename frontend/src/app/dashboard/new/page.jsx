"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  FolderCode,
  Video,
  VideoOff,
  Mic,
  MicOff,
  GitBranch,
  AlignLeft,
  Mail,
  X,
  ArrowRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Code,
  Volume2,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { useUserMedia } from "@/hooks/useUserMedia";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import LobbyDeviceDropdown from "@/app/components/lobby/LobbyDeviceDropdown";
import { apiRequest } from "@/lib/api";

const PRESET_TEMPLATES = [
  "Core Architecture",
  "Pair Debugging",
  "Code Review",
  "System Design",
];

function CreateSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("room");

  const { user } = useAppSelector((state) => state.auth);
  const userName = user?.name
    ? user.name.toUpperCase()
    : user?.email
    ? user.email.split("@")[0].toUpperCase()
    : "DEVELOPER";

  // Form State
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [inviteEmailInput, setInviteEmailInput] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If joining an existing room
  const [verifiedRoom, setVerifiedRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);

  // User Media Hook for Green Room Preview
  const {
    videoRef,
    streamRef,
    mediaStream,
    micEnabled,
    cameraEnabled,
    mediaError,
    audioDevices,
    speakerDevices,
    videoDevices,
    selectedAudioDevice,
    selectedSpeakerDevice,
    selectedVideoDevice,
    handleAudioDeviceChange,
    handleSpeakerDeviceChange,
    handleVideoDeviceChange,
    toggleCamera,
    toggleMic,
    stopMedia,
  } = useUserMedia(true);

  const audioLevel = useAudioAnalyser(mediaStream, micEnabled);

  // If query room exists, fetch room details
  useEffect(() => {
    if (queryRoomId) {
      const fetchRoom = async () => {
        setLoadingRoom(true);
        try {
          const res = await apiRequest(`/api/v1/rooms/${queryRoomId}`);
          if (res.data) {
            setVerifiedRoom(res.data);
            setWorkspaceName(res.data.roomName || "");
          }
        } catch (err) {
          setErrorMessage(`Room "${queryRoomId}" not found or has ended.`);
        } finally {
          setLoadingRoom(false);
        }
      };
      fetchRoom();
    }
  }, [queryRoomId]);

  // Re-attach video stream whenever streamRef or cameraEnabled changes
  useEffect(() => {
    if (videoRef?.current && streamRef?.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [videoRef, streamRef, cameraEnabled]);

  const handleAddInviteEmail = (e) => {
    e.preventDefault();
    if (!inviteEmailInput.trim() || !inviteEmailInput.includes("@")) return;
    const cleanEmail = inviteEmailInput.trim().toLowerCase();
    if (!inviteEmails.includes(cleanEmail)) {
      setInviteEmails([...inviteEmails, cleanEmail]);
    }
    setInviteEmailInput("");
  };

  const handleRemoveInviteEmail = (email) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  const handleCreateAndJoin = async (noVC = false) => {
    if (queryRoomId && verifiedRoom) {
      // Joining existing room
      stopMedia();
      router.push(`/workspace?room=${verifiedRoom.roomId || queryRoomId}${noVC ? "&novc=true" : ""}`);
      return;
    }

    if (!workspaceName.trim()) {
      setErrorMessage("Please enter a workspace name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest("/api/v1/rooms/create", {
        method: "POST",
        body: JSON.stringify({
          roomName: workspaceName.trim(),
          description: description.trim(),
          repoUrl: repoUrl.trim(),
          invitedEmails: inviteEmails,
        }),
      });

      if (response.data?.roomId) {
        stopMedia();
        router.push(`/workspace?room=${response.data.roomId}${noVC ? "&novc=true" : ""}`);
      } else {
        throw new Error("Failed to generate workspace room.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to create workspace. Please try again.");
      setIsSubmitting(false);
    }
  };

  const hasCameraError = Boolean(
    mediaError?.toLowerCase().includes("camera") ||
    (videoDevices.length === 0 && !cameraEnabled)
  );

  // Dynamic Workspace Display Title
  const dynamicHeaderTitle = workspaceName.trim()
    ? workspaceName.trim()
    : queryRoomId
    ? "Join Workspace Lobby"
    : "Create New Workspace";

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Header Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            onClick={() => stopMedia()}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-none bg-neutral-50 dark:bg-neutral-900 shadow-xs transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700 flex-shrink-0">/</span>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2 truncate">
            <FolderCode className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="truncate">{dynamicHeaderTitle}</span>
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PRE-MEETING GREEN ROOM</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-none flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Unified All-in-One Media Card */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-none shadow-xs overflow-hidden">
          {/* 16:9 Video Canvas */}
          <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-950 overflow-hidden group">
            {/* Top-Left User Badge */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/75 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 shadow-xs">
              {userName}
            </div>

            {/* Top-Right Status Badge */}
            <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10 shadow-xs flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cameraEnabled && !hasCameraError ? "bg-emerald-500" : "bg-neutral-400"}`} />
              <span>{cameraEnabled && !hasCameraError ? "CAM LIVE" : "AUDIO ONLY"}</span>
            </div>

            {/* Video Element */}
            <video
              ref={(el) => {
                if (videoRef) videoRef.current = el;
                if (el && streamRef?.current) {
                  if (el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                  }
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                cameraEnabled && !hasCameraError ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Single Clean Center Status Screen (Camera Off or Error) */}
            {(!cameraEnabled || hasCameraError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 p-4 text-center">
                <div className={`w-16 h-16 border rounded-none flex items-center justify-center text-xl font-bold mb-2.5 shadow-xs ${
                  hasCameraError
                    ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400"
                    : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
                }`}>
                  {hasCameraError ? (
                    <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
                  ) : (
                    userName.charAt(0)
                  )}
                </div>
                <p className={`text-xs font-mono uppercase tracking-wider ${
                  hasCameraError ? "text-red-600 dark:text-red-400 font-semibold" : "text-neutral-600 dark:text-neutral-400"
                }`}>
                  {hasCameraError ? "Camera not detected" : "Camera is turned off"}
                </p>
                {hasCameraError && (
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
                    Please check browser permissions or connect a camera.
                  </p>
                )}
              </div>
            )}

            {/* Centered In-Video Controls Bar (Pro Clean Style) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 pointer-events-auto">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleMic}
                className={`h-10 px-4 flex items-center gap-2 text-xs font-bold transition-all rounded-none border backdrop-blur-md cursor-pointer ${
                  micEnabled
                    ? "bg-white/90 hover:bg-white dark:bg-neutral-900/90 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 shadow-xs"
                    : "bg-neutral-100/95 dark:bg-neutral-900/95 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/40 shadow-xs"
                }`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                <span>{micEnabled ? "Mic On" : "Muted"}</span>
              </button>

              {/* Cam Toggle */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`h-10 px-4 flex items-center gap-2 text-xs font-bold transition-all rounded-none border backdrop-blur-md cursor-pointer ${
                  cameraEnabled && !hasCameraError
                    ? "bg-white/90 hover:bg-white dark:bg-neutral-900/90 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 shadow-xs"
                    : "bg-neutral-100/95 dark:bg-neutral-900/95 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/40 shadow-xs"
                }`}
                title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {cameraEnabled && !hasCameraError ? <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <VideoOff className="w-4 h-4" />}
                <span>{cameraEnabled && !hasCameraError ? "Cam On" : "Cam Off"}</span>
              </button>

              {/* Inline Responsive Mic Visualizer Meter */}
              {micEnabled && (
                <div className="hidden sm:flex items-center gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 h-10 border border-neutral-300 dark:border-neutral-700 rounded-none shadow-xs">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">LEVEL</span>
                  <div className="w-14 h-2 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, Math.max(8, audioLevel * 2.5))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Integrated Device Toolbar attached directly to Video card */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Connected Hardware Devices
              </span>
              <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                Live switching enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Mic Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Microphone</label>
                <LobbyDeviceDropdown
                  icon={Mic}
                  devices={audioDevices}
                  selectedDeviceId={selectedAudioDevice}
                  onSelect={handleAudioDeviceChange}
                  placeholder="Select Microphone"
                  type="mic"
                  audioLevel={audioLevel}
                />
              </div>

              {/* Speaker Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Speakers</label>
                <LobbyDeviceDropdown
                  icon={Volume2}
                  devices={speakerDevices}
                  selectedDeviceId={selectedSpeakerDevice}
                  onSelect={handleSpeakerDeviceChange}
                  placeholder="Select Speakers"
                  type="speaker"
                />
              </div>

              {/* Camera Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Camera</label>
                <LobbyDeviceDropdown
                  icon={Video}
                  devices={videoDevices}
                  selectedDeviceId={selectedVideoDevice}
                  onSelect={handleVideoDeviceChange}
                  placeholder="Select Camera"
                  type="camera"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workspace Details & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 p-6 rounded-none shadow-xs flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                {queryRoomId ? "Workspace Information" : "Workspace Configuration"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {queryRoomId
                  ? "Confirm your setup before joining the live session."
                  : "Customize your environment settings before entering."}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAndJoin(false);
              }}
              className="flex flex-col gap-4"
            >
              {/* Workspace Name with Quick Preset Chips */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  {!queryRoomId && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                      or pick a template
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Core Architecture / Live Coding"
                  disabled={!!queryRoomId}
                  required
                  className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none px-3.5 py-2.5 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-600 disabled:opacity-80 font-medium"
                />

                {/* Preset Chips */}
                {!queryRoomId && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {PRESET_TEMPLATES.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setWorkspaceName(preset)}
                        className={`text-[11px] px-2.5 py-1 border transition-colors cursor-pointer rounded-none font-mono ${
                          workspaceName === preset
                            ? "bg-blue-50 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold"
                            : "bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {!queryRoomId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                    <AlignLeft className="w-3.5 h-3.5" /> Description{" "}
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief agenda or problem statement..."
                    className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none px-3.5 py-2 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors min-h-[56px] resize-none placeholder-neutral-400 dark:placeholder-neutral-600"
                  />
                </div>
              )}

              {/* GitHub Repo */}
              {!queryRoomId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5" /> GitHub Repository{" "}
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo"
                    className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none px-3.5 py-2 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-600"
                  />
                </div>
              )}

              {/* Email Invites */}
              {!queryRoomId && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Invite Teammates
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmailInput}
                      onChange={(e) => setInviteEmailInput(e.target.value)}
                      placeholder="teammate@company.com"
                      className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none px-3 py-2 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-neutral-400 dark:placeholder-neutral-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddInviteEmail}
                      disabled={!inviteEmailInput.trim() || !inviteEmailInput.includes("@")}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-none text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Clean Subdued Slate Email Chips */}
                  {inviteEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-h-24 overflow-y-auto">
                      {inviteEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs rounded-none font-mono shadow-2xs"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInviteEmail(email)}
                            className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="submit"
                  disabled={isSubmitting || loadingRoom}
                  className="w-full h-12 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-sm rounded-none border border-[#1a73e8] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating &amp; Entering Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>{queryRoomId ? "Join Workspace Now" : "Create & Launch Workspace"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateAndJoin(true)}
                  disabled={isSubmitting || loadingRoom}
                  className="w-full h-10 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs rounded-none border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Code className="w-4 h-4 text-blue-500" />
                  <span>Launch in Companion Mode (Code &amp; Chat Only)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <CreateSessionContent />
    </Suspense>
  );
}
