"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setCredentials, logout } from "@/redux/features/authSlice";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";
import Avatar from "@/components/Avatar";
import {
  User,
  Code2,
  Video,
  Sparkles,
  Palette,
  Lock,
  Building2,
  Bell,
  Save,
  AlertCircle,
  Loader2,
  Check,
  Pencil,
  RotateCcw,
} from "lucide-react";

// Modular Section Components
import ProfileSection from "./components/ProfileSection";
import EditorSection from "./components/EditorSection";
import MediaSection from "./components/MediaSection";
import AiSection from "./components/AiSection";
import AppearanceSection from "./components/AppearanceSection";
import WorkspaceSection from "./components/WorkspaceSection";
import NotificationsSection from "./components/NotificationsSection";
import SecuritySection from "./components/SecuritySection";
import AvatarModal from "./components/AvatarModal";
import SettingsSkeleton from "./components/SettingsSkeleton";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, accent, setTheme, setAccent } = useTheme();

  // Mount & Loading State
  const [isMounted, setIsMounted] = useState(false);

  // Active Category Tab
  const [activeTab, setActiveTab] = useState("profile");
  const [wobbleTrigger, setWobbleTrigger] = useState(false);

  // Form & Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profession, setProfession] = useState("Student");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Editor & Media & AI Preferences State
  const [preferences, setPreferences] = useState({
    defaultLanguage: "javascript",
    editorKeybinding: "standard",
    editorFontSize: 14,
    editorTabSize: 2,
    wordWrap: true,
    autoCloseBrackets: true,
    formatOnSave: true,
    fontLigatures: true,
    noiseSuppression: true,
    autoMuteOnJoin: false,
    videoMirror: true,
    videoQuality: "720p",
    aiCopilot: true,
    aiInterviewAssistance: true,
    proctoringGazeDetection: false,
    autoMeetingSummary: true,
    roomPrivacy: "open",
    chatChimes: true,
    participantJoinChimes: true,
    emailNotifications: true,
    workspaceDigest: "weekly",
  });

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Media Devices Diagnostic State
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [isCameraTesting, setIsCameraTesting] = useState(false);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const videoPreviewRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const micAnimRef = useRef(null);

  // Helper to mark preferences as dirty
  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  // Initialize from user state
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setProfession(user.profession || "Student");
      setBio(user.bio || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setAvatarUrl(user.avatar || "");
      if (user.preferences) {
        setPreferences((prev) => ({ ...prev, ...user.preferences }));
      }
      setIsSaved(true);
    }
  }, [user]);

  // Listen for page-switch attempts to wobble Discard button only
  useEffect(() => {
    const handleWobble = () => {
      setWobbleTrigger(true);
      setTimeout(() => setWobbleTrigger(false), 700);
    };
    window.addEventListener("devmeet:wobble_discard", handleWobble);
    return () => window.removeEventListener("devmeet:wobble_discard", handleWobble);
  }, []);

  // Warn on page leave / browser tab close if unsaved
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__devmeet_unsaved_settings = !isSaved;
    }
    const handleBeforeUnload = (e) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (typeof window !== "undefined") {
        window.__devmeet_unsaved_settings = false;
      }
    };
  }, [isSaved]);

  // Discard Unsaved Changes
  const handleDiscardChanges = () => {
    if (user) {
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setProfession(user.profession || "Student");
      setBio(user.bio || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setAvatarUrl(user.avatar || "");
      if (user.preferences) {
        setPreferences((prev) => ({ ...prev, ...user.preferences }));
      }
    }
    setIsSaved(true);
    if (typeof window !== "undefined") {
      window.__devmeet_unsaved_settings = false;
    }
  };

  // Enumerate Media Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const vDevs = devices.filter((d) => d.kind === "videoinput");
          const aDevs = devices.filter((d) => d.kind === "audioinput");
          setVideoDevices(vDevs);
          setAudioDevices(aDevs);
          if (vDevs[0]) setSelectedVideoDevice(vDevs[0].deviceId);
          if (aDevs[0]) setSelectedAudioDevice(aDevs[0].deviceId);
        }
      } catch {
        // Device permissions not granted
      }
    };
    getDevices();
  }, []);

  // Cleanup Streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (micAnimRef.current) {
        cancelAnimationFrame(micAnimRef.current);
      }
    };
  }, []);

  // Toggle Camera Test
  const handleToggleCameraTest = async () => {
    if (isCameraTesting) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsCameraTesting(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setIsCameraTesting(true);
      } catch {
        setErrorMsg("Unable to access camera. Check browser permissions.");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    }
  };

  // Toggle Microphone Test
  const handleToggleMicTest = async () => {
    if (isMicTesting) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (micAnimRef.current) {
        cancelAnimationFrame(micAnimRef.current);
      }
      setIsMicTesting(false);
      setMicLevel(0);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          video: false,
        });

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const avg = sum / dataArray.length;
          const level = Math.min(100, Math.round((avg / 128) * 100));
          setMicLevel(level);
          micAnimRef.current = requestAnimationFrame(updateMeter);
        };

        updateMeter();
        setIsMicTesting(true);
      } catch {
        setErrorMsg("Unable to access microphone. Check browser permissions.");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    }
  };

  // Play Audio Test Chime
  const handlePlayTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable
    }
  };

  // Save Profile & Preferences
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (isSaved && !isSaving) {
      return; // Already saved, prevent flicker
    }
    setIsSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        fullName,
        username,
        profession,
        bio,
        githubUrl,
        linkedinUrl,
        avatar: avatarUrl,
        preferences,
      };

      const response = await apiRequest("/api/v1/users/update-profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (response?.data) {
        dispatch(setCredentials({ user: response.data }));
        setIsSaved(true);
        setWobbleTrigger(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Roll Random Vector Avatar
  const handleRandomizeAvatar = () => {
    const randomSeed = `dev_${Math.floor(100000 + Math.random() * 900000)}`;
    setAvatarUrl(`https://api.dicebear.com/7.x/dylan/svg?seed=${randomSeed}`);
    setIsAvatarModalOpen(false);
    setIsSaved(false);
  };

  // Handle System File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Image size exceeds 2MB limit.");
        setTimeout(() => setErrorMsg(""), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        setIsAvatarModalOpen(false);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiRequest("/api/v1/users/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setPasswordSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("/api/v1/users/logout", { method: "POST" });
    } catch {
      // Ignore network errors
    }
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.removeItem("devmeet-token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  // 8 Categories: Security & Sessions is placed LAST as requested
  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "editor", label: "Editor & Canvas", icon: Code2 },
    { id: "media", label: "Audio & Video", icon: Video },
    { id: "ai", label: "AI & Intelligence", icon: Sparkles },
    { id: "appearance", label: "Appearance & Theme", icon: Palette },
    { id: "workspace", label: "Workspace & Team", icon: Building2 },
    { id: "notifications", label: "Notifications & Sound", icon: Bell },
    { id: "security", label: "Security & Sessions", icon: Lock },
  ];

  const accentOptions = [
    { id: "cobalt", name: "Cobalt Blue", hex: "#0051d5" },
    { id: "violet", name: "Deep Violet", hex: "#7c3aed" },
    { id: "emerald", name: "Emerald", hex: "#059669" },
    { id: "rose", name: "Crimson Rose", hex: "#e11d48" },
    { id: "amber", name: "Amber Gold", hex: "#d97706" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Avatar Selection Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        fullName={fullName}
        username={username}
        user={user}
        handleRandomizeAvatar={handleRandomizeAvatar}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
        setIsSaved={setIsSaved}
      />

      {/* Boxy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-1">
            Developer environment, audio/video devices, AI intelligence, security, and workspace tenancy.
          </p>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {!isSaved && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              className={`h-10 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                wobbleTrigger
                  ? "bg-red-600 hover:bg-red-700 text-white border border-red-700 font-bold animate-wobble scale-105"
                  : "bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 border border-red-300 dark:border-red-800"
              }`}
              title="Discard unsaved changes and revert to saved profile"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className={`w-40 h-10 inline-flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors duration-150 cursor-pointer disabled:opacity-50 shrink-0 border shadow-sm ${
              isSaving
                ? "bg-amber-400 dark:bg-amber-500 text-neutral-950 border-amber-500 font-bold"
                : !isSaved
                  ? "bg-amber-400 hover:bg-amber-300 text-neutral-950 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-neutral-950 border-amber-500 font-bold"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white border-emerald-600 font-bold"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Saving...</span>
              </>
            ) : !isSaved ? (
              <>
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Saved</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Boxy Navigation Tabs + Boxy Content Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0">
          <div className="hidden md:flex flex-col items-center p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}
              title="Click to edit profile photo"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black flex items-center justify-center transition-all group-hover:border-neutral-900 dark:group-hover:border-white shadow-sm">
                <Avatar
                  src={avatarUrl || user?.avatar || null}
                  name={fullName || username || "Developer"}
                  size={112}
                />
              </div>

              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Pencil className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Edit</span>
              </div>
            </div>

            <div className="mt-3 w-full">
              <div className="text-sm font-mono font-bold text-neutral-900 dark:text-white truncate">
                {fullName || "Developer"}
              </div>
              <div className="text-[11px] font-mono text-neutral-400 truncate">
                @{username || "user"}
              </div>
              <div className="mt-2 inline-block px-2 py-0.5 text-[9px] font-mono uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {profession}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-1 w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-all text-left whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-semibold"
                      : "bg-white dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Panels */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* TAB 1: PROFILE & IDENTITY */}
          {activeTab === "profile" && (
            <ProfileSection
              user={user}
              fullName={fullName}
              setFullName={setFullName}
              username={username}
              setUsername={setUsername}
              profession={profession}
              setProfession={setProfession}
              bio={bio}
              setBio={setBio}
              githubUrl={githubUrl}
              setGithubUrl={setGithubUrl}
              linkedinUrl={linkedinUrl}
              setLinkedinUrl={setLinkedinUrl}
              setIsSaved={setIsSaved}
            />
          )}

          {/* TAB 2: EDITOR & CANVAS */}
          {activeTab === "editor" && (
            <EditorSection
              preferences={preferences}
              updatePreference={updatePreference}
            />
          )}

          {/* TAB 3: AUDIO & VIDEO */}
          {activeTab === "media" && (
            <MediaSection
              videoDevices={videoDevices}
              audioDevices={audioDevices}
              selectedVideoDevice={selectedVideoDevice}
              setSelectedVideoDevice={setSelectedVideoDevice}
              selectedAudioDevice={selectedAudioDevice}
              setSelectedAudioDevice={setSelectedAudioDevice}
              isCameraTesting={isCameraTesting}
              handleToggleCameraTest={handleToggleCameraTest}
              videoPreviewRef={videoPreviewRef}
              isMicTesting={isMicTesting}
              handleToggleMicTest={handleToggleMicTest}
              micLevel={micLevel}
              handlePlayTestSound={handlePlayTestSound}
              preferences={preferences}
              updatePreference={updatePreference}
            />
          )}

          {/* TAB 4: AI & INTELLIGENCE */}
          {activeTab === "ai" && (
            <AiSection
              preferences={preferences}
              updatePreference={updatePreference}
            />
          )}

          {/* TAB 5: APPEARANCE & THEME */}
          {activeTab === "appearance" && (
            <AppearanceSection
              theme={theme}
              setTheme={setTheme}
              accent={accent}
              setAccent={setAccent}
              accentOptions={accentOptions}
            />
          )}

          {/* TAB 6: WORKSPACE & TEAM */}
          {activeTab === "workspace" && (
            <WorkspaceSection
              user={user}
              copiedInvite={copiedInvite}
              setCopiedInvite={setCopiedInvite}
            />
          )}

          {/* TAB 7: NOTIFICATIONS & SOUND */}
          {activeTab === "notifications" && (
            <NotificationsSection
              preferences={preferences}
              updatePreference={updatePreference}
            />
          )}

          {/* TAB 8: SECURITY & SESSIONS (LAST) */}
          {activeTab === "security" && (
            <SecuritySection
              user={user}
              oldPassword={oldPassword}
              setOldPassword={setOldPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              isChangingPassword={isChangingPassword}
              passwordSuccess={passwordSuccess}
              passwordError={passwordError}
              handleChangePassword={handleChangePassword}
              handleLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          )}
        </div>
      </div>
    </div>
  );
}
