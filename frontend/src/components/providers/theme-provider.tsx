'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  accent: string; // hex color e.g. #0A84FF
  density: 'comfortable' | 'compact';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccent: (hex: string) => void;
  setDensity: (d: 'comfortable' | 'compact') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'vitalit-theme',
  ACCENT: 'vitalit-accent',
  DENSITY: 'vitalit-density',
};

const DEFAULTS = {
  theme: 'system' as Theme,
  accent: '#0A84FF',
  density: 'comfortable' as const,
};

function applyThemeToDOM(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved: 'light' | 'dark' = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

function applyAccentToDOM(hex: string) {
  const root = document.documentElement;
  // Update primary token in RGB format for consistency with CSS vars
  const toRgb = (h: string) => {
    const m = h.replace('#', '');
    const bigint = parseInt(m, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r} ${g} ${b}`;
  };
  root.style.setProperty('--primary', toRgb(hex));
}

function applyDensityToDOM(density: 'comfortable' | 'compact') {
  document.documentElement.setAttribute('data-density', density);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULTS.theme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccentState] = useState<string>(DEFAULTS.accent);
  const [density, setDensityState] = useState<'comfortable' | 'compact'>(DEFAULTS.density);

  // Initialize from storage / system
  useEffect(() => {
    const savedTheme = (localStorage.getItem(STORAGE_KEYS.THEME) as Theme) || DEFAULTS.theme;
    const savedAccent = localStorage.getItem(STORAGE_KEYS.ACCENT) || DEFAULTS.accent;
    const savedDensity = (localStorage.getItem(STORAGE_KEYS.DENSITY) as 'comfortable' | 'compact') || DEFAULTS.density;

    setThemeState(savedTheme);
    setAccentState(savedAccent);
    setDensityState(savedDensity);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const resolved = applyThemeToDOM(theme);
    setActualTheme(resolved);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Apply accent changes
  useEffect(() => {
    applyAccentToDOM(accent);
    localStorage.setItem(STORAGE_KEYS.ACCENT, accent);
  }, [accent]);

  // Apply density changes
  useEffect(() => {
    applyDensityToDOM(density);
    localStorage.setItem(STORAGE_KEYS.DENSITY, density);
  }, [density]);

  // React to system theme changes when in 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setActualTheme(applyThemeToDOM('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  };

  const setTheme = (t: Theme) => setThemeState(t);
  const setAccent = (hex: string) => setAccentState(hex);
  const setDensity = (d: 'comfortable' | 'compact') => setDensityState(d);

  const value = useMemo(
    () => ({ theme, actualTheme, accent, density, setTheme, toggleTheme, setAccent, setDensity }),
    [theme, actualTheme, accent, density]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
