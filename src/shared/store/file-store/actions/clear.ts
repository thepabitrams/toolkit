// src/shared/store/file-store/actions/clear.ts
import { remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleClear = async (set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  
  const myOriginalFiles = get().original.filter((ref) => ref.toolId === activeToolId);
  const myProcessedFiles = get().process.filter((ref) => ref.toolId === activeToolId);

  for (const ref of [...myOriginalFiles, ...myProcessedFiles]) {
    await removeFromOPFS(ref.storageKey);
  }

  set((state) => ({
    original: state.original.filter((ref) => ref.toolId !== activeToolId),
    process: state.process.filter((ref) => ref.toolId !== activeToolId),
  }));
  
  await syncCatalogToDatabase(get().original, get().process);
};