// src/shared/store/file-store/actions/save.ts
import { write } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { generateNextFileName, syncCatalogToDatabase } from '../file-utils';
import type { FileReference, StoreSet, StoreGet } from '../types';

export const handleSave = async (files: File[], parentId: string | undefined, set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const newFileReferences: FileReference[] = [];

  for (const file of files) {
    const fileId = crypto.randomUUID();
    const storageKey = `proc-${fileId}`;
    await write(storageKey, await file.arrayBuffer());

    const existingProcessedFiles = get().process.filter((ref) => ref.toolId === activeToolId);

    newFileReferences.push({
      id: fileId,
      toolId: activeToolId,
      name: generateNextFileName(existingProcessedFiles, 'process'),
      storageKey,
      size: file.size,
      type: file.type,
      createdAt: Date.now(),
      parentId,
    });
  }

  set((state) => ({ process: [...state.process, ...newFileReferences] }));
  await syncCatalogToDatabase(get().original, get().process);
};