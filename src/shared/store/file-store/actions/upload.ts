// src/shared/store/file-store/actions/upload.ts
import { write } from '@/core/services/opfs';
import { getActiveToolIdentifier } from '../tool-context';
import { generateNextFileName, syncCatalogToDatabase } from '../file-utils';
import type { FileReference, StoreSet, StoreGet } from '../types';

export const handleUpload = async (files: File[], set: StoreSet, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const newFileReferences: FileReference[] = [];

  for (const file of files) {
    const fileId = crypto.randomUUID();
    const storageKey = `orig-${fileId}`;
    await write(storageKey, await file.arrayBuffer());

    const existingOriginals = get().original.filter((ref) => ref.toolId === activeToolId);

    newFileReferences.push({
      id: fileId,
      toolId: activeToolId,
      name: generateNextFileName(existingOriginals, 'original'),
      storageKey,
      size: file.size,
      type: file.type,
      createdAt: Date.now(),
    });
  }

  set((state) => ({ original: [...state.original, ...newFileReferences] }));
  await syncCatalogToDatabase(get().original, get().process);
};