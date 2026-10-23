export interface FileReference {
  id: string;
  toolId: string;
  bucket: string;
  name: string;
  storageKey: string;
  size: number;
  type: string;
  createdAt: number;
  parentId?: string;
}

export interface FileStore {
  fileDetailMap: Record<string, FileReference>;
  bucketIndex: Record<string, Record<string, string[]>>;
  activeFileId: string | null;

  upload: (files: File[], bucketName?: string, specificIndex?: number, customName?: string) => Promise<void>;
  save: (files: File[], bucketName?: string, parentId?: string, specificIndex?: number, customName?: string) => Promise<void>;
  selectAll: (bucketName: string) => FileReference[];
  getFile: (bucketName: string, identifier: string | number) => FileReference | undefined;
  getRawFile: (storageKey: string) => Promise<File | null>;
  deleteFile: (bucketName: string, identifier: string | number) => Promise<void>;
  deleteBucket: (bucketName: string) => Promise<void>;
  deleteTool: () => Promise<void>;
  moveToTool: (fileName?: string, targetToolId?: string) => Promise<void>;
  setActiveFile: (id: string | null) => void;
  reorderBucket: (bucketName: string, startIndex: number, endIndex: number) => Promise<void>;
}

export type StoreSet = (partial: FileStore | Partial<FileStore> | ((state: FileStore) => FileStore | Partial<FileStore>)) => void;
export type StoreGet = () => FileStore;