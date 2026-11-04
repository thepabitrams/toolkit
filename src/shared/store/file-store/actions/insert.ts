// src/shared/store/file-store/actions/insert.ts
import { write, remove as removeFromOPFS } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import { handleToolCleanup } from './cleanupTool';
import { handleGlobalCleanup } from './cleanupGlobal';
import type { FileReference, StoreSet, StoreGet } from '../types';

export const handleInsert = async (
  uploadedFiles: File[],
  targetBucketName: string,
  maximumToolFileLimit: number,
  specificTargetIndex: number | undefined,
  parentFileIdentifier: string | undefined,
  customDisplayName: string | undefined,
  setState: StoreSet,
  getState: StoreGet
): Promise<void> => {
  const activeToolIdentifier = getActiveToolIdentifier();
  const currentStoreState = getState();
  const activeToolBuckets = currentStoreState.bucketIndex[activeToolIdentifier] || {};
  const currentBucketFileIdentifiers = [...(activeToolBuckets[targetBucketName] || [])];

  const newFileReferences: FileReference[] = [];
  const fileIdentifiersToDelete: string[] = [];

  for (let fileIndex = 0; fileIndex < uploadedFiles.length; fileIndex++) {
    const uploadedFile = uploadedFiles[fileIndex];
    const newFileIdentifier = crypto.randomUUID();
    const storageKey = `${targetBucketName}-${newFileIdentifier}`;
    
    await write(storageKey, await uploadedFile.arrayBuffer());

    const targetBucketIndex = specificTargetIndex !== undefined 
      ? specificTargetIndex + fileIndex 
      : currentBucketFileIdentifiers.length + fileIndex;
    
    let displayName = `${targetBucketName}${targetBucketIndex + 1}`;
    if (customDisplayName) {
      displayName = uploadedFiles.length > 1 
        ? `${customDisplayName}${fileIndex + 1}` 
        : customDisplayName;
    }

    if (currentBucketFileIdentifiers[targetBucketIndex]) {
      fileIdentifiersToDelete.push(currentBucketFileIdentifiers[targetBucketIndex]);
    }

    const newFileReference: FileReference = {
      id: newFileIdentifier,
      toolId: activeToolIdentifier,
      bucket: targetBucketName,
      name: displayName,
      storageKey,
      size: uploadedFile.size,
      type: uploadedFile.type,
      createdAt: Date.now(),
      parentId: parentFileIdentifier,
    };

    newFileReferences.push(newFileReference);
    currentBucketFileIdentifiers[targetBucketIndex] = newFileIdentifier;
  }

  for (const previousFileIdentifier of fileIdentifiersToDelete) {
    const previousFileReference = currentStoreState.fileDetailMap[previousFileIdentifier];
    if (previousFileReference) {
      await removeFromOPFS(previousFileReference.storageKey);
    }
  }

  setState((previousState) => {
    const updatedFileDetailMap = { ...previousState.fileDetailMap };
    
    newFileReferences.forEach((fileReference) => { 
      updatedFileDetailMap[fileReference.id] = fileReference; 
    });
    
    fileIdentifiersToDelete.forEach((fileIdentifier) => { 
      delete updatedFileDetailMap[fileIdentifier]; 
    });

    return {
      fileDetailMap: updatedFileDetailMap,
      bucketIndex: {
        ...previousState.bucketIndex,
        [activeToolIdentifier]: {
          ...activeToolBuckets,
          [targetBucketName]: currentBucketFileIdentifiers.filter(
            (fileIdentifier) => fileIdentifier !== undefined
          ),
        },
      },
    };
  });

  await syncCatalogToDatabase(getState().fileDetailMap, getState().bucketIndex);

  await handleToolCleanup(activeToolIdentifier, maximumToolFileLimit, setState, getState);
  await handleGlobalCleanup(activeToolIdentifier, setState, getState);
};