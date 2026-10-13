"use client";

import React from "react";
import Image from "next/image";

export default function DevmeetConnectIllustration({ className = "" }) {
  return (
    <div
      className={`relative select-none pointer-events-none transition-all ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src="/assets/Devmeet_connect_with_someone2_transparent.png"
        alt="Connect with someone you know"
        width={720}
        height={454}
        className="w-full h-auto object-contain select-none pointer-events-none"
        priority
      />
    </div>
  );
}
