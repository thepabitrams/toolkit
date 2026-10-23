import { readFile as readRawFileFromOPFS } from '@/core/services/opfs';

export const handleGetRawFile = async (storageKey: string) => {
  try {
    return await readRawFileFromOPFS(storageKey);
  } catch (error) {
    console.warn('Failed to read file from OPFS:', error);
    return null;
  }
};