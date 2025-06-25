import { useEffect, useState } from 'react';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const normalized = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const num = parseInt(normalized, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export default function useContrastCheck(
  foreground: string,
  background: string,
  ratio = 4.5
): boolean {
  const [pass, setPass] = useState(true);

  useEffect(() => {
    try {
      const fg = hexToRgb(foreground);
      const bg = hexToRgb(background);
      setPass(contrast(fg, bg) >= ratio);
    } catch {
      setPass(true);
    }
  }, [foreground, background, ratio]);

  return pass;
}
