"use client";

import React, { useState } from "react";
import { Style, Avatar as DiceBearAvatar } from "@dicebear/core";
import dylanDefinition from "@dicebear/styles/dylan.json";

// Create Style once at module level — reused across all Avatar renders
const dylanStyle = new Style(dylanDefinition);

export default function Avatar({ src, name, seed, size = 40, className = "" }) {
  const [imgError, setImgError] = useState(false);

  // If user has a custom avatar URL (e.g. Google photo, base64 image, or dicebear url) and no error
  if (src && !imgError && !src.includes("ui-avatars.com")) {
    return (
      <img
        src={src}
        alt={name || "User"}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgError(true)}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Use stable seed (priority: explicit seed prop -> name -> "developer")
  const rawSeed = seed || name || "developer";
  const cleanSeed = String(rawSeed)
    .replace(/\s*\((You|In Call|In Workspace)\)\s*/gi, "")
    .trim()
    .toLowerCase();

  // Generate a DiceBear dylan avatar seeded from the stable seed
  const svgDataUri = new DiceBearAvatar(dylanStyle, { seed: cleanSeed || "developer" }).toDataUri();

  return (
    <img
      src={svgDataUri}
      alt={name || "User"}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}


