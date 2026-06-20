"use client";

import { Style, Avatar as DiceBearAvatar } from "@dicebear/core";
import dylanDefinition from "@dicebear/styles/dylan.json";

// Create Style once at module level — reused across all Avatar renders
const dylanStyle = new Style(dylanDefinition);

type Props = {
  src?: string | null;   // optional uploaded avatar URL
  name: string;          // used as seed if no src
  size?: number;         // size in px, default 40
  className?: string;
};

export default function Avatar({ src, name, size = 40, className = "" }: Props) {
  // If user has a real avatar URL, use it directly
  if (src) {
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

  // Generate a DiceBear dylan avatar seeded from the user's name
  const svgDataUri = new DiceBearAvatar(dylanStyle, { seed: name }).toDataUri();

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