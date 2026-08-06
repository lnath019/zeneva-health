type RgbTuple = [number, number, number];

export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

function hexToRgb(hex: string): RgbTuple {
  const sanitized = hex.replace('#', '');
  const value = parseInt(sanitized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(hex: string, target: RgbTuple, weight: number): RgbTuple {
  const [r, g, b] = hexToRgb(hex);
  return [
    Math.round(r + (target[0] - r) * weight),
    Math.round(g + (target[1] - g) * weight),
    Math.round(b + (target[2] - b) * weight),
  ];
}

function tripletString(rgb: RgbTuple): string {
  return rgb.join(' ');
}

export function hexToTriplet(hex: string): string {
  return tripletString(hexToRgb(hex));
}

export function darkenTriplet(hex: string, weight: number): string {
  return tripletString(mix(hex, [0, 0, 0], weight));
}

export function lightenTriplet(hex: string, weight: number): string {
  return tripletString(mix(hex, [255, 255, 255], weight));
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

export const HOVER_WEIGHT = 0.16;
export const LIGHT_WEIGHT = 0.9;
export const TERTIARY_HOVER_WEIGHT = 0.08;
export const TERTIARY_LIGHT_WEIGHT = 0.5;

// Derives the hover/light shades Tailwind's primary/secondary/tertiary
// utilities read from a base theme. Shared by the SSR default in
// src/app/layout.tsx and the runtime theme switcher in ThemeContext.
export function buildColorVariables(theme: ThemeColors): Record<string, string> {
  return {
    '--color-primary': hexToTriplet(theme.primary),
    '--color-primary-hover': darkenTriplet(theme.primary, HOVER_WEIGHT),
    '--color-primary-light': lightenTriplet(theme.primary, LIGHT_WEIGHT),
    '--color-secondary': hexToTriplet(theme.secondary),
    '--color-secondary-hover': darkenTriplet(theme.secondary, HOVER_WEIGHT),
    '--color-secondary-light': lightenTriplet(theme.secondary, LIGHT_WEIGHT),
    '--color-tertiary': hexToTriplet(theme.tertiary),
    '--color-tertiary-hover': darkenTriplet(theme.tertiary, TERTIARY_HOVER_WEIGHT),
    '--color-tertiary-light': lightenTriplet(theme.tertiary, TERTIARY_LIGHT_WEIGHT),
  };
}
