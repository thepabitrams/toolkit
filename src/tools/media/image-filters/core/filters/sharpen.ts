// src/tools/media/image-filters/core/filters/sharpen.ts
import { convolution } from '../utils/convolution';

export function applySharpen(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number
): void {
  if (strength <= 0) return;

  const factor = strength / 100;
  const kernel = [
    0, -1 * factor, 0,
    -1 * factor, 1 + 4 * factor, -1 * factor,
    0, -1 * factor, 0
  ];

  convolution(pixels, width, height, kernel, 3);
}