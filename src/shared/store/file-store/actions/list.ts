// src/shared/store/file-store/actions/list.ts
import { getActiveToolIdentifier } from '../tool-context';
import type { StoreGet } from '../types';

export const handleList = (type: 'original' | 'process', get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const targetCollection = type === 'original' ? get().original : get().process;
  return targetCollection.filter((ref) => ref.toolId === activeToolId);
};