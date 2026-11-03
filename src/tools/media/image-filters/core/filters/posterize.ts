// src/tools/media/image-filters/core/filters/posterize.ts
import { clamp } from '../utils/clamp';

export function applyPosterize(pixels: Uint8ClampedArray, levels: number): void {
  if (levels <= 1) return;
  const step = 255 / (levels - 1);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = clamp(Math.round(pixels[i] / step) * step, 0, 255);
    pixels[i + 1] = clamp(Math.round(pixels[i + 1] / step) * step, 0, 255);
    pixels[i + 2] = clamp(Math.round(pixels[i + 2] / step) * step, 0, 255);
  }
}