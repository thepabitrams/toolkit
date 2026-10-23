import { handleInsert } from './insert';
import type { StoreSet, StoreGet } from '../types';

export const handleUpload = async (files: File[], bucketName: string, specificIndex: number | undefined, set: StoreSet, get: StoreGet) => {
  await handleInsert(files, bucketName, specificIndex, undefined, set, get);
};