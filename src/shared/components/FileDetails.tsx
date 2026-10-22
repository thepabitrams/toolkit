// src/shared/components/FileDetails.tsx
import React, { useState, useEffect } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { readDimensions, readDpi } from '@/shared/entities/image/metadata';
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
  const [imageMetadataState, setImageMetadataState] = useState({
    width: '—',
    height: '—',
    dpi: '—',
    unit: 'px',
  });
  const [isLoadingMetadataState, setIsLoadingMetadataState] = useState(false);
  const { readRawFile } = useFileStore();

  useEffect(() => {
    if (!fileReference) {
      setImageMetadataState({ width: '—', height: '—', dpi: '—', unit: 'px' });
      setIsLoadingMetadataState(false);
      return;
    }

    let isComponentMounted = true;

    const loadImageMetadata = async () => {
      setIsLoadingMetadataState(true);
      try {
        const resolvedFileObject = await readRawFile(fileReference.storageKey);
        if (!resolvedFileObject || !isComponentMounted) {
          setIsLoadingMetadataState(false);
          return;
        }

        const [imageDimensions, imageResolution] = await Promise.all([
          readDimensions(resolvedFileObject),
          readDpi(resolvedFileObject),
        ]);

        if (isComponentMounted) {
          setImageMetadataState({
            width: imageDimensions.width?.toString() || '—',
            height: imageDimensions.height?.toString() || '—',
            dpi: imageResolution.dpi?.toString() || '—',
            unit: imageDimensions.unit || 'px',
          });
        }
      } catch (error) {
        console.warn('FileDetails: Error reading metadata:', error);
      } finally {
        if (isComponentMounted) setIsLoadingMetadataState(false);
      }
    };

    loadImageMetadata();

    return () => {
      isComponentMounted = false;
    };
  }, [fileReference, readRawFile]);

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
              {isLoadingMetadataState ? (
                <span>Reading metadata...</span>
              ) : (
                <>
                  <span>{imageMetadataState.width} × {imageMetadataState.height} {imageMetadataState.unit}</span>
                  <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                  <span>{imageMetadataState.dpi} DPI</span>
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