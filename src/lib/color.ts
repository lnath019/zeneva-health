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
