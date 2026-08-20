"use client";

import React from "react";
import { Camera, Mic, Video, Play, Volume2 } from "lucide-react";

export default function MediaSection({
  videoDevices,
  audioDevices,
  selectedVideoDevice,
  setSelectedVideoDevice,
  selectedAudioDevice,
  setSelectedAudioDevice,
  isCameraTesting,
  handleToggleCameraTest,
  videoPreviewRef,
  isMicTesting,
  handleToggleMicTest,
  micLevel,
  handlePlayTestSound,
  preferences,
  updatePreference,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          Audio & Video Diagnostic Matrix
        </span>
        <span className="text-[11px] font-mono text-neutral-400">WEBRTC MEDIA</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Device Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Video Input Device
            </label>
            <select
              value={selectedVideoDevice}
              onChange={(e) => setSelectedVideoDevice(e.target.value)}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default System Camera</option>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" /> Audio Input Device
            </label>
            <select
              value={selectedAudioDevice}
              onChange={(e) => setSelectedAudioDevice(e.target.value)}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default System Microphone</option>
              )}
            </select>
          </div>
        </div>

        {/* Hardware Diagnostic Canvas */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col gap-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
            Hardware Testing Canvas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera Test Preview */}
            <div className="flex flex-col gap-2">
              <div className="w-full h-36 bg-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center relative overflow-hidden">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraTesting ? "block" : "hidden"} ${preferences.videoMirror ? "scale-x-[-1]" : ""}`}
                />
                {!isCameraTesting && (
                  <div className="text-center p-3">
                    <Video className="w-6 h-6 text-neutral-600 mx-auto mb-1" />
                    <span className="text-xs font-mono text-neutral-500">CAMERA STANDBY</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleToggleCameraTest}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                {isCameraTesting ? "Halt Camera Feed" : "Test Camera Feed"}
              </button>
            </div>

            {/* Microphone Level & Sound Test */}
            <div className="flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-600 dark:text-neutral-400">MIC INPUT DB LEVEL</span>
                  <span className="text-neutral-900 dark:text-neutral-200 font-bold">{isMicTesting ? `${micLevel}%` : "IDLE"}</span>
                </div>
                <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${isMicTesting ? micLevel : 0}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleToggleMicTest}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isMicTesting ? "Halt Mic Test" : "Test Microphone"}
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase">Speaker Output</div>
                  <div className="text-[11px] text-neutral-400">Verify audio playback</div>
                </div>
                <button
                  type="button"
                  onClick={handlePlayTestSound}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Play Chime</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audio/Video Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">AI Noise Suppression</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Filter keyboard clicks & background fans.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.noiseSuppression}
              onChange={(e) => updatePreference("noiseSuppression", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Auto Mute On Join</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Enter meeting rooms with microphone muted.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoMuteOnJoin}
              onChange={(e) => updatePreference("autoMuteOnJoin", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Mirror Camera Preview</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Flip feed horizontally for natural orientation.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.videoMirror}
              onChange={(e) => updatePreference("videoMirror", e.target.checked)}
              className="w-4 h-4 rounded-none text-neutral-900 focus:ring-0 cursor-pointer"
            />
          </label>

          <div className="flex flex-col justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 gap-2">
            <div>
              <div className="text-xs font-mono font-bold uppercase">Video Quality Preset</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Preferred outbound video stream resolution.</p>
            </div>
            <select
              value={preferences.videoQuality}
              onChange={(e) => updatePreference("videoQuality", e.target.value)}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value="480p">480p SD (Low Bandwidth)</option>
              <option value="720p">720p HD (Balanced)</option>
              <option value="1080p">1080p FHD (Crisp)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
