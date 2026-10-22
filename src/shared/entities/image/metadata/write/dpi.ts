// src/entities/image/metadata/write/dpi.ts
import { writeExif } from './writeExif';
import type { ExifTags } from '../types';

const SUPPORTED_DPI_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/tif',
  'image/avif',
  'image/heic',
  'image/webp',
  'image/jp2',
  'image/j2c',
]);

export function constructDpiMetadataTags(targetDpi: number, fileMimeType: string): ExifTags {
  const metadataTags: ExifTags = {
    XResolution: Math.round(targetDpi),
    YResolution: Math.round(targetDpi),
    ResolutionUnit: 'inches',
  };

  if (fileMimeType === 'image/png') {
    const calculatedPixelsPerMeter = Math.round((targetDpi * 10000) / 254);
    metadataTags.PixelsPerUnitX = calculatedPixelsPerMeter;
    metadataTags.PixelsPerUnitY = calculatedPixelsPerMeter;
    metadataTags.PixelUnits = 'meters';
  }

  return metadataTags;
}

export async function writeDpi(targetFile: File, targetDpi: number): Promise<Blob> {
  if (!SUPPORTED_DPI_MIME_TYPES.has(targetFile.type)) {
    return targetFile;
  }
  
  const metadataTags = constructDpiMetadataTags(targetDpi, targetFile.type);
  return writeExif(targetFile, metadataTags);
}