"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useUserMedia(isActive = false) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [mediaError, setMediaError] = useState(null);

  const [audioDevices, setAudioDevices] = useState([]);
  const [speakerDevices, setSpeakerDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);

  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedSpeakerDevice, setSelectedSpeakerDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");

  const enumerateMediaDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Deduplicate physical audio inputs (filter out Windows 'Default - ' & 'Communications - ' aliases)
      const audioMap = new Map();
      devices
        .filter((d) => d.kind === "audioinput" && d.deviceId)
        .forEach((d) => {
          const cleanLabel = (d.label || "Microphone")
            .replace(/^(Default - |Communications - )/i, "")
            .trim();
          if (!audioMap.has(cleanLabel)) {
            audioMap.set(cleanLabel, { ...d, label: cleanLabel });
          }
        });
      const audioInputs = Array.from(audioMap.values());

      // Deduplicate physical audio outputs (Speakers)
      const speakerMap = new Map();
      devices
        .filter((d) => d.kind === "audiooutput" && d.deviceId)
        .forEach((d) => {
          const cleanLabel = (d.label || "Speakers")
            .replace(/^(Default - |Communications - )/i, "")
            .trim();
          if (!speakerMap.has(cleanLabel)) {
            speakerMap.set(cleanLabel, { ...d, label: cleanLabel });
          }
        });
      const speakerOutputs = Array.from(speakerMap.values());

      // Deduplicate physical video inputs (Cameras)
      const videoMap = new Map();
      devices
        .filter((d) => d.kind === "videoinput" && d.deviceId)
        .forEach((d) => {
          const cleanLabel = (d.label || "Camera")
            .replace(/^(Default - |Communications - )/i, "")
            .trim();
          if (!videoMap.has(cleanLabel)) {
            videoMap.set(cleanLabel, { ...d, label: cleanLabel });
          }
        });
      const videoInputs = Array.from(videoMap.values());

      setAudioDevices(audioInputs);
      setSpeakerDevices(speakerOutputs);
      setVideoDevices(videoInputs);

      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (speakerOutputs.length > 0 && !selectedSpeakerDevice) {
        setSelectedSpeakerDevice(speakerOutputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn("Error enumerating devices:", err);
    }
  }, [selectedAudioDevice, selectedSpeakerDevice, selectedVideoDevice]);

  const switchDevice = useCallback(async (audioDeviceId, videoDeviceId) => {
    try {
      const constraints = {
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
      };

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      setMediaStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
      setMediaError(null);
    } catch (err) {
      console.warn("Device switch error:", err);
    }
  }, []);

  // Initialize media ONCE when isActive becomes true
  useEffect(() => {
    if (isActive) {
      const setupMedia = async () => {
        try {
          setMediaError(null);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            setMediaStream(null);
          }

          let stream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            });
          } catch (firstErr) {
            if (firstErr.name === "NotReadableError" || firstErr.name === "OverconstrainedError") {
              try {
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: true,
                });
              } catch (secondErr) {
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: false,
                });
                setCameraEnabled(false);
                setMediaError("Camera in use by another app. Joining in audio mode.");
              }
            } else {
              throw firstErr;
            }
          }

          streamRef.current = stream;
          setMediaStream(stream);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }

          await enumerateMediaDevices();
        } catch (err) {
          console.warn("useUserMedia warning:", err);
          setMediaError("Camera/Mic not detected. Joining in text/editor mode.");
        }
      };

      setupMedia();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setMediaStream(null);
      }
    };
  }, [isActive, enumerateMediaDevices]);

  const handleAudioDeviceChange = (deviceId) => {
    setSelectedAudioDevice(deviceId);
    switchDevice(deviceId, selectedVideoDevice);
  };

  const handleSpeakerDeviceChange = (deviceId) => {
    setSelectedSpeakerDevice(deviceId);
  };

  const handleVideoDeviceChange = (deviceId) => {
    setSelectedVideoDevice(deviceId);
    switchDevice(selectedAudioDevice, deviceId);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !cameraEnabled;
        setCameraEnabled(!cameraEnabled);
      }
    } else {
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !micEnabled;
        setMicEnabled(!micEnabled);
      }
    } else {
      setMicEnabled(!micEnabled);
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMediaStream(null);
    }
  };

  return {
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
  };
}
