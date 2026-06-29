'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Accent = 'cobalt' | 'violet' | 'emerald' | 'rose' | 'amber';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_COLORS = {
  cobalt: '#0051d5',
  violet: '#7c3aed',
  emerald: '#059669',
  rose: '#e11d48',
  amber: '#d97706',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [accent, setAccentState] = useState<Accent>('cobalt');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('devmeet-theme') as Theme;
    const savedAccent = localStorage.getItem('devmeet-accent') as Accent;

    // eslint-disable-next-line
    if (savedTheme) setThemeState(savedTheme);
    // eslint-disable-next-line
    if (savedAccent) setAccentState(savedAccent);
    
    setMounted(true);
  }, []);

  // Apply theme & accent when state changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply theme
    const applyTheme = (t: Theme) => {
      root.classList.remove('dark');
      if (t === 'dark') {
        root.classList.add('dark');
      } else if (t === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        }
      }
    };

    applyTheme(theme);

    // Apply accent
    const accentHex = ACCENT_COLORS[accent] || ACCENT_COLORS.cobalt;
    root.style.setProperty('--color-secondary', accentHex);
    root.style.setProperty('--secondary', accentHex);

    // Watch for system theme changes if set to system
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, accent, mounted]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('devmeet-theme', newTheme);
    setThemeState(newTheme);
  };

  const setAccent = (newAccent: Accent) => {
    localStorage.setItem('devmeet-accent', newAccent);
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
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
