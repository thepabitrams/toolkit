// src/shared/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { useFileStore } from '@/shared/store/file-store';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const { upload } = useFileStore();

  const uploadSingleFile = useCallback(
    async (fileCollection: File[]) => {
      if (!fileCollection.length) return;
      setIsUploading(true);
      setUploadErrorMessage(null);

      try {
        await upload(fileCollection);
      } catch (error) {
        setUploadErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [upload]
  );

  return {
    isUploading,
    uploadErrorMessage,
    uploadSingleFile,
  };
}