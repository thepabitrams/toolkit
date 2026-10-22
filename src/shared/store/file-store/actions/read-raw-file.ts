// src/shared/store/file-store/actions/read-raw-file.ts
import { readFile as readRawFileFromOPFS } from '@/core/services/opfs';

export const handleReadRawFile = async (storageKey: string) => {
  try {
    return await readRawFileFromOPFS(storageKey);
  } catch (error) {
    console.warn('Failed to read file from OPFS:', error);
    return null;
  }
};