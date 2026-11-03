// src/tools/media/image-filters/core/filters/moon.ts
import { applyGrayscale } from './grayscale';
import { applyContrast } from './contrast';
import { applyBrightness } from './brightness';
import { clamp } from '../utils/clamp';

export function applyMoon(pixels: Uint8ClampedArray): void {
  applyGrayscale(pixels);
  applyContrast(pixels, 110);
  applyBrightness(pixels, 5);
  
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 2] = clamp(pixels[i + 2] + 10, 0, 255);
  }
}