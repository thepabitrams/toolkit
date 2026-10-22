// src/entities/image/metadata/read/dimensions.ts
import { readExif } from './readExif';
import type { ExifTags } from '../types';

export function extractDimensions(metadataTags: ExifTags): {
  width?: number;
  height?: number;
  unit?: string;
} {
  const parsedWidth = parseNumericMetadataValue(metadataTags.ImageWidth);
  const parsedHeight = parseNumericMetadataValue(metadataTags.ImageHeight);
  let resolvedUnit = 'px';

  const rawResolutionUnit = parseNumericMetadataValue(metadataTags.ResolutionUnit);
  if (rawResolutionUnit === 2) resolvedUnit = 'inch';
  else if (rawResolutionUnit === 3) resolvedUnit = 'cm';

  return { width: parsedWidth, height: parsedHeight, unit: resolvedUnit };
}

export async function readDimensions(
  targetFile: File
): Promise<{ width?: number; height?: number; unit?: string }> {
  const metadataTags = await readExif(targetFile);
  const extractedDimensions = extractDimensions(metadataTags);

  if (extractedDimensions.width != null && extractedDimensions.height != null) {
    return extractedDimensions;
  }

  return calculateDimensionsFromBlob(targetFile);
}

function calculateDimensionsFromBlob(fileBlob: Blob): Promise<{ width?: number; height?: number; unit?: string }> {
  return new Promise((resolve) => {
    const imageObjectUrl = URL.createObjectURL(fileBlob);
    const temporaryImageElement = new Image();
    
    temporaryImageElement.onload = () => {
      URL.revokeObjectURL(imageObjectUrl);
      resolve({ width: temporaryImageElement.naturalWidth, height: temporaryImageElement.naturalHeight, unit: 'px' });
    };
    
    temporaryImageElement.onerror = () => {
      URL.revokeObjectURL(imageObjectUrl);
      resolve({});
    };
    
    temporaryImageElement.src = imageObjectUrl;
  });
}

function parseNumericMetadataValue(rawMetadataValue: unknown): number | undefined {
  if (rawMetadataValue == null) return undefined;
  const parsedNumericValue = typeof rawMetadataValue === 'number' ? rawMetadataValue : Number(rawMetadataValue);
  return Number.isFinite(parsedNumericValue) ? parsedNumericValue : undefined;
}