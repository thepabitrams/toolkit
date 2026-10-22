// src/shared/store/file-store/actions/init.ts
import { loadCatalog } from '@/core/services/indexeddb';
import type { StoreSet, StoreGet } from '../types';

export const handleInit = async (set: StoreSet, get: StoreGet) => {
  const catalogData = await loadCatalog();
  if (catalogData) {
    set({
      original: catalogData.original || [],
      process: catalogData.process || [],
    });
  }
  await get().cleanupStorage();
};