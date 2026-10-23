import { write, remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { FileReference, StoreSet, StoreGet } from '../types';

export const handleInsert = async (
  files: File[], 
  bucketName: string, 
  specificIndex: number | undefined, 
  parentId: string | undefined,
  customName: string | undefined,
  set: StoreSet, 
  get: StoreGet
) => {
  const activeToolId = getActiveToolIdentifier();
  const currentState = get();
  const toolBuckets = currentState.bucketIndex[activeToolId] || {};
  const currentBucketIds = [...(toolBuckets[bucketName] || [])];

  const newFileReferences: FileReference[] = [];
  const idsToDelete: string[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const fileId = crypto.randomUUID();
    const storageKey = `${bucketName}-${fileId}`;
    
    await write(storageKey, await file.arrayBuffer());

    const targetIndex = specificIndex !== undefined ? specificIndex + index : currentBucketIds.length + index;
    
    let displayName = `${bucketName}${targetIndex + 1}`;
    if (customName) {
      displayName = files.length > 1 ? `${customName}${index + 1}` : customName;
    }

    if (currentBucketIds[targetIndex]) {
      idsToDelete.push(currentBucketIds[targetIndex]);
    }

    const newFileReference: FileReference = {
      id: fileId,
      toolId: activeToolId,
      bucket: bucketName,
      name: displayName,
      storageKey,
      size: file.size,
      type: file.type,
      createdAt: Date.now(),
      parentId,
    };

    newFileReferences.push(newFileReference);
    currentBucketIds[targetIndex] = fileId;
  }

  for (const oldId of idsToDelete) {
    const oldFile = currentState.fileDetailMap[oldId];
    if (oldFile) {
      await removeFromOPFS(oldFile.storageKey);
    }
  }

  set((state) => {
    const nextDetailMap = { ...state.fileDetailMap };
    newFileReferences.forEach((reference) => { nextDetailMap[reference.id] = reference; });
    idsToDelete.forEach((id) => { delete nextDetailMap[id]; });

    return {
      fileDetailMap: nextDetailMap,
      bucketIndex: {
        ...state.bucketIndex,
        [activeToolId]: {
          ...toolBuckets,
          [bucketName]: currentBucketIds.filter((id) => id !== undefined),
        },
      },
    };
  });

  await syncCatalogToDatabase(get().fileDetailMap, get().bucketIndex);
};