"use client";

import React, { useEffect, useRef } from "react";

/**
 * AudioStreamManager
 * 
 * Production-grade WebRTC Audio Persistence Layer.
 * Decouples audio playback from UI video components.
 * 
 * Prevents the critical defect where turning off a camera (or unmounting a video grid)
 * cuts off the peer's microphone audio.
 */
export default function AudioStreamManager({
  remoteStreams = {},
  remoteMediaStates = {},
}) {
  return (
    <div style={{ display: "none" }} aria-hidden="true" data-testid="audio-sink-manager">
      {Object.entries(remoteStreams).map(([socketId, stream]) => {
        if (!stream) return null;
        const isMicMuted = !!remoteMediaStates[socketId]?.isMicMuted;
        return (
          <PeerAudioSink
            key={socketId}
            socketId={socketId}
            stream={stream}
            isMuted={isMicMuted}
          />
        );
      })}
    </div>
  );
}

function PeerAudioSink({ socketId, stream, isMuted }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !stream) return;

    if (audioEl.srcObject !== stream) {
      audioEl.srcObject = stream;
    }

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay may be deferred until user interacts with the document
        console.warn(`[AudioSink] Autoplay for peer ${socketId} awaiting user interaction:`, err.message);
      });
    }
  }, [stream, socketId]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={isMuted}
      data-peer-id={socketId}
    />
  );
}
