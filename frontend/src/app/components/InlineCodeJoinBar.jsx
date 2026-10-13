"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";

export default function InlineCodeJoinBar({ onExpandChange }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [joinCode, setJoinCode] = useState("");
  const [isVerifyingRoom, setIsVerifyingRoom] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

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
  const isCodeFormatValid = parsedTargetRoomId.length >= 4;

  const verifyAndNavigate = async () => {
    if (!parsedTargetRoomId || parsedTargetRoomId.length < 4) return;

    setIsVerifyingRoom(true);
    setVerifyError(null);
    try {
      const response = await apiRequest(`/api/v1/rooms/${parsedTargetRoomId}`, {
        method: "GET",
      });
      if (response.data) {
        router.push(`/dashboard/new?room=${parsedTargetRoomId}`);
      } else {
        setVerifyError(`Room "${parsedTargetRoomId}" does not exist or has ended.`);
      }
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || `Room "${parsedTargetRoomId}" does not exist or has ended.`
      );
    } finally {
      setIsVerifyingRoom(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      {/* Permanent Fixed Search Bar (Zero layout shift) */}
      <div className="relative w-full max-w-md">
        <div
          className={`relative w-full rounded-none bg-white dark:bg-[#121316] border transition-all duration-200 shadow-sm dark:shadow-xl ${
            verifyError
              ? "border-red-500/80 dark:border-red-500/80"
              : "border-neutral-300 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20"
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isCodeFormatValid && !isVerifyingRoom) {
                verifyAndNavigate();
              }
            }}
            className="flex items-center gap-3 px-4 h-12 w-full"
          >
            <Keyboard className="w-4 h-4 text-neutral-400 dark:text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value);
                if (verifyError) setVerifyError(null);
              }}
              placeholder="Enter a code or link"
              className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none text-[15px] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-400 flex-1 font-normal w-full"
              style={{ backgroundColor: "transparent", border: "none", outline: "none", boxShadow: "none" }}
            />
            {isVerifyingRoom ? (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-none text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 dark:text-emerald-400" />
                <span>Verifying...</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!isCodeFormatValid}
                className={`px-5 py-2 rounded-none text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isCodeFormatValid
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer active:scale-95"
                    : "bg-neutral-100 dark:bg-[#36373b] text-neutral-400 dark:text-gray-400 opacity-70 cursor-not-allowed"
                }`}
              >
                <span>Join</span>
              </button>
            )}
          </form>
        </div>

        {/* Absolute Floating Warning Alert (Zero layout shift!) */}
        <AnimatePresence>
          {verifyError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 z-30 flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1a1b1e] border border-red-500/50 text-red-600 dark:text-red-400 text-xs font-medium shadow-xl rounded-none select-none"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <span>{verifyError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
