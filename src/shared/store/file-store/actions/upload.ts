// src/shared/store/file-store/actions/upload.ts
import { handleInsert } from './insert';
import type { StoreSet, StoreGet } from '../types';

export const handleUpload = async (
  files: File[], 
  bucketName: string, 
  maximumToolFileLimit: number,
  specificIndex: number | undefined, 
  customName: string | undefined, 
  set: StoreSet, 
  get: StoreGet
) => {
  await handleInsert(files, bucketName, maximumToolFileLimit, specificIndex, undefined, customName, set, get);
};