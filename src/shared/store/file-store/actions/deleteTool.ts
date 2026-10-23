import { remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleDeleteTool = async (set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const state = get();
  const toolBuckets = state.bucketIndex[activeToolId] || {};
  const allIds = Object.values(toolBuckets).flat();
  
  const idsToRemove = new Set(allIds);
  const queue = [...allIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = Object.values(state.fileDetailMap).filter((f) => f.parentId === currentId);
    for (const child of children) {
      if (!idsToRemove.has(child.id)) {
        idsToRemove.add(child.id);
        queue.push(child.id);
      }
    }
  }

  for (const id of idsToRemove) {
    const fileRef = state.fileDetailMap[id];
    if (fileRef) await removeFromOPFS(fileRef.storageKey);
  }

  set((prev) => {
    const nextMap = { ...prev.fileDetailMap };
    idsToRemove.forEach((id) => delete nextMap[id]);
    const nextIndex = { ...prev.bucketIndex };
    delete nextIndex[activeToolId];
    return { fileDetailMap: nextMap, bucketIndex: nextIndex };
  });

  await syncCatalogToDatabase(get().fileDetailMap, get().bucketIndex);
};