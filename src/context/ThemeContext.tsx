'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from 'react';
import { buildColorVariables, ThemeColors } from '@/lib/color';
import { BRAND_COLORS } from '@/config/brand';

export type ThemeColorKey = 'primary' | 'secondary' | 'tertiary';
export type { ThemeColors };

export const DEFAULT_THEME: ThemeColors = {
  primary: BRAND_COLORS.primary,
  secondary: BRAND_COLORS.secondary,
  tertiary: BRAND_COLORS.tertiary,
};

export interface ThemePreset {
  name: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: 'Zeniva Brand', colors: DEFAULT_THEME },
  { name: 'Violet & Lime', colors: { primary: '#7C3AED', secondary: '#84CC16', tertiary: '#F5F3FF' } },
  { name: 'Rose & Slate', colors: { primary: '#E11D48', secondary: '#475569', tertiary: '#FDF2F4' } },
  { name: 'Forest & Gold', colors: { primary: '#15803D', secondary: '#CA8A04', tertiary: '#F4F8F4' } },
];

const STORAGE_KEY = 'zeneva_theme';

function applyTheme(theme: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const variables = buildColorVariables(theme);
  Object.entries(variables).forEach(([key, value]) => root.style.setProperty(key, value));
}

function loadStoredTheme(): ThemeColors | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.primary && parsed.secondary && parsed.tertiary) {
      return parsed as ThemeColors;
    }
  } catch {
    // ignore malformed storage
  }
  return null;
}

interface ThemeContextType {
  theme: ThemeColors;
  setColor: (key: ThemeColorKey, hex: string) => void;
  applyPreset: (preset: ThemeColors) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Avoids the SSR warning from useLayoutEffect while still applying the
// saved theme before paint on the client to prevent a flash of default colors.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);

  useIsomorphicLayoutEffect(() => {
    const stored = loadStoredTheme();
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  const persist = (next: ThemeColors) => {
    setTheme(next);
    applyTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const setColor = (key: ThemeColorKey, hex: string) => {
    persist({ ...theme, [key]: hex });
  };

  const applyPreset = (preset: ThemeColors) => {
    persist(preset);
  };

  const resetTheme = () => {
    persist(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme, setColor, applyPreset, resetTheme }}>
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
