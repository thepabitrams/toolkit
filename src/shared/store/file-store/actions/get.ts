// src/shared/store/file-store/actions/get.ts
import { getActiveToolIdentifier } from '../tool-context';
import type { StoreGet } from '../types';

export const handleGet = (name: string, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  return get().original.find((ref) => ref.name === name && ref.toolId === activeToolId) ||
         get().process.find((ref) => ref.name === name && ref.toolId === activeToolId);
};