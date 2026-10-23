import { remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleDeleteBucket = async (bucketName: string, set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const state = get();
  const bucketIds = state.bucketIndex[activeToolId]?.[bucketName] || [];
  
  const idsToRemove = new Set<string>();
  const queue = [...bucketIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (idsToRemove.has(currentId)) continue;
    idsToRemove.add(currentId);
    
    const children = Object.values(state.fileDetailMap).filter((f) => f.parentId === currentId);
    for (const child of children) queue.push(child.id);
  }

  for (const id of idsToRemove) {
    const fileRef = state.fileDetailMap[id];
    if (fileRef) await removeFromOPFS(fileRef.storageKey);
  }

  set((prev) => {
    const nextMap = { ...prev.fileDetailMap };
    idsToRemove.forEach((id) => delete nextMap[id]);

    const nextIndex = { ...prev.bucketIndex };
    if (nextIndex[activeToolId]) {
      const toolBuckets = { ...nextIndex[activeToolId] };
      delete toolBuckets[bucketName];
      nextIndex[activeToolId] = toolBuckets;
    }

    return { fileDetailMap: nextMap, bucketIndex: nextIndex };
  });

  await syncCatalogToDatabase(get().fileDetailMap, get().bucketIndex);
};