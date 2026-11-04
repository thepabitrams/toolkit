// src/shared/store/file-store/actions/cleanupGlobal.ts
import { executeFileDeletions } from '../cleanupUtils';
import type { StoreSet, StoreGet } from '../types';

const MAXIMUM_GLOBAL_FILE_LIMIT = 100;

export const handleGlobalCleanup = async (
  activeToolIdentifier: string,
  setState: StoreSet,
  getState: StoreGet
): Promise<void> => {
  const currentStoreState = getState();
  const fileIdsToDelete = new Set<string>();

  const allFileReferences = Object.values(currentStoreState.fileDetailMap);
  const totalFileCount = allFileReferences.length;

  if (totalFileCount > MAXIMUM_GLOBAL_FILE_LIMIT) {
    const otherToolFileReferences = allFileReferences.filter(
      (fileReference) => fileReference.toolId !== activeToolIdentifier
    );

    if (otherToolFileReferences.length > 0) {
      const totalCreationTimestamp = otherToolFileReferences.reduce(
        (sum, fileReference) => sum + fileReference.createdAt, 
        0
      );
      
      const averageCreationTimestamp = totalCreationTimestamp / otherToolFileReferences.length;

      otherToolFileReferences.forEach((fileReference) => {
        if (fileReference.createdAt < averageCreationTimestamp) {
          fileIdsToDelete.add(fileReference.id);
        }
      });
    }
  }

  await executeFileDeletions(fileIdsToDelete, setState, getState);
};