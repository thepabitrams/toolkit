import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleReorderBucket = async (
  bucketName: string, 
  startIndex: number, 
  endIndex: number, 
  set: StoreSet, 
  get: StoreGet
) => {
  const activeToolId = getActiveToolIdentifier();
  const state = get();
  const toolBuckets = state.bucketIndex[activeToolId] || {};
  const bucketIds = [...(toolBuckets[bucketName] || [])];

  if (startIndex < 0 || startIndex >= bucketIds.length || endIndex < 0 || endIndex >= bucketIds.length) return;

  const [movedId] = bucketIds.splice(startIndex, 1);
  bucketIds.splice(endIndex, 0, movedId);

  const nextDetailMap = { ...state.fileDetailMap };
  
  bucketIds.forEach((id, index) => {
    if (nextDetailMap[id]) {
      nextDetailMap[id] = { ...nextDetailMap[id], name: `${bucketName}${index}` };
    }
  });

  set({
    fileDetailMap: nextDetailMap,
    bucketIndex: {
      ...state.bucketIndex,
      [activeToolId]: {
        ...toolBuckets,
        [bucketName]: bucketIds,
      }
    }
  });

  await syncCatalogToDatabase(get().fileDetailMap, get().bucketIndex);
};