import React from 'react';
import { useFilePreview } from './useFilePreview';
import type { FileReference } from '@/shared/store/file-store';

interface FilePreviewProperties {
  fileReference: FileReference | null;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProperties> = ({
  fileReference,
  className = '',
}): React.JSX.Element => {
  const { previewUrl, isLoading } = useFilePreview(fileReference);

  const renderPreviewContent = () => {
    if (!fileReference) {
      return (
        <div className={`w-full h-56 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center ${className}`}>
          <span className="text-slate-400 text-sm">No file</span>
        </div>
      );
    }

    const isImageFile = fileReference.type?.startsWith('image/');
    const isPdfFile = fileReference.type === 'application/pdf';

    if (isLoading) {
      return (
        <div className={`w-full h-56 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center ${className}`}>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className={`w-full h-56 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center ${className}`}>
          <span className="text-slate-400 text-sm">Loading...</span>
        </div>
      );
    }

    return (
      <div className={`w-full h-56 bg-slate-200/60 dark:bg-black/50 overflow-hidden flex items-center justify-center p-2 ${className}`}>
        {isImageFile ? (
          <img src={previewUrl} alt={fileReference.name} className="w-full h-full object-contain" />
        ) : isPdfFile ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-950/20 rounded-md">
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

  return renderPreviewContent();
};