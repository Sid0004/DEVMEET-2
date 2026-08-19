"use client";

import React, { useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export type TransitionVariant =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "rectangle"
  | "star";

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
}

const getClipPaths = (
  variant: TransitionVariant,
  x: number,
  y: number,
  r: number
): [string, string] => {
  switch (variant) {
    case "square":
      return [
        `inset(${y}px ${window.innerWidth - x}px ${window.innerHeight - y}px ${x}px)`,
        `inset(0px 0px 0px 0px)`,
      ];
    case "diamond":
      return [
        `polygon(${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px)`,
        `polygon(${x}px ${y - r * 1.5}px, ${x + r * 1.5}px ${y}px, ${x}px ${y + r * 1.5}px, ${x - r * 1.5}px ${y}px)`,
      ];
    case "hexagon": {
      const points = (radius: number) => {
        const p = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 2;
          p.push(`${x + radius * Math.cos(a)}px ${y + radius * Math.sin(a)}px`);
        }
        return `polygon(${p.join(", ")})`;
      };
      return [points(0), points(r * 1.3)];
    }
    case "star": {
      const star = (radius: number) => {
        const p = [];
        for (let i = 0; i < 10; i++) {
          const rad = i % 2 === 0 ? radius : radius * 0.45;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          p.push(`${x + rad * Math.cos(a)}px ${y + rad * Math.sin(a)}px`);
        }
        return `polygon(${p.join(", ")})`;
      };
      return [star(0), star(r * 1.4)];
    }
    case "triangle":
      return [
        `polygon(${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px)`,
        `polygon(${x}px ${y - r * 2}px, ${x + r * 1.8}px ${y + r}px, ${x - r * 1.8}px ${y + r}px)`,
      ];
    case "circle":
    default:
      return [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${r}px at ${x}px ${y}px)`,
      ];
  }
};

const emptySubscribe = () => () => {};

export const AnimatedThemeToggler = ({
  className,
  duration = 500,
  variant = "circle",
  fromCenter = false,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const button = buttonRef.current;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (!fromCenter && button) {
      const rect = button.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const [clipFrom, clipTo] = getClipPaths(variant, x, y, maxRadius);

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [clipFrom, clipTo],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-full text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-90 outline-none [&_svg]:size-4",
        className
      )}
      aria-label="Toggle dark mode"
      {...props}
    >
      {isDark ? (
        <Sun className="text-neutral-200 rotate-0 transition-transform duration-300" />
      ) : (
        <Moon className="text-neutral-700 -rotate-12 transition-transform duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

