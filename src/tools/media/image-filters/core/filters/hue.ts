// src/tools/media/image-filters/core/filters/hue.ts
import { clamp } from '../utils/clamp';

export function applyHue(pixels: Uint8ClampedArray, degrees: number): void {
  const angle = (degrees * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const newR = clamp(r * (0.213 + cosA * 0.787 - sinA * 0.213) + g * (0.715 - cosA * 0.715 - sinA * 0.715) + b * (0.072 - cosA * 0.072 + sinA * 0.928), 0, 255);
    const newG = clamp(r * (0.213 - cosA * 0.213 + sinA * 0.143) + g * (0.715 + cosA * 0.285 + sinA * 0.140) + b * (0.072 - cosA * 0.072 - sinA * 0.283), 0, 255);
    const newB = clamp(r * (0.213 - cosA * 0.213 - sinA * 0.787) + g * (0.715 - cosA * 0.715 + sinA * 0.715) + b * (0.072 + cosA * 0.928 + sinA * 0.072), 0, 255);

    pixels[i] = newR;
    pixels[i + 1] = newG;
    pixels[i + 2] = newB;
  }
}