import { useEffect, useState } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { readDimensions, readDpi } from '@/shared/entities/image/metadata';

interface ConvertedFileMetadata {
  width: string;
  height: string;
  dpi: string;
  unit: string;
}

const EMPTY_METADATA: ConvertedFileMetadata = {
  width: '—',
  height: '—',
  dpi: '—',
  unit: 'px',
};

export const useConvertedFileCard = (
  fileReference: FileReference | null,
  previewFile: File | null
) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<ConvertedFileMetadata>(EMPTY_METADATA);
  const [isLoading, setIsLoading] = useState(false);
  const { getRawFile } = useFileStore();

  useEffect(() => {
    if (!fileReference) {
      setPreviewUrl(null);
      setFileMetadata(EMPTY_METADATA);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    const loadConvertedFile = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const convertedFile = await getRawFile(fileReference.storageKey);
        if (!convertedFile || !isMounted) return;

        const displayFile = previewFile ?? convertedFile;
        objectUrl = URL.createObjectURL(displayFile);
        setPreviewUrl(objectUrl);

        const [dimensionsResult, resolutionResult] = await Promise.allSettled([
          readDimensions(displayFile),
          readDpi(convertedFile),
        ]);
        if (!isMounted) return;

        const dimensions =
          dimensionsResult.status === 'fulfilled' ? dimensionsResult.value : null;
        const resolution =
          resolutionResult.status === 'fulfilled' ? resolutionResult.value : null;

        setFileMetadata({
          width: dimensions?.width?.toString() || '—',
          height: dimensions?.height?.toString() || '—',
          dpi: resolution?.dpi?.toString() || '—',
          unit: dimensions?.unit || 'px',
        });
      } catch (caughtError) {
        console.warn('ConvertedFileCard: Failed to load converted file:', caughtError);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadConvertedFile();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileReference, previewFile, getRawFile]);

  return { previewUrl, fileMetadata, isLoading };
};