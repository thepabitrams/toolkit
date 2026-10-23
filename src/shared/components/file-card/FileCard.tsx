import React from 'react';
import { FilePreview } from './FilePreview';
import { FileDetails } from './FileDetails';
import { Card } from '@/core/components/ui/Card';
import { Motion } from '@/core/motion/motion';
import { iconButtonMotion } from '@/core/motion/compositions/iconButtonMotion';
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
    <Card className={`flex flex-col w-full h-full overflow-hidden p-0 border-slate-200/80 dark:border-gray-800 rounded-3xl shadow-sm bg-white dark:bg-gray-900 ${className}`}>
      <div className="relative w-full border-b border-slate-100 dark:border-gray-800">
        <FilePreview fileReference={fileReference} />
        
        {isOriginalVariant && handleFileRemove && (
          <Motion
            preset={iconButtonMotion}
            as="button"
            onClick={confirmFileRemoval}
            className="
              absolute top-3 right-3 z-20
              p-1.5 rounded-full
              bg-white/90 dark:bg-gray-900/90
              shadow-sm backdrop-blur-sm
              hover:bg-red-50 dark:hover:bg-red-950/20
              active:scale-[0.95] active:duration-150
              group
            "
            aria-label="Remove file"
          >
            <MdClose className="w-4 h-4 text-slate-600 dark:text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
          </Motion>
        )}
      </div>
      
      <FileDetails fileReference={fileReference} />
    </Card>
  );
};