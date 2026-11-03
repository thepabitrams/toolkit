// src/tools/media/image-filters/core/filters/clarendon.ts
import { applyContrast } from './contrast';
import { applySaturation } from './saturation';
import { applyTemperature } from './temperature';

export function applyClarendon(pixels: Uint8ClampedArray): void {
  applyContrast(pixels, 125);
  applySaturation(pixels, 135);
  applyTemperature(pixels, -10);
}