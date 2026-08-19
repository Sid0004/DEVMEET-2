"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Keyboard, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { useUserMedia } from "@/hooks/useUserMedia";
import PreJoinLobby from "./lobby/PreJoinLobby";

export default function InlineCodeJoinBar({ onExpandChange }) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const userName = user?.name
    ? user.name.toUpperCase()
    : user?.email
    ? user.email.split("@")[0].toUpperCase()
    : "DEVELOPER";

  const inputRef = useRef(null);
  const [joinCode, setJoinCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isVerifyingRoom, setIsVerifyingRoom] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verifiedRoom, setVerifiedRoom] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [loaderText, setLoaderText] = useState("");

  // Custom User Media Hook
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
  } = useUserMedia(!!verifiedRoom);

  const handleClose = useCallback(() => {
    setIsFocused(false);
    setVerifiedRoom(null);
    setVerifyError(null);
    setJoinCode("");
    stopMedia();
  }, [stopMedia]);

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(!!verifiedRoom);
    }
  }, [verifiedRoom, onExpandChange]);

  // Global ESC shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // URL / Code Smart Extractor
  const parseRoomCode = (input) => {
    if (!input) return "";
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/[?&]room=([a-zA-Z0-9_-]{4,12})/);
    if (urlMatch) return urlMatch[1];
    const cleanCode = trimmed.replace(/[^a-zA-Z0-9_-]/g, "");
    return cleanCode;
  };

  const parsedTargetRoomId = parseRoomCode(joinCode);
  const isCodeFormatValid = parsedTargetRoomId.length >= 6;

  const verifyRoomCode = async (targetCode) => {
    const codeToTest = targetCode || parsedTargetRoomId;
    if (!codeToTest || codeToTest.length < 4) return;

    setIsVerifyingRoom(true);
    setVerifyError(null);
    try {
      const response = await apiRequest(`/api/v1/rooms/${codeToTest}`, {
        method: "GET",
      });
      if (response.data) {
        setVerifiedRoom(response.data);
      } else {
        setVerifyError(`Room "${codeToTest}" does not exist or has ended.`);
        setVerifiedRoom(null);
      }
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || `Room "${codeToTest}" does not exist or has ended.`
      );
      setVerifiedRoom(null);
    } finally {
      setIsVerifyingRoom(false);
    }
  };

  const handleJoinSession = async (noVC = false) => {
    if (!verifiedRoom) return;
    const roomId = verifiedRoom.roomId || parsedTargetRoomId;
    setIsJoining(true);
    setLoaderText(noVC ? "Entering Companion Mode..." : "Joining Workspace...");

    // Stop pre-join camera lobby media tracks before navigating to workspace room
    stopMedia();

    try {
      if (noVC) {
        router.push(`/workspace?room=${roomId}&novc=true`);
      } else {
        router.push(`/workspace?room=${roomId}`);
      }
    } catch (err) {
      console.error("Navigation error:", err);
      setIsJoining(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      {/* Permanent Fixed Search Bar Pill (Never moves or shifts layout on close!) */}
      <div className="w-full flex flex-col items-center gap-3 max-w-md">
        <div className="relative w-full rounded-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20 transition-all duration-200 shadow-sm dark:shadow-xl overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isCodeFormatValid && !isVerifyingRoom) {
                verifyRoomCode();
              }
            }}
            className="flex items-center gap-3 px-4 h-12 w-full"
          >
            <Keyboard className="w-4 h-4 text-neutral-400 dark:text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={joinCode}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setJoinCode(e.target.value);
                if (verifyError) setVerifyError(null);
              }}
              placeholder="Enter a code or link"
              className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none text-[15px] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-400 flex-1 font-normal w-full"
              style={{ backgroundColor: "transparent", border: "none", outline: "none", boxShadow: "none" }}
            />
            {isVerifyingRoom ? (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-full text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 dark:text-emerald-400" />
                <span>Verifying...</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!isCodeFormatValid}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isCodeFormatValid
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer active:scale-95"
                    : "bg-neutral-100 dark:bg-[#36373b] text-neutral-400 dark:text-gray-400 opacity-70 cursor-not-allowed"
                }`}
              >
                <span>Join</span>
              </button>
            )}
          </form>
        </div>

        {/* Separate Floating Oval Error Pill */}
        {verifyError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-xs font-medium text-red-400 shadow-md backdrop-blur-md"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span>{verifyError}</span>
          </motion.div>
        )}
      </div>

      {/* Fixed Screen Overlay Pre-Join Lobby Modal (Zero layout shift on close!) */}
      <AnimatePresence>
        {verifiedRoom && (
          <PreJoinLobby
            verifiedRoom={verifiedRoom}
            userName={userName}
            videoRef={videoRef}
            streamRef={streamRef}
            mediaStream={mediaStream}
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            mediaError={mediaError}
            audioDevices={audioDevices}
            speakerDevices={speakerDevices}
            videoDevices={videoDevices}
            selectedAudioDevice={selectedAudioDevice}
            selectedSpeakerDevice={selectedSpeakerDevice}
            selectedVideoDevice={selectedVideoDevice}
            onAudioDeviceChange={handleAudioDeviceChange}
            onSpeakerDeviceChange={handleSpeakerDeviceChange}
            onVideoDeviceChange={handleVideoDeviceChange}
            toggleCamera={toggleCamera}
            toggleMic={toggleMic}
            isJoining={isJoining}
            loaderText={loaderText}
            onJoin={handleJoinSession}
            onClose={handleClose}
            onReset={() => {
              setVerifiedRoom(null);
              setJoinCode("");
              setIsFocused(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
