import { remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleDeleteFile = async (bucketName: string, identifier: string | number, set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const state = get();
  const targetFile = state.getFile(bucketName, identifier);
  
  if (!targetFile) return;

  const idsToRemove = new Set<string>([targetFile.id]);
  const queue = [targetFile.id];

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
    if (nextIndex[activeToolId]) {
      const toolBuckets = { ...nextIndex[activeToolId] };
      Object.keys(toolBuckets).forEach((b) => {
        toolBuckets[b] = toolBuckets[b].filter((id) => !idsToRemove.has(id));
      });
      nextIndex[activeToolId] = toolBuckets;
    }

    return { fileDetailMap: nextMap, bucketIndex: nextIndex };
  });

  await syncCatalogToDatabase(get().fileDetailMap, get().bucketIndex);
};