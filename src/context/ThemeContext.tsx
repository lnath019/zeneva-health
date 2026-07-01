'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from 'react';
import { darkenTriplet, hexToTriplet, lightenTriplet } from '@/lib/color';

export type ThemeColorKey = 'primary' | 'secondary' | 'tertiary';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

export const DEFAULT_THEME: ThemeColors = {
  primary: '#16A34A',
  secondary: '#EA580C',
  tertiary: '#F4F4F5',
};

export interface ThemePreset {
  name: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: 'Emerald & Amber', colors: { primary: '#16A34A', secondary: '#EA580C', tertiary: '#F4F4F5' } },
  { name: 'Violet & Lime', colors: { primary: '#7C3AED', secondary: '#84CC16', tertiary: '#F5F3FF' } },
  { name: 'Rose & Slate', colors: { primary: '#E11D48', secondary: '#475569', tertiary: '#FDF2F4' } },
  { name: 'Forest & Gold', colors: { primary: '#15803D', secondary: '#CA8A04', tertiary: '#F4F8F4' } },
];

const STORAGE_KEY = 'zeneva_theme';
const HOVER_WEIGHT = 0.16;
const LIGHT_WEIGHT = 0.9;
const TERTIARY_HOVER_WEIGHT = 0.08;
const TERTIARY_LIGHT_WEIGHT = 0.5;

function applyTheme(theme: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--color-primary', hexToTriplet(theme.primary));
  root.style.setProperty('--color-primary-hover', darkenTriplet(theme.primary, HOVER_WEIGHT));
  root.style.setProperty('--color-primary-light', lightenTriplet(theme.primary, LIGHT_WEIGHT));

  root.style.setProperty('--color-secondary', hexToTriplet(theme.secondary));
  root.style.setProperty('--color-secondary-hover', darkenTriplet(theme.secondary, HOVER_WEIGHT));
  root.style.setProperty('--color-secondary-light', lightenTriplet(theme.secondary, LIGHT_WEIGHT));

  root.style.setProperty('--color-tertiary', hexToTriplet(theme.tertiary));
  root.style.setProperty('--color-tertiary-hover', darkenTriplet(theme.tertiary, TERTIARY_HOVER_WEIGHT));
  root.style.setProperty('--color-tertiary-light', lightenTriplet(theme.tertiary, TERTIARY_LIGHT_WEIGHT));
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
