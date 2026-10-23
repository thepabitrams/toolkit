import { create } from 'zustand';
import type { FileStore } from './types';
import { handleInit } from './actions/init';
import { handleUpload } from './actions/upload';
import { handleSave } from './actions/save';
import { handleSelectAll } from './actions/selectAll';
import { handleGetFile } from './actions/getFile';
import { handleGetRawFile } from './actions/getRawFile';
import { handleDeleteFile } from './actions/deleteFile';
import { handleDeleteBucket } from './actions/deleteBucket';
import { handleDeleteTool } from './actions/deleteTool';
import { handleMoveToTool } from './actions/moveToTool';
import { handleReorderBucket } from './actions/reorderBucket';

export const useFileStore = create<FileStore>((set, get) => ({
  fileDetailMap: {},
  bucketIndex: {},
  activeFileId: null,

  init: () => handleInit(set, get),
  upload: (files, bucketName = 'original', specificIndex, customName) => handleUpload(files, bucketName, specificIndex, customName, set, get),
  save: (files, bucketName = 'process', parentId, specificIndex, customName) => handleSave(files, bucketName, parentId, specificIndex, customName, set, get),
  selectAll: (bucketName) => handleSelectAll(bucketName, get),
  getFile: (bucketName, identifier) => handleGetFile(bucketName, identifier, get),
  getRawFile: (storageKey) => handleGetRawFile(storageKey),
  deleteFile: (bucketName, identifier) => handleDeleteFile(bucketName, identifier, set, get),
  deleteBucket: (bucketName) => handleDeleteBucket(bucketName, set, get),
  deleteTool: () => handleDeleteTool(set, get),
  moveToTool: (fileName, targetToolId) => handleMoveToTool(fileName, targetToolId, set, get),
  setActiveFile: (id) => set({ activeFileId: id }),
  reorderBucket: (bucketName, startIndex, endIndex) => handleReorderBucket(bucketName, startIndex, endIndex, set, get),
}));