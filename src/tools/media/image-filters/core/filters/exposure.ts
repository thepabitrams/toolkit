// src/tools/media/image-filters/core/filters/exposure.ts
import { clamp } from '../utils/clamp';

export function applyExposure(pixels: Uint8ClampedArray, value: number): void {
  const factor = Math.pow(2, value / 50);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = clamp(pixels[i] * factor, 0, 255);
    pixels[i + 1] = clamp(pixels[i + 1] * factor, 0, 255);
    pixels[i + 2] = clamp(pixels[i + 2] * factor, 0, 255);
  }
}