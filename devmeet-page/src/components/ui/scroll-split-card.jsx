"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function ScrollSplitCard({
  className,
  frontText,
  cards,
  containerRef: externalContainerRef,
}) {
  const containerRef = useRef(null);
  const [scrollContainer, setScrollContainer] = useState();

  useEffect(() => {
    if (externalContainerRef?.current) {
      setScrollContainer(externalContainerRef);
    }
  }, [externalContainerRef]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    ...(scrollContainer ? { container: scrollContainer } : {}),
    offset: ["start start", "end end"],
  });

  // Stage 1 to 2: Separation (0 to 0.4), then Stage 2 to 3: Overlap closer (0.4 to 0.8)
  const leftX = useTransform(scrollYProgress, [0, 0.4, 0.8], [0, -48, -24]);
  const rightX = useTransform(scrollYProgress, [0, 0.4, 0.8], [0, 48, 24]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);

  // Stage 2 to 3: Flip (0.4 to 0.8)
  const rotateY = useTransform(scrollYProgress, [0.4, 0.8], [0, 180]);
  // Due to 180deg Y flip, positive Z becomes visual counter-clockwise, negative Z becomes visual clockwise
  const rotateZLeft = useTransform(scrollYProgress, [0.4, 0.8], [0, 6]);
  const rotateZRight = useTransform(scrollYProgress, [0.4, 0.8], [0, -6]);

  // Dynamic borders/radii so it looks like ONE flat image initially
  const borderRadiusLeft = useTransform(scrollYProgress, [0, 0.2], ["16px 0px 0px 16px", "16px 16px 16px 16px"]);
  const borderRadiusMiddle = useTransform(scrollYProgress, [0, 0.2], ["0px 0px 0px 0px", "16px 16px 16px 16px"]);
  const borderRadiusRight = useTransform(scrollYProgress, [0, 0.2], ["0px 16px 16px 0px", "16px 16px 16px 16px"]);
  const borderOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 0.2]);
  const borderInnerColor = useTransform(scrollYProgress, [0, 0.05], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 0.4]);
  const boxShadow = useMotionTemplate`inset 0 1px 1px rgba(255, 255, 255, ${borderOpacity}), inset 0 -24px 48px rgba(0, 0, 0, ${shadowOpacity}), 0 25px 50px -12px rgba(0, 0, 0, ${shadowOpacity})`;

  // Cards move up in the last viewport
  const cardsY = useTransform(scrollYProgress, [0.8, 1], [0, -200]);

  // Text appearance at the end in the sticky viewport
  const textOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.8, 1], [40, 0]);

  // Indicator text appearance at the start
  const startTextOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const startTextY = useTransform(scrollYProgress, [0, 0.1], [0, 20]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-[500vh] w-full", className)}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden [perspective:1200px]">
        <motion.div
          style={{ scale, y: cardsY, transformStyle: "preserve-3d" }}
          className="flex h-[450px] w-full max-w-5xl px-4 relative"
        >
          {cards.slice(0, 3).map((card, i) => (
            <motion.div
              key={i}
              className="relative h-full flex-1"
              style={{
                x: i === 0 ? leftX : i === 2 ? rightX : 0,
                rotateY,
                rotateZ: i === 0 ? rotateZLeft : i === 2 ? rotateZRight : 0,
                zIndex: i, // Ensures Left is under Middle, and Right is above Middle
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front Side: Original Image Split */}
              <motion.div
                className="absolute inset-0 overflow-hidden [backface-visibility:hidden] bg-[#0c0c0c]"
                style={{
                  zIndex: 2, // Ensure front stays above initially
                  borderRadius: i === 0 ? borderRadiusLeft : i === 2 ? borderRadiusRight : borderRadiusMiddle,
                  boxShadow,
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderTopColor: "rgba(255, 255, 255, 0.1)",
                  borderBottomColor: "rgba(255, 255, 255, 0.1)",
                  borderLeftColor: i === 0 ? "rgba(255, 255, 255, 0.1)" : borderInnerColor,
                  borderRightColor: i === 2 ? "rgba(255, 255, 255, 0.1)" : borderInnerColor,
                }}
              >
                {card.frontImage ? (
                  <div className="w-full h-full">
                    <img 
                      src={card.frontImage} 
                      className="w-full h-full object-cover" 
                      alt={card.title} 
                    />
                  </div>
                ) : card.frontText ? (
                  <div className="flex h-full w-full items-center justify-center p-8 text-center">
                    <h3 className="text-xl md:text-2xl font-light text-[#f3f3f3] leading-snug tracking-tight" style={{ fontFamily: 'var(--font-aeonik)' }}>
                      {card.frontText}
                    </h3>
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 h-full w-[300%] flex items-center justify-center px-12"
                    style={{
                      left: `${-100 * i}%`,
                    }}
                  >
                     <h2 className="text-3xl md:text-5xl font-light text-center text-[#f3f3f3] max-w-3xl leading-snug tracking-tight" style={{ fontFamily: 'var(--font-aeonik)' }}>
                       {frontText}
                     </h2>
                  </div>
                )}
              </motion.div>

              {/* Back Side: New Content Card */}
              <motion.div
                className={cn(
                  "absolute inset-0 overflow-hidden flex flex-col items-center justify-center text-center p-10 [backface-visibility:hidden] will-change-transform",
                  "border border-white/10 bg-gradient-to-b from-white/5 to-transparent",
                  "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_25px_50px_-12px_rgba(0,0,0,0.5)]"
                )}
                style={{
                  backgroundColor: card.bgColor,
                  color: card.textColor,
                  transform: "rotateY(180deg)",
                  zIndex: 1, // Ensure back is behind before flip
                  borderRadius: i === 0 ? borderRadiusLeft : i === 2 ? borderRadiusRight : borderRadiusMiddle,
                }}
              >
                {/* Grainy Noise Overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png?width=256&height=256")`,
                    backgroundRepeat: "repeat",
                  }}
                />

                <div className="relative z-10 mb-6">{card.icon}</div>
                <h3 className="relative z-10 mb-5 text-3xl font-medium tracking-tight" style={{ fontFamily: 'var(--font-aeonik)' }}>
                  {card.title}
                </h3>
                <p className="relative z-10 text-base leading-relaxed opacity-90 max-w-xs" style={{ fontFamily: 'var(--font-aeonik)' }}>
                  {card.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
