// src/shared/components/FilePreview.tsx
import React, { useState, useEffect } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { Card } from '@/core/components/ui/Card';
import type { FileReference } from '@/shared/store/file-store';
import { Container } from '@/core/components/ui/Container';

interface FilePreviewProperties {
  fileReference: FileReference | null;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FilePreview: React.FC<FilePreviewProperties> = ({ 
  fileReference, 
  className = '', 
  minWidth = 260, 
  minHeight = 200, 
  padding = 0 
}) => {
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { read } = useFileStore();

  useEffect(() => {
    if (!fileReference) {
      setPreviewObjectUrl(null);
      return;
    }

    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const generatePreviewUrl = async () => {
      setIsPreviewLoading(true);
      try {
        const fileBlob = await read(fileReference.name);
        if (fileBlob && isComponentMounted) {
          objectUrlInstance = URL.createObjectURL(fileBlob);
          setPreviewObjectUrl(objectUrlInstance);
        }
      } catch (error) {
        console.error('FilePreview: Failed to fetch file:', error);
      } finally {
        if (isComponentMounted) setIsPreviewLoading(false);
      }
    };

    generatePreviewUrl();

    return () => {
      isComponentMounted = false;
      if (objectUrlInstance) {
        URL.revokeObjectURL(objectUrlInstance);
      }
    };
  }, [fileReference, read]);

  const renderPreviewContent = () => {
    if (!fileReference) {
      return (
        <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
          <span className="text-gray-400 dark:text-gray-500 text-sm">No file</span>
        </div>
      );
    }

    const isImageFile = fileReference.type?.startsWith('image/');
    const isPdfFile = fileReference.type === 'application/pdf';

    if (isPreviewLoading) {
      return (
        <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!previewObjectUrl) {
      return (
        <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
          <span className="text-gray-400 dark:text-gray-500 text-sm">Loading...</span>
        </div>
      );
    }

    return (
      <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-lg ${className}`}>
        {isImageFile ? (
          <img src={previewObjectUrl} alt={fileReference.name} className="w-full h-full object-contain" />
        ) : isPdfFile ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
            </svg>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden p-0 flex-1">
      <div 
        style={{ minWidth: `${minWidth}px`, minHeight: `${minHeight}px`, padding: `${padding}px` }}
        className={`flex-1 ${className}`}
      >
        <Container className="px-0 h-full">
          {renderPreviewContent()}
        </Container>
      </div>
    </Card>
  );
};