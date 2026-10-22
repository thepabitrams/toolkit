// src/shared/store/file-store/actions/find-child-files.ts
import type { FileReference, StoreGet } from '../types';

export const handleFindChildFiles = (parentId: string, get: StoreGet) => {
  const childFiles: FileReference[] = [];
  const processedFiles = get().process;
  const queue = [parentId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = processedFiles.filter((file) => file.parentId === currentId);
    
    for (const child of children) {
      childFiles.push(child);
      queue.push(child.id);
    }
  }
  
  return childFiles;
};