import { useState, useEffect } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { readDimensions, readDpi } from '@/shared/entities/image/metadata';
import type { FileReference } from '@/shared/store/file-store';

export const useFileDetails = (fileReference: FileReference | null) => {
  const [imageMetadata, setImageMetadata] = useState({
    width: '—',
    height: '—',
    dpi: '—',
    unit: 'px',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { readRawFile } = useFileStore();

  useEffect(() => {
    if (!fileReference) {
      setImageMetadata({ width: '—', height: '—', dpi: '—', unit: 'px' });
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadMetadata = async () => {
      setIsLoading(true);
      try {
        const fileObject = await readRawFile(fileReference.storageKey);
        if (!fileObject || !isMounted) {
          setIsLoading(false);
          return;
        }

        const [dimensions, resolution] = await Promise.all([
          readDimensions(fileObject),
          readDpi(fileObject),
        ]);

        if (isMounted) {
          setImageMetadata({
            width: dimensions.width?.toString() || '—',
            height: dimensions.height?.toString() || '—',
            dpi: resolution.dpi?.toString() || '—',
            unit: dimensions.unit || 'px',
          });
        }
      } catch (error) {
        console.warn('FileDetails: Error reading metadata:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, [fileReference, readRawFile]);

  return { imageMetadata, isLoading };
};