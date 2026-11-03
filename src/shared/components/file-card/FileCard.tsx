// src/shared/components/file-card/FileCard.tsx
import React from 'react';
import { FilePreview } from './FilePreview';
import { FileDetails } from './FileDetails';
import { MdClose } from 'react-icons/md';
import type { FileReference } from '@/shared/store/file-store';

interface FileCardProperties {
  fileReference: FileReference | null;
  displayVariant?: 'original' | 'process';
  handleFileRemove?: () => void;
  className?: string;
}

export const FileCard: React.FC<FileCardProperties> = ({
  fileReference,
  displayVariant = 'process',
  handleFileRemove,
  className = '',
}): React.JSX.Element | null => {
  if (!fileReference) return null;

  const isOriginalVariant = displayVariant === 'original';

  const confirmFileRemoval = () => {
    if (handleFileRemove) {
      const userConfirmed = window.confirm('Are you sure you want to remove this file?');
      if (userConfirmed) {
        handleFileRemove();
      }
    }
  };

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden ${className}`}>
      {/* 🛠️ FIX: Added h-96 (384px) so the image doesn't grow infinitely, but still allows the card to stretch */}
      <div className="relative w-full h-96 flex items-center justify-center bg-slate-100 dark:bg-black/20">
        <FilePreview fileReference={fileReference} />
        
        {isOriginalVariant && handleFileRemove && (
          <button
            onClick={confirmFileRemoval}
            className="
              absolute top-3 right-3 z-20
              p-1.5 rounded-full
              bg-white/90 dark:bg-gray-900/90
              shadow-sm backdrop-blur-sm
              hover:bg-black/5 dark:hover:bg-white/10
              group transition-colors
            "
            aria-label="Remove file"
          >
            <MdClose className="w-4 h-4 text-slate-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200" />
          </button>
        )}
      </div>
      
      <div className="w-full shrink-0 bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800">
        <FileDetails fileReference={fileReference} />
      </div>
    </div>
  );
};