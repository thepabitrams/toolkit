// src/shared/store/file-store/actions/init.ts
import { loadCatalog } from '@/core/services/indexeddb';
import { getActiveToolIdentifier } from '../tool-context';
import { handleToolCleanup } from './cleanupTool';
import { handleGlobalCleanup } from './cleanupGlobal';
import type { StoreSet, StoreGet } from '../types';

export const handleInit = async (
  maximumToolFileLimit: number,
  set: StoreSet, 
  get: StoreGet
): Promise<void> => {
  const catalogData = await loadCatalog();
  
  if (catalogData) {
    set({
      fileDetailMap: catalogData.fileDetailMap || {},
      bucketIndex: catalogData.bucketIndex || {},
    });

    const activeToolIdentifier = getActiveToolIdentifier();
    await handleToolCleanup(activeToolIdentifier, maximumToolFileLimit, set, get);
    await handleGlobalCleanup(activeToolIdentifier, set, get);
  }
};