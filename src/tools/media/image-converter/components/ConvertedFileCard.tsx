import React from 'react';
import type { FileReference } from '@/shared/store/file-store';
import { useConvertedFileCard } from './useConvertedFileCard';

interface ConvertedFileCardProperties {
  fileReference: FileReference | null;
  previewFile: File | null;
  formatLabel: string;
  className?: string;
}

const BYTES_PER_KILOBYTE = 1024;

const formatFileSize = (bytes: number): string => {
  if (bytes < BYTES_PER_KILOBYTE) return `${bytes} B`;
  if (bytes < BYTES_PER_KILOBYTE ** 2) return `${(bytes / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
  if (bytes < BYTES_PER_KILOBYTE ** 3) {
    return `${(bytes / BYTES_PER_KILOBYTE ** 2).toFixed(1)} MB`;
  }
  return `${(bytes / BYTES_PER_KILOBYTE ** 3).toFixed(1)} GB`;
};

export const ConvertedFileCard: React.FC<ConvertedFileCardProperties> = ({
  fileReference,
  previewFile,
  formatLabel,
  className = '',
}): React.JSX.Element | null => {
  const { previewUrl, fileMetadata, isLoading } = useConvertedFileCard(
    fileReference,
    previewFile
  );

  if (!fileReference) return null;

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden ${className}`}>
      <div className="relative w-full h-96 flex items-center justify-center bg-slate-100 dark:bg-black/20">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fileReference.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="w-full shrink-0 bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800">
        <div className="w-full px-4 py-4 flex flex-col items-center justify-center text-center gap-1.5">
          <p className="text-base font-semibold text-slate-900 dark:text-white truncate max-w-full">
            {fileReference.name}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px] text-slate-500 dark:text-gray-400">
            <span>{formatFileSize(fileReference.size)}</span>
            <span className="w-px h-3 bg-slate-300 dark:bg-gray-600" />
            {isLoading ? (
              <span>Reading metadata...</span>
            ) : (
              <>
                <span>
                  {fileMetadata.width} × {fileMetadata.height} {fileMetadata.unit}
                </span>
                <span className="w-px h-3 bg-slate-300 dark:bg-gray-600" />
                <span>{fileMetadata.dpi} DPI</span>
              </>
            )}
            <span className="w-px h-3 bg-slate-300 dark:bg-gray-600" />
            <span>{formatLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};