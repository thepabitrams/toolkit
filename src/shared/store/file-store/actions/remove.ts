// src/shared/store/file-store/actions/remove.ts
import { remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleRemove = async (name: string, set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  
  const fileReference = get().original.find((ref) => ref.name === name && ref.toolId === activeToolId) ||
                        get().process.find((ref) => ref.name === name && ref.toolId === activeToolId);
  if (!fileReference) return;

  const isOriginalFile = get().original.some((ref) => ref.name === name && ref.toolId === activeToolId);
  const allChildFiles = get().findChildFiles(fileReference.id).filter((ref) => ref.toolId === activeToolId);

  for (const child of allChildFiles) {
    await removeFromOPFS(child.storageKey);
  }
  await removeFromOPFS(fileReference.storageKey);

  if (isOriginalFile) {
    set((state) => ({
      original: state.original.filter((ref) => !(ref.name === name && ref.toolId === activeToolId)),
      process: state.process.filter((proc) => !allChildFiles.some((descendant) => descendant.id === proc.id)),
    }));
  } else {
    set((state) => ({
      process: state.process.filter((ref) => !(ref.name === name && ref.toolId === activeToolId) && !allChildFiles.some((descendant) => descendant.id === ref.id)),
    }));
  }

  await syncCatalogToDatabase(get().original, get().process);
};