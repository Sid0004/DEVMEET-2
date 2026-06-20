"use client"

import React, { useState, useEffect, useId } from "react"

interface SquigglyTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  stepDuration?: number
  scale?: number | [number, number]
}

export function SquigglyText({
  children,
  className,
  style,
  stepDuration = 70,
  scale = 6,
}: SquigglyTextProps) {
  const id = useId()
  const filterId = `squiggly-${id.replace(/:/g, "")}`
  const [baseFreq, setBaseFreq] = useState("0.015")

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const animate = () => {
      setBaseFreq(`${0.01 + Math.random() * 0.015}`)
      timeoutId = setTimeout(animate, stepDuration)
    }
    animate()
    return () => clearTimeout(timeoutId)
  }, [stepDuration])

  const activeScale = Array.isArray(scale)
    ? scale[Math.floor(Math.random() * scale.length)]
    : scale

  return (
    <span
      className={className}
      style={{
        ...style,
        filter: `url(#${filterId})`,
        display: "inline-block",
      }}
    >
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
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
  )
}
