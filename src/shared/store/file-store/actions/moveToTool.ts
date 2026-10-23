import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handleMoveToTool = async (fileName: string | undefined, targetToolId: string | undefined, set: StoreSet, get: StoreGet) => {
  const sourceToolId = getActiveToolIdentifier();
  const destinationToolId = targetToolId || sourceToolId;
  const currentState = get();
  const sourceBuckets = currentState.bucketIndex[sourceToolId] || {};
  const processIds = sourceBuckets['process'] || [];
  
  let idsToPromote = processIds;
  if (fileName) {
    const specificFile = Object.values(currentState.fileDetailMap).find(
      (ref) => ref.name === fileName && ref.toolId === sourceToolId && ref.bucket === 'process'
    );
    if (specificFile) {
      idsToPromote = [specificFile.id];
    } else {
      return;
    }
  }

  if (idsToPromote.length === 0) return;

  set((state) => {
    const nextDetailMap = { ...state.fileDetailMap };
    const nextBucketIndex = { ...state.bucketIndex };

    if (nextBucketIndex[sourceToolId]?.process) {
      nextBucketIndex[sourceToolId] = {
        ...nextBucketIndex[sourceToolId],
        process: nextBucketIndex[sourceToolId].process.filter(id => !idsToPromote.includes(id))
      };
    }

    const targetBuckets = nextBucketIndex[destinationToolId] || {};
    const targetOriginal = [...(targetBuckets['original'] || [])];

    idsToPromote.forEach((id) => {
      const oldRef = nextDetailMap[id];
      if (oldRef) {
        const newId = crypto.randomUUID();
        const newIndex = targetOriginal.length;
        const newName = `original${newIndex}`;

        nextDetailMap[newId] = {
          ...oldRef,
          id: newId,
          toolId: destinationToolId,
          bucket: 'original',
          name: newName,
          parentId: undefined,
          createdAt: Date.now(),
        };
        
        targetOriginal.push(newId);
        delete nextDetailMap[id];
      }
    });

    nextBucketIndex[destinationToolId] = {
      ...targetBuckets,
      original: targetOriginal
    };

    return { fileDetailMap: nextDetailMap, bucketIndex: nextBucketIndex };
  });

  await syncCatalogToDatabase(get().fileDetailMap, get().bucketIndex);
};