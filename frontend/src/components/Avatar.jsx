"use client";

import { Style, Avatar as DiceBearAvatar } from "@dicebear/core";
import dylanDefinition from "@dicebear/styles/dylan.json";

// Create Style once at module level — reused across all Avatar renders
const dylanStyle = new Style(dylanDefinition);

export default function Avatar({ src, name, size = 40, className = "" }) {
  // If user has a custom uploaded avatar URL (and not plain ui-avatars.com initials), use it directly
  if (src && !src.includes("ui-avatars.com")) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Clean the seed name (remove UI suffixes like "(You)" or "(In Call)")
  const cleanSeed = (name || "user")
    .replace(/\s*\((You|In Call|In Workspace)\)\s*/gi, "")
    .trim();

  // Generate a DiceBear dylan avatar seeded from the user's cleaned name
  const svgDataUri = new DiceBearAvatar(dylanStyle, { seed: cleanSeed }).toDataUri();

  return (
    <img
      src={svgDataUri}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

