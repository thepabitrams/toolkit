import { create } from 'zustand';
import type { FileStore } from './types';
import { handleUpload } from './actions/upload';
import { handleSave } from './actions/save';
import { handleSelectAll } from './actions/selectAll';
import { handleGetFile } from './actions/getFile';
import { handleGetRawFile } from './actions/getRawFile';
import { handleDeleteFile } from './actions/deleteFile';
import { handleDeleteBucket } from './actions/deleteBucket';
import { handleDeleteTool } from './actions/deleteTool';
import { handleMoveToTool } from './actions/moveToTool';

export const useFileStore = create<FileStore>((set, get) => ({
  fileDetailMap: {},
  bucketIndex: {},
  activeFileId: null,

  upload: (files, bucketName = 'original', specificIndex) => handleUpload(files, bucketName, specificIndex, set, get),
  save: (files, bucketName = 'process', parentId, specificIndex) => handleSave(files, bucketName, parentId, specificIndex, set, get),
  selectAll: (bucketName) => handleSelectAll(bucketName, get),
  getFile: (bucketName, identifier) => handleGetFile(bucketName, identifier, get),
  getRawFile: (storageKey) => handleGetRawFile(storageKey),
  deleteFile: (bucketName, identifier) => handleDeleteFile(bucketName, identifier, set, get),
  deleteBucket: (bucketName) => handleDeleteBucket(bucketName, set, get),
  deleteTool: () => handleDeleteTool(set, get),
  moveToTool: (fileName, targetToolId) => handleMoveToTool(fileName, targetToolId, set, get),
  setActiveFile: (id) => set({ activeFileId: id }),
}));