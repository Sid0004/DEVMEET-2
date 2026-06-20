import React, { useState, useEffect } from "react";

export function SquigglyText({
  children,
  className,
  style,
  stepDuration = 70,
  scale = 6
}) {
  const [filterId] = useState(() => `squiggly-${Math.random().toString(36).substr(2, 9)}`);
  const [baseFreq, setBaseFreq] = useState("0.015");
  
  useEffect(() => {
    let timeoutId;
    const animate = () => {
      setBaseFreq(`${0.01 + Math.random() * 0.015}`);
      timeoutId = setTimeout(animate, stepDuration);
    };
    animate();
    return () => clearTimeout(timeoutId);
  }, [stepDuration]);
  
  const activeScale = Array.isArray(scale) ? scale[Math.floor(Math.random() * scale.length)] : scale;

  return (
    <span
      className={className}
      style={{
        ...style,
        filter: `url(#${filterId})`,
        display: "inline-block"
      }}
    >
      <svg style={{ display: "none" }}>
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFreq}
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={activeScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </span>
  );
}
