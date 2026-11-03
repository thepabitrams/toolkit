// src/tools/media/image-filters/core/filters/cyberpunk.ts
import { clamp } from '../utils/clamp';

export function applyCyberpunk(pixels: Uint8ClampedArray): void {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    pixels[i] = clamp(r * 1.2 + b * 0.2, 0, 255);
    pixels[i + 1] = clamp(g * 0.8, 0, 255);
    pixels[i + 2] = clamp(b * 1.2 + r * 0.1, 0, 255);
  }
}