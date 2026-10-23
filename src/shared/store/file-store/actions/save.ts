import { handleInsert } from './insert';
import type { StoreSet, StoreGet } from '../types';

export const handleSave = async (files: File[], bucketName: string, parentId: string | undefined, specificIndex: number | undefined, customName: string | undefined, set: StoreSet, get: StoreGet) => {
  await handleInsert(files, bucketName, specificIndex, parentId, customName, set, get);
};