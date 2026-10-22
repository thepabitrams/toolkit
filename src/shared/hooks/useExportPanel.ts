// src/shared/hooks/useExportPanel.ts
import { useCallback, useState } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';

interface UseExportPanelOptions {
  fileReference: FileReference | null;
  variant: 'single' | 'multiple';
}

interface UseExportPanelReturn {
  handleDownload: (fileName: string, format?: string) => Promise<void>;
  isDownloadingFile: boolean;
  downloadError: Error | null;
}

export const useExportPanel = ({ fileReference, variant }: UseExportPanelOptions): UseExportPanelReturn => {
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [downloadError, setDownloadError] = useState<Error | null>(null);
  const { read } = useFileStore();

  const handleDownload = useCallback(async (fileName: string, format: string = 'original') => {
    if (!fileReference) {
      throw new Error('No file to download');
    }

    setIsDownloadingFile(true);
    setDownloadError(null);

    try {
      const fileBlob = await read(fileReference.name);
      if (!fileBlob) throw new Error('Failed to read file');

      const fileExtension = fileReference.name.includes('.') ? fileReference.name.split('.').pop() : 'png';
      const completeFileName = fileName ? `${fileName}.${fileExtension}` : fileReference.name;
      
      const objectUrl = URL.createObjectURL(fileBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = completeFileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      
    } catch (caughtError) {
      const processedError = caughtError instanceof Error ? caughtError : new Error('Download failed');
      setDownloadError(processedError);
      throw processedError;
    } finally {
      setIsDownloadingFile(false);
    }
  }, [fileReference, read]);

  return { handleDownload, isDownloadingFile, downloadError };
};