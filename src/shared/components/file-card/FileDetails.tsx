import React from 'react';
import { useFileDetails } from './useFileDetails';
import type { FileReference } from '@/shared/store/file-store';

interface FileDetailsProperties {
  fileReference: FileReference | null;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export const FileDetails: React.FC<FileDetailsProperties> = ({
  fileReference,
  className = '',
}): React.JSX.Element => {
  const { imageMetadata, isLoading } = useFileDetails(fileReference);

  if (!fileReference) {
    return (
      <div className={`w-full p-3 ${className}`}>
        <p className="text-xs text-slate-400 dark:text-gray-500">No file uploaded</p>
      </div>
    );
  }

  const formattedSize = formatFileSize(fileReference.size);
  const formatLabel = fileReference.type?.split('/')[1]?.toUpperCase() || 'FILE';

  return (
    <div className={`w-full px-4 py-3 flex flex-col gap-1 ${className}`}>
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
        {fileReference.name}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-gray-400">
        <span>{formattedSize}</span>
        <span className="w-px h-3 bg-slate-300 dark:bg-gray-600" />
        {isLoading ? (
          <span>Reading metadata...</span>
        ) : (
          <>
            <span>{imageMetadata.width} × {imageMetadata.height} {imageMetadata.unit}</span>
            <span className="w-px h-3 bg-slate-300 dark:bg-gray-600" />
            <span>{imageMetadata.dpi} DPI</span>
          </>
        )}
        <span className="w-px h-3 bg-slate-300 dark:bg-gray-600" />
        <span>{formatLabel}</span>
      </div>
    </div>
  );
};