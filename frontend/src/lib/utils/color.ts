function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function rgbToHex(r: number, g: number, b: number) {
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

/**
 * Adjust the luminance of a hex color
 * @param hex - Hex color string (e.g., "#ff0000")
 * @param amt - Amount to adjust (-1 to 1, where -1 is darker, 1 is lighter)
 * @returns Adjusted hex color string
 */
export function adjustLuminance(hex: string, amt: number): string {
  try {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return hex;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    const nr = Math.round(clamp01(r / 255 + amt) * 255);
    const ng = Math.round(clamp01(g / 255 + amt) * 255);
    const nb = Math.round(clamp01(b / 255 + amt) * 255);
    return rgbToHex(nr, ng, nb);
  } catch {
    return hex;
  }
}

