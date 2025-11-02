export function adjustLuminance(hex: string, amount: number): string {
  const rgb = hexToRGB(hex);
  if (!rgb) return hex;
  
  const adjust = (val: number) => {
    const newVal = Math.round(val + amount * 255);
    return Math.max(0, Math.min(255, newVal));
  };
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

function hexToRGB(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRGB(hex);
  if (!rgb) return null;
  
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  
  const r = toLin(rgb.r);
  const g = toLin(rgb.g);
  const b = toLin(rgb.b);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

