// src/shared/store/file-store/file-utils.ts
import { saveCatalog } from '@/core/services/indexeddb';
import type { FileReference } from './types';

export function generateNextFileName(existingFiles: FileReference[], prefix: string): string {
  const numericSuffixes = existingFiles
    .filter((file) => file.name.startsWith(prefix))
    .map((file) => parseInt(file.name.replace(prefix, ''), 10))
    .filter((suffix) => !isNaN(suffix));
    
  const highestNumber = numericSuffixes.length > 0 ? Math.max(...numericSuffixes) : 0;
  return `${prefix}${highestNumber + 1}`;
}

export async function syncCatalogToDatabase(originalFiles: FileReference[], processedFiles: FileReference[]) {
  await saveCatalog({ original: originalFiles, process: processedFiles });
}