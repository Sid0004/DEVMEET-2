"use client";

import React, { useState, useMemo } from "react";
import { Style, Avatar as DiceBearAvatar } from "@dicebear/core";
import dylanDefinition from "@dicebear/styles/dylan.json";

// Shared DiceBear style instance
let dylanStyle = null;
try {
  dylanStyle = new Style(dylanDefinition);
} catch (err) {
  console.warn("[Avatar] Failed to initialize DiceBear style definition:", err);
}

function getInitials(name = "User") {
  return (
    String(name)
      .replace(/\s*\((You|In Call|In Workspace)\)\s*/gi, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function getGradient(name = "developer") {
  const palettes = [
    ["#2563eb", "#1d4ed8"], // Blue
    ["#059669", "#047857"], // Emerald
    ["#7c3aed", "#6d28d9"], // Violet
    ["#db2777", "#be185d"], // Pink
    ["#d97706", "#b45309"], // Amber
    ["#0891b2", "#0e7490"], // Cyan
    ["#4f46e5", "#3730a3"], // Indigo
    ["#ea580c", "#c2410c"], // Orange
  ];
  let hash = 0;
  const str = String(name);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

export default function Avatar({ src, name, seed, size = 40, className = "" }) {
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const hasError = src ? failedUrls.has(src) : false;

  const handleImgError = () => {
    if (src) {
      setFailedUrls((prev) => new Set(prev).add(src));
    }
  };

  const cleanSeed = useMemo(() => {
    const raw = seed || name || "developer";
    return String(raw)
      .replace(/\s*\((You|In Call|In Workspace)\)\s*/gi, "")
      .trim()
      .toLowerCase();
  }, [seed, name]);

  // Compute deterministic DiceBear SVG data URI as primary fallback
  const svgDataUri = useMemo(() => {
    if (!dylanStyle) return null;
    try {
      return new DiceBearAvatar(dylanStyle, {
        seed: cleanSeed || "developer",
      }).toDataUri();
    } catch {
      return null;
    }
  }, [cleanSeed]);

  // 1. If valid custom avatar URL is provided and has not failed
  if (src && !hasError && !src.includes("ui-avatars.com")) {
    return (
      <img
        key={src}
        src={src}
        alt={name || "User"}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={handleImgError}
        className={`rounded-full object-cover select-none shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }

  // 2. Deterministic vector DiceBear avatar fallback
  if (svgDataUri) {
    return (
      <img
        src={svgDataUri}
        alt={name || "User"}
        width={size}
        height={size}
        className={`rounded-full select-none shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }

  // 3. Ultra-resilient gradient badge fallback with initials
  const [bgStart, bgEnd] = getGradient(cleanSeed);
  const initials = getInitials(name || cleanSeed);
  const fontSize = Math.max(10, Math.floor(size * 0.42));

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white select-none shrink-0 shadow-xs ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})`,
        fontSize: `${fontSize}px`,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
      title={name || "User"}
    >
      {initials}
    </div>
  );
}
