// src/shared/store/file-store/actions/cleanup-storage.ts
import { remove as removeFromOPFS, listAll } from '@/core/services/opfs';
import type { StoreGet } from '../types';

export const handleCleanupStorage = async (get: StoreGet) => {
  const currentState = get();
  const validStorageKeys = new Set([
    ...currentState.original.map((ref) => ref.storageKey),
    ...currentState.process.map((ref) => ref.storageKey),
  ]);
  
  const allFilesInStorage = await listAll();
  for (const fileKey of allFilesInStorage) {
    if (!validStorageKeys.has(fileKey)) {
      await removeFromOPFS(fileKey);
    }
  }
};