// src/entities/image/metadata/read/dpi.ts
import { readExif } from './readExif';
import type { ExifTags } from '../types';

export function extractDpi(metadataTags: ExifTags): { dpi?: number; unit?: string } {
  let calculatedDpi: number | undefined = undefined;
  let resolvedUnit = 'px';

  const horizontalResolution = parseNumericMetadataValue(metadataTags.XResolution);
  const verticalResolution = parseNumericMetadataValue(metadataTags.YResolution);
  
  if (horizontalResolution != null && verticalResolution != null) {
    calculatedDpi = Math.round((horizontalResolution + verticalResolution) / 2);
  }

  if (!calculatedDpi) {
    const horizontalPixelsPerUnit = parseNumericMetadataValue(metadataTags.PixelsPerUnitX);
    const verticalPixelsPerUnit = parseNumericMetadataValue(metadataTags.PixelsPerUnitY);
    
    if (horizontalPixelsPerUnit != null && verticalPixelsPerUnit != null) {
      const averagePixelsPerUnit = (horizontalPixelsPerUnit + verticalPixelsPerUnit) / 2;
      calculatedDpi = Math.round(averagePixelsPerUnit * 0.0254);
    }
  }

  const rawResolutionUnit = parseNumericMetadataValue(metadataTags.ResolutionUnit);
  if (rawResolutionUnit === 2) resolvedUnit = 'inch';
  else if (rawResolutionUnit === 3) resolvedUnit = 'cm';

  return { dpi: calculatedDpi, unit: resolvedUnit };
}

export async function readDpi(
  targetFile: File
): Promise<{ dpi?: number; unit?: string }> {
  const metadataTags = await readExif(targetFile);
  return extractDpi(metadataTags);
}

function parseNumericMetadataValue(rawMetadataValue: unknown): number | undefined {
  if (rawMetadataValue == null) return undefined;
  const parsedNumericValue = typeof rawMetadataValue === 'number' ? rawMetadataValue : Number(rawMetadataValue);
  return Number.isFinite(parsedNumericValue) ? parsedNumericValue : undefined;
}