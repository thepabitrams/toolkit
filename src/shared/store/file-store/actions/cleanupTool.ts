// src/shared/store/file-store/actions/cleanupTool.ts
import { executeFileDeletions } from '../cleanupUtils';
import type { StoreSet, StoreGet } from '../types';

export const handleToolCleanup = async (
  activeToolIdentifier: string,
  maximumToolFileLimit: number,
  setState: StoreSet,
  getState: StoreGet
): Promise<void> => {
  const currentStoreState = getState();
  
  const activeToolFileReferences = Object.values(currentStoreState.fileDetailMap).filter(
    (fileReference) => fileReference.toolId === activeToolIdentifier
  );

  if (activeToolFileReferences.length <= maximumToolFileLimit) {
    return;
  }

  const sortedFileReferences = activeToolFileReferences.sort(
    (firstReference, secondReference) => firstReference.createdAt - secondReference.createdAt
  );

  const excessFileCount = sortedFileReferences.length - maximumToolFileLimit;
  const fileIdsToDelete = new Set<string>();

  for (let index = 0; index < excessFileCount; index++) {
    fileIdsToDelete.add(sortedFileReferences[index].id);
  }

  await executeFileDeletions(fileIdsToDelete, setState, getState);
};