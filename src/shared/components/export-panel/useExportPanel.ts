import { useCallback, useState } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';

interface UseExportPanelOptions {
  fileReference: FileReference | null;
  variant: 'single' | 'multiple';
}

interface UseExportPanelReturn {
  handleDownload: (fileName: string) => Promise<void>;
  isDownloadingFile: boolean;
  downloadError: Error | null;
}

export const useExportPanel = ({ fileReference }: UseExportPanelOptions): UseExportPanelReturn => {
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [downloadError, setDownloadError] = useState<Error | null>(null);
  const { getRawFile } = useFileStore();

  const handleDownload = useCallback(async (fileName: string) => {
    if (!fileReference) {
      throw new Error('No file to download');
    }

    setIsDownloadingFile(true);
    setDownloadError(null);

    try {
      const file = await getRawFile(fileReference.storageKey);
      if (!file) throw new Error('Failed to read file');

      const fileExtension = fileReference.name.includes('.') 
        ? fileReference.name.split('.').pop() 
        : 'png';
        
      const completeFileName = fileName ? `${fileName}.${fileExtension}` : fileReference.name;
      
      const objectUrl = URL.createObjectURL(file);
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
  }, [fileReference, getRawFile]);

  return { handleDownload, isDownloadingFile, downloadError };
};