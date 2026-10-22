// src/shared/store/file-store/useFileStore.ts
import { create } from 'zustand';
import type { FileStore } from './types';

import { handleInit } from './actions/init';
import { handleUpload } from './actions/upload';
import { handleSave } from './actions/save';
import { handleGet } from './actions/get';
import { handleList } from './actions/list';
import { handleRead } from './actions/read';
import { handleReadRawFile } from './actions/read-raw-file';
import { handleRemove } from './actions/remove';
import { handleClear } from './actions/clear';
import { handlePromote } from './actions/promote';
import { handleFindChildFiles } from './actions/find-child-files';
import { handleCleanupStorage } from './actions/cleanup-storage';

export const useFileStore = create<FileStore>((set, get) => ({
  original: [],
  process: [],

  init: () => handleInit(set, get),
  upload: (files) => handleUpload(files, set, get),
  save: (files, parentId) => handleSave(files, parentId, set, get),
  get: (name) => handleGet(name, get),
  list: (type) => handleList(type, get),
  read: (name) => handleRead(name, get),
  readRawFile: (storageKey) => handleReadRawFile(storageKey),
  remove: (name) => handleRemove(name, set, get),
  clear: () => handleClear(set, get),
  promote: (fileName, targetToolId) => handlePromote(fileName, targetToolId, set, get),
  findChildFiles: (parentId) => handleFindChildFiles(parentId, get),
  cleanupStorage: () => handleCleanupStorage(get),
}));