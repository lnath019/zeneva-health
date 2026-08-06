'use client';

import React, { createContext, useContext, useLayoutEffect, useEffect, ReactNode } from 'react';
import { buildColorVariables, ThemeColors } from '@/lib/color';
import { BRAND_COLORS } from '@/config/brand';

export const DEFAULT_THEME: ThemeColors = {
  primary: BRAND_COLORS.primary,
  secondary: BRAND_COLORS.secondary,
  tertiary: BRAND_COLORS.tertiary,
};

function applyTheme(theme: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const variables = buildColorVariables(theme);
  Object.entries(variables).forEach(([key, value]) => root.style.setProperty(key, value));
}

interface ThemeContextType {
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Avoids the SSR warning from useLayoutEffect while still applying brand
// colors before paint on the client to prevent a flash of unstyled content.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ThemeProvider({ children }: { children: ReactNode }) {
  useIsomorphicLayoutEffect(() => {
    applyTheme(DEFAULT_THEME);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: DEFAULT_THEME }}>
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