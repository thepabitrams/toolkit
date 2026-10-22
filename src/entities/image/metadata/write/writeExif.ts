// src/entities/image/metadata/write/writeExif.ts
import { writeMetadata } from '@uswriting/exiftool';
import type { ExifTags } from '../types';

export async function writeExif(targetFile: File, metadataTags: ExifTags): Promise<Blob> {
  try {
    const writeResult = await writeMetadata(targetFile, metadataTags);
    
    if (writeResult.success) {
      return new Blob([writeResult.data], { type: targetFile.type });
    }
  } catch (error) {
    console.debug('[writeExif] Failed:', error);
  }
  
  return targetFile;
}