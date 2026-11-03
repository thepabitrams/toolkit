// src/tools/media/image-filters/core/filters/invert.ts
export function applyInvert(pixels: Uint8ClampedArray, value: number): void {
  const factor = value / 100;
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] + (255 - pixels[i] * 2) * factor;
    pixels[i + 1] = pixels[i + 1] + (255 - pixels[i + 1] * 2) * factor;
    pixels[i + 2] = pixels[i + 2] + (255 - pixels[i + 2] * 2) * factor;
  }
}