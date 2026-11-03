// src/tools/media/image-filters/core/canvasProcessor.ts
import type { FilterState } from './types';
import { applyBrightness } from './filters/brightness';
import { applyContrast } from './filters/contrast';
import { applySaturation } from './filters/saturation';
import { applyTemperature } from './filters/temperature';
import { applyGrayscale } from './filters/grayscale';
import { applySepia } from './filters/sepia';
import { applyBlur } from './filters/blur';
import { applySharpen } from './filters/sharpen';
import { applyHighlights } from './filters/highlights';
import { applyShadows } from './filters/shadows';
import { applyVignette } from './filters/vignette';
import { applyNoir } from './filters/noir';
import { applyVintage } from './filters/vintage';
import { applyHDR } from './filters/hdr';
import { applyHue } from './filters/hue';
import { applyExposure } from './filters/exposure';
import { applyPosterize } from './filters/posterize';
import { applyInvert } from './filters/invert';
import { applyClarendon } from './filters/clarendon';
import { applyMoon } from './filters/moon';
import { applyCyberpunk } from './filters/cyberpunk';

export function processCanvas(
  canvasContext: CanvasRenderingContext2D,
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  filterState: FilterState
): void {
  const width = sourceImage.width;
  const height = sourceImage.height;

  canvasContext.drawImage(sourceImage, 0, 0, width, height);

  const imageData = canvasContext.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  if (filterState.temperature !== 0) applyTemperature(pixels, filterState.temperature);
  if (filterState.exposure !== 0) applyExposure(pixels, filterState.exposure);
  if (filterState.brightness !== 0) applyBrightness(pixels, filterState.brightness);
  if (filterState.contrast !== 100) applyContrast(pixels, filterState.contrast);
  if (filterState.saturation !== 100) applySaturation(pixels, filterState.saturation);
  if (filterState.hue !== 0) applyHue(pixels, filterState.hue);
  if (filterState.posterize > 0) applyPosterize(pixels, filterState.posterize);
  if (filterState.blur > 0) applyBlur(pixels, width, height, filterState.blur);
  if (filterState.highlights !== 0) applyHighlights(pixels, filterState.highlights);
  if (filterState.shadows !== 0) applyShadows(pixels, filterState.shadows);
  if (filterState.sharpness > 0) applySharpen(pixels, width, height, filterState.sharpness);
  if (filterState.invert > 0) applyInvert(pixels, filterState.invert);

  if (filterState.grayscale) applyGrayscale(pixels);
  if (filterState.sepia) applySepia(pixels);
  if (filterState.noir) applyNoir(pixels);
  if (filterState.vintage) applyVintage(pixels, width, height);
  if (filterState.vignette && !filterState.vintage) applyVignette(pixels, width, height);
  if (filterState.hdr) applyHDR(pixels);
  
  if (filterState.clarendon) applyClarendon(pixels);
  if (filterState.moon) applyMoon(pixels);
  if (filterState.cyberpunk) applyCyberpunk(pixels);

  canvasContext.putImageData(imageData, 0, 0);
}