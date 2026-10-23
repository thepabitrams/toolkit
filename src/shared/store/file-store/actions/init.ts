import { loadCatalog } from '@/core/services/indexeddb';
import type { StoreSet, StoreGet } from '../types';

export const handleInit = async (set: StoreSet, get: StoreGet): Promise<void> => {
  const catalogData = await loadCatalog();
  
  if (catalogData) {
    set({
      fileDetailMap: catalogData.fileDetailMap || {},
      bucketIndex: catalogData.bucketIndex || {},
    });
  }
};