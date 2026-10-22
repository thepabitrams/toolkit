import React from 'react';
import { FilePreview } from './FilePreview';
import { FileDetails } from './FileDetails';
import { Container } from '@/core/components/ui/Container';
import { Motion } from '@/core/motion/motion';
import { iconButtonMotion } from '@/core/motion/compositions/iconButtonMotion';
import { MdClose } from 'react-icons/md';
import type { FileReference } from '@/shared/store/file-store';

interface FileCardProperties {
  fileReference: FileReference | null;
  displayVariant?: 'original' | 'process';
  handleFileRemove?: () => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FileCard: React.FC<FileCardProperties> = ({
  fileReference,
  displayVariant = 'process',
  handleFileRemove,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
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
    <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
      <Container className="px-0 h-full">
        <div className="flex flex-col gap-4 w-full h-full">
          <div className="relative w-full">
            <FilePreview
              fileReference={fileReference}
              minWidth={minWidth}
              minHeight={minHeight}
              padding={0}
              className="w-full"
            />
            {isOriginalVariant && handleFileRemove && (
              <Motion
                preset={iconButtonMotion}
                as="button"
                onClick={confirmFileRemoval}
                className={`
                  absolute top-3 right-3 z-20
                  p-1.5 rounded-full
                  bg-white/90 dark:bg-gray-900/90
                  shadow-sm backdrop-blur-sm
                  hover:bg-red-50 dark:hover:bg-red-950/20
                  active:scale-[0.95]
                  active:duration-150
                  active:ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group
                `}
                aria-label="Remove file"
              >
                <MdClose
                  className="
                    w-4 h-4
                    text-gray-600 dark:text-gray-400
                    group-hover:text-red-500 dark:group-hover:text-red-400
                    transition-colors duration-200
                  "
                />
              </Motion>
            )}
          </div>
          <FileDetails
            fileReference={fileReference}
            minWidth={minWidth}
            minHeight={minHeight}
            padding={0}
            className="w-full px-4 pb-4"
          />
        </div>
      </Container>
    </div>
  );
};