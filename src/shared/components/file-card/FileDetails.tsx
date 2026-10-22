import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { useFileDetails } from './useFileDetails';
import type { FileReference } from '@/shared/store/file-store';

interface FileDetailsProperties {
  fileReference: FileReference | null;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
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
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const { imageMetadata, isLoading } = useFileDetails(fileReference);

  const renderMetadataContent = () => {
    if (!fileReference) {
      return (
        <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
          <Container className="px-0 h-full">
            <div className={`w-full px-3 pb-3 ${className}`}>
              <p className="text-xs text-gray-400 dark:text-gray-500">No file uploaded</p>
            </div>
          </Container>
        </div>
      );
    }

    const formattedSize = formatFileSize(fileReference.size);
    const formatLabel = fileReference.type?.split('/')[1]?.toUpperCase() || 'FILE';

    return (
      <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
        <Container className="px-0 h-full">
          <div className={`w-full px-3 pb-3 ${className}`}>
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
              {fileReference.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
              <span>{formattedSize}</span>
              <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
              {isLoading ? (
                <span>Reading metadata...</span>
              ) : (
                <>
                  <span>{imageMetadata.width} × {imageMetadata.height} {imageMetadata.unit}</span>
                  <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                  <span>{imageMetadata.dpi} DPI</span>
                </>
              )}
              <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
              <span>{formatLabel}</span>
            </div>
          </div>
        </Container>
      </div>
    );
  };

  return (
    <Card className="p-3 flex-1">
      {renderMetadataContent()}
    </Card>
  );
};