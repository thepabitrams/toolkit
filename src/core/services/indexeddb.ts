import { openDB } from 'idb';
import type { FileReference } from '@/shared/store/file-store/types';

const DB_NAME = 'ToolKitDB';
const DB_VERSION = 1;

export const db = await openDB(DB_NAME, DB_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains('fileStore')) {
      database.createObjectStore('fileStore', { keyPath: 'id' });
    }
  },
});

export interface CatalogSchema {
  fileDetailMap: Record<string, FileReference>;
  bucketIndex: Record<string, Record<string, string[]>>;
}

export async function saveCatalog(data: CatalogSchema): Promise<void> {
  await db.put('fileStore', { id: 'main', ...data });
}

export async function loadCatalog(): Promise<CatalogSchema | null> {
  const record = await db.get('fileStore', 'main');
  return record || null;
}