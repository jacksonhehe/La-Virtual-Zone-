import { useState, useEffect } from 'react';

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(fg: string, bg: string): number {
  const [fr, fg2, fb] = hexToRgb(fg);
  const [br, bg2, bb] = hexToRgb(bg);
  const L1 = luminance(fr, fg2, fb) + 0.05;
  const L2 = luminance(br, bg2, bb) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

export default function useContrastCheck(
  foreground: string,
  background: string,
  threshold = 4.5
) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      setOk(contrastRatio(foreground, background) >= threshold);
    } catch {
      setOk(false);
    }
  }, [foreground, background, threshold]);
  return ok;
}
