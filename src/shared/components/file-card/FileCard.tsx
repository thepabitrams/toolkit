// src/shared/components/file-card/FileCard.tsx
import React from 'react';
import { FilePreview } from './FilePreview';
import { FileDetails } from './FileDetails';
import type { FileReference } from '@/shared/store/file-store';

interface FileCardProperties {
  fileReference: FileReference | null;
  className?: string;
}

export const FileCard: React.FC<FileCardProperties> = ({
  fileReference,
  className = '',
}): React.JSX.Element | null => {
  if (!fileReference) return null;

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden ${className}`}>
      <div className="relative w-full h-96 flex items-center justify-center bg-slate-100 dark:bg-black/20">
        <FilePreview fileReference={fileReference} />
      </div>
      
      <div className="w-full shrink-0 bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800">
        <FileDetails fileReference={fileReference} />
      </div>
    </div>
  );
};