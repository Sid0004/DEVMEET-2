"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export function SplineScene({
  sceneUrl = "https://my.spline.design/funnycharacters-YwAizu8fjYYhArwvBQr1UuWN/",
  className = "",
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative w-full h-full min-h-[350px] lg:min-h-[500px] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 ${className}`}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-50 dark:bg-[#121214] z-10 transition-opacity">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 font-mono tracking-wide">
            Loading 3D Scene...
          </span>
        </div>
      )}

      {/* Spline 3D Embed */}
      <iframe
        src={sceneUrl}
        title="3D Characters"
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 absolute inset-0 select-none pointer-events-auto"
        allow="accelerometer; autoplay; camera; gyroscope; microphone; xr-spatial-tracking"
        loading="lazy"
      />
    </div>
  );
}
