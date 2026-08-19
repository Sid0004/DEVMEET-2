"use client";
import React, { useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const clipPathVariants = {
  circle: (x, y, r) => `circle(${r}px at ${x}px ${y}px)`,
  square: (x, y, r) => `inset(${Math.max(0, y - r)}px ${Math.max(0, window.innerWidth - (x + r))}px ${Math.max(0, window.innerHeight - (y + r))}px ${Math.max(0, x - r)}px)`,
  triangle: (x, y, r) => `polygon(${x}px ${y - r}px, ${x + r}px ${y + r}px, ${x - r}px ${y + r}px)`,
  diamond: (x, y, r) => `polygon(${x}px ${y - r}px, ${x + r}px ${y}px, ${x}px ${y + r}px, ${x - r}px ${y}px)`,
  rectangle: (x, y, r) => `inset(${Math.max(0, y - r * 0.7)}px ${Math.max(0, window.innerWidth - (x + r * 1.3))}px ${Math.max(0, window.innerHeight - (y + r * 0.7))}px ${Math.max(0, x - r * 1.3)}px)`,
  hexagon: (x, y, r) => `polygon(${x + r * 0.866}px ${y - r * 0.5}px, ${x + r * 0.866}px ${y + r * 0.5}px, ${x}px ${y + r}px, ${x - r * 0.866}px ${y + r * 0.5}px, ${x - r * 0.866}px ${y - r * 0.5}px, ${x}px ${y - r}px)`,
  star: (x, y, r) => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? r : r * 0.45;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      points.push(`${x + radius * Math.cos(angle)}px ${y + radius * Math.sin(angle)}px`);
    }
    return `polygon(${points.join(", ")})`;
  },
};

export function AnimatedThemeToggler({
  variant = "circle",
  duration = 500,
  fromCenter = false,
  className,
  ...props
}) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const buttonRef = useRef(null);

  const isDark = theme === "dark";

  const toggleTheme = (event) => {
    const newTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (!fromCenter && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const getClipPath = clipPathVariants[variant] || clipPathVariants.circle;

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        getClipPath(x, y, 0),
        getClipPath(x, y, endRadius),
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  };

  if (!mounted) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center p-2.5 rounded-full border border-neutral-200 dark:border-white/15 bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 shadow-sm backdrop-blur-md transition-colors",
          className
        )}
        aria-label="Toggle dark mode"
        {...props}
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center p-2.5 rounded-full border border-neutral-200 dark:border-white/15 bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
      aria-label="Toggle dark mode"
      {...props}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0 text-neutral-700" />
      )}
    </button>
  );
}
