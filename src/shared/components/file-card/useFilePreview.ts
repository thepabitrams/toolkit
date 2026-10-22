import { useState, useEffect } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';

export const useFilePreview = (fileReference: FileReference | null) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { read } = useFileStore();

  useEffect(() => {
    if (!fileReference) {
      setPreviewUrl(null);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    const generatePreview = async () => {
      setIsLoading(true);
      try {
        const fileBlob = await read(fileReference.name);
        if (fileBlob && isMounted) {
          objectUrl = URL.createObjectURL(fileBlob);
          setPreviewUrl(objectUrl);
        }
      } catch (error) {
        console.error('FilePreview: Failed to fetch file:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    generatePreview();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileReference, read]);

  return { previewUrl, isLoading };
};