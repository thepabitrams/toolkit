// src/shared/components/FileUpload.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileCard } from './FileCard';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import type { FileReference } from '@/shared/store/file-store';

interface FileUploadProperties {
  fileReference: FileReference | null;
  uploadVariant: 'single' | 'multiple';
  acceptedMimeTypes: Record<string, string[]>;
  uploadLabel: string;
  fileExtensions?: string;
  isUploading?: boolean;
  handleFileUpload: (selectedFiles: File[]) => void;
  handleFileRemove: () => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FileUpload: React.FC<FileUploadProperties> = ({
  fileReference,
  uploadVariant,
  acceptedMimeTypes,
  uploadLabel,
  fileExtensions = '',
  isUploading = false,
  handleFileUpload,
  handleFileRemove,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const onDropFiles = useCallback(
    (droppedFiles: File[]) => {
      handleFileUpload(droppedFiles);
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropFiles,
    accept: acceptedMimeTypes,
    maxFiles: uploadVariant === 'single' ? 1 : undefined,
    disabled: (uploadVariant === 'single' && !!fileReference) || isUploading,
  });

  if (uploadVariant === 'single' && fileReference) {
    return (
      <FileCard 
        fileReference={fileReference} 
        displayVariant="original" 
        handleFileRemove={handleFileRemove} 
        className={className} 
      />
    );
  }

  return (
    <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
      <Container className="px-0 h-full">
        <Card className="p-1 h-full" hover={false}>
          <div
            {...getRootProps()}
            className={`
              w-full h-full cursor-pointer rounded-xl border-2 border-dashed p-6
              bg-white dark:bg-gray-800/50
              transition-all duration-200 flex items-center justify-center
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 scale-[1.01] shadow-lg shadow-blue-500/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
              }
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg 
                className={`w-10 h-10 transition-colors duration-200 ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-center">
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {isDragActive ? 'Drop it' : `Upload ${uploadLabel}`}
                </p>
                {fileExtensions && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{fileExtensions}</p>
                )}
              </div>
              {isUploading && <p className="text-xs text-blue-500 animate-pulse">Processing...</p>}
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};