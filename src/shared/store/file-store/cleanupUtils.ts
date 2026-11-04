// src/shared/store/file-store/cleanupUtils.ts
import { remove as removeFromOPFS } from '@/core/services/opfs';
import { syncCatalogToDatabase } from './file-utils';
import type { StoreSet, StoreGet, FileReference } from './types';

export const executeFileDeletions = async (
  fileIdsToDelete: Set<string>,
  setState: StoreSet,
  getState: StoreGet
): Promise<void> => {
  if (fileIdsToDelete.size === 0) {
    return;
  }

  const currentStoreState = getState();
  const allFileReferences: FileReference[] = Object.values(currentStoreState.fileDetailMap);
  const finalFileIdsToRemove = new Set<string>();
  const fileIdsProcessingQueue = Array.from(fileIdsToDelete);

  while (fileIdsProcessingQueue.length > 0) {
    const currentFileIdentifier = fileIdsProcessingQueue.shift()!;
    if (finalFileIdsToRemove.has(currentFileIdentifier)) {
      continue;
    }
    
    finalFileIdsToRemove.add(currentFileIdentifier);

    const childFileReferences = allFileReferences.filter(
      (fileReference) => fileReference.parentId === currentFileIdentifier
    );

    for (const childReference of childFileReferences) {
      if (!finalFileIdsToRemove.has(childReference.id)) {
        fileIdsProcessingQueue.push(childReference.id);
      }
    }
  }

  for (const fileIdentifier of finalFileIdsToRemove) {
    const fileReference = currentStoreState.fileDetailMap[fileIdentifier];
    if (fileReference) {
      await removeFromOPFS(fileReference.storageKey);
    }
  }

  setState((previousState) => {
    const updatedFileDetailMap = { ...previousState.fileDetailMap };
    finalFileIdsToRemove.forEach((fileIdentifier) => delete updatedFileDetailMap[fileIdentifier]);

    const updatedBucketIndex = { ...previousState.bucketIndex };
    for (const toolIdentifier in updatedBucketIndex) {
      for (const bucketName in updatedBucketIndex[toolIdentifier]) {
        updatedBucketIndex[toolIdentifier][bucketName] = updatedBucketIndex[toolIdentifier][bucketName].filter(
          (fileIdentifier) => !finalFileIdsToRemove.has(fileIdentifier)
        );
      }
    }

    return { fileDetailMap: updatedFileDetailMap, bucketIndex: updatedBucketIndex };
  });

  await syncCatalogToDatabase(getState().fileDetailMap, getState().bucketIndex);
};