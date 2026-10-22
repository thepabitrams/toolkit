// src/shared/store/file-store/types.ts
export interface FileReference {
  id: string;
  toolId: string;
  name: string;
  storageKey: string;
  size: number;
  type: string;
  createdAt: number;
  parentId?: string;
}

export interface FileStore {
  original: FileReference[];
  process: FileReference[];

  init: () => Promise<void>;
  upload: (files: File[]) => Promise<void>;
  save: (files: File[], parentId?: string) => Promise<void>;
  get: (name: string) => FileReference | undefined;
  list: (type: 'original' | 'process') => FileReference[];
  read: (name: string) => Promise<Blob | null>;
  readRawFile: (storageKey: string) => Promise<File | null>;
  remove: (name: string) => Promise<void>;
  clear: () => Promise<void>;
  promote: (fileName?: string, targetToolId?: string) => Promise<void>;
  findChildFiles: (parentId: string) => FileReference[];
  cleanupStorage: () => Promise<void>;
}

export type StoreSet = (partial: FileStore | Partial<FileStore> | ((state: FileStore) => FileStore | Partial<FileStore>)) => void;
export type StoreGet = () => FileStore;