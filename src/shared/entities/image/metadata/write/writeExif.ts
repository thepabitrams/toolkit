// src/entities/image/metadata/write/writeExif.ts
import { writeMetadata } from '@uswriting/exiftool';
import type { ExifTags } from '../types';

export async function writeExif(targetFile: File, metadataTags: ExifTags): Promise<Blob> {
  try {
    const writeResult = await writeMetadata(targetFile, metadataTags, {
      fetch: (input: unknown) => {
        const stringifiedInput = input instanceof Request ? input.url : String(input);
        const finalUrl = stringifiedInput.endsWith('zeroperl.wasm') 
          ? '/zeroperl.wasm' 
          : stringifiedInput;
        return fetch(finalUrl);
      }
    });
    
    if (writeResult.success) {
      return new Blob([writeResult.data], { type: targetFile.type });
    }
  } catch (error) {
    console.debug('[writeExif] Failed:', error);
  }
  
  return targetFile;
}