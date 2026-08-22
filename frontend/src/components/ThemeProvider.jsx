"use client";
import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

const ThemeContext = createContext(undefined);

const ACCENT_COLORS = {
  cobalt: "#0051d5",
  violet: "#7c3aed",
  emerald: "#059669",
  rose: "#e11d48",
  amber: "#d97706",
};

const emptySubscribe = () => () => {};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devmeet-theme");
      if (saved === "dark" || saved === "light") {
        return saved;
      }
      return "dark";
    }
    return "dark";
  });

  const [accent, setAccentState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("devmeet-accent") || "cobalt";
    }
    return "cobalt";
  });

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Apply theme & accent when state changes
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    const applyTheme = (t) => {
      root.classList.remove("dark");
      if (t === "dark") {
        root.classList.add("dark");
      }
    };

    applyTheme(theme);

    // Apply accent
    const accentHex = ACCENT_COLORS[accent] || ACCENT_COLORS.cobalt;
    root.style.setProperty("--color-secondary", accentHex);
    root.style.setProperty("--secondary", accentHex);
  }, [theme, accent, mounted]);

  const setTheme = (newTheme) => {
    localStorage.setItem("devmeet-theme", newTheme);
    setThemeState(newTheme);
  };

  const setAccent = (newAccent) => {
    localStorage.setItem("devmeet-accent", newAccent);
    setAccentState(newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
