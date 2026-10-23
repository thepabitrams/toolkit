import { saveCatalog } from '@/core/services/indexeddb';
import type { FileReference } from './types';

export async function syncCatalogToDatabase(
  fileDetailMap: Record<string, FileReference>,
  bucketIndex: Record<string, Record<string, string[]>>
) {
  await saveCatalog({ fileDetailMap, bucketIndex });
}