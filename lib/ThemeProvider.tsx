'use client';

/**
 * ThemeProvider
 *
 * Manages the application-wide colour theme (dark | light).
 *
 * Strategy:
 *  - Reads the initial preference from localStorage key `projectpilot-theme`.
 *  - Falls back to 'dark' if no preference is stored.
 *  - Sets `data-theme` attribute on the <html> element so that CSS custom
 *    property overrides defined in globals.css apply immediately.
 *  - Exposes `theme` and `toggleTheme` via the `useTheme()` hook so any
 *    component in the tree can read or change the active theme.
 *  - Persists every change back to localStorage so the preference survives
 *    page refreshes and future visits.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  /** The currently active theme */
  theme: Theme;
  /** Toggle between dark and light */
  toggleTheme: () => void;
  /** Explicitly set a specific theme */
  setTheme: (theme: Theme) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── localStorage key ────────────────────────────────────────────────────────

const STORAGE_KEY = 'projectpilot-theme';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialise from localStorage (SSR-safe: localStorage is undefined on server)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  });

  /**
   * Apply `data-theme` attribute to <html> and persist the value whenever
   * the theme changes. This is the single source of truth that CSS variables
   * in globals.css react to.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  /** Toggle between the two supported themes */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  /** Set a specific theme explicitly (e.g. from the Settings page) */
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * `useTheme` — consume the active theme and theme actions from any client
 * component inside <ThemeProvider>.
 *
 * @throws If called outside of a <ThemeProvider> subtree.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>');
  }
  return ctx;
}
