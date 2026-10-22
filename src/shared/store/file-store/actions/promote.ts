// src/shared/store/file-store/actions/promote.ts
import { getActiveToolIdentifier } from '../tool-context';
import { syncCatalogToDatabase } from '../file-utils';
import type { StoreSet, StoreGet } from '../types';

export const handlePromote = async (fileName: string | undefined, targetToolId: string | undefined, set: StoreSet, get: StoreGet) => {
  const sourceToolId = getActiveToolIdentifier();
  const destinationToolId = targetToolId || sourceToolId;

  const { process: processedFiles, original: originalFiles } = get();

  const myProcessedFiles = processedFiles.filter((ref) => ref.toolId === sourceToolId);
  if (myProcessedFiles.length === 0) return;

  const filesToPromote = fileName
    ? myProcessedFiles.filter((ref) => ref.name === fileName)
    : myProcessedFiles;

  if (fileName && filesToPromote.length === 0) {
    console.warn(`No file found with name: ${fileName}`);
    return;
  }

  const targetOriginals = originalFiles.filter((ref) => ref.toolId === destinationToolId);
  let nextIndex = targetOriginals.length > 0
    ? Math.max(...targetOriginals.map((ref) => parseInt(ref.name.replace('original', ''), 10)))
    : 0;

  const newOriginals = filesToPromote.map((ref) => ({
    ...ref,
    id: crypto.randomUUID(),
    toolId: destinationToolId,
    name: `original${++nextIndex}`,
    parentId: undefined,
    createdAt: Date.now(),
  }));

  const movedIds = new Set(filesToPromote.map((ref) => ref.id));
  set((state) => ({
    original: [...state.original, ...newOriginals],
    process: state.process.filter((ref) => !movedIds.has(ref.id)),
  }));
  
  await syncCatalogToDatabase(get().original, get().process);
};