// src/shared/store/file-store/actions/read.ts
import { read as readFromOPFS } from '@/core/services/opfs';
import type { StoreGet } from '../types';

export const handleRead = async (name: string, get: StoreGet) => {
  const fileReference = get().get(name);
  if (!fileReference) return null;
  const fileBytes = await readFromOPFS(fileReference.storageKey);
  return new Blob([fileBytes], { type: fileReference.type });
};