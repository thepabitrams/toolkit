// src/entities/image/metadata/read/readExif.ts
import { parseMetadata } from '@uswriting/exiftool';
import type { ExifTags } from '../types';

let cachedInFlightRequest: { targetFile: File; promise: Promise<ExifTags> } | null = null;

export async function readExif(targetFile: File): Promise<ExifTags> {
  if (cachedInFlightRequest && cachedInFlightRequest.targetFile === targetFile) {
    return cachedInFlightRequest.promise;
  }

  const metadataPromise = executeMetadataExtraction(targetFile);
  cachedInFlightRequest = { targetFile, promise: metadataPromise };

  try {
    return await metadataPromise;
  } finally {
    if (cachedInFlightRequest && cachedInFlightRequest.promise === metadataPromise) {
      cachedInFlightRequest = null;
    }
  }
}

async function executeMetadataExtraction(targetFile: File): Promise<ExifTags> {
  try {
    const extractionResult = await parseMetadata(targetFile, {
      args: ['-json', '-n'],
      transform: (rawStringifiedData: string) => JSON.parse(rawStringifiedData),
    });
    
    if (extractionResult.success && extractionResult.data) {
      return (extractionResult.data[0] as ExifTags) || {};
    }
  } catch (error) {
    console.debug('[readExif] Failed:', error);
  }
  return {};
}