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
  const { getRawFile } = useFileStore();

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
        const file = await getRawFile(fileReference.storageKey);
        if (!file || !isMounted) {
          setIsLoading(false);
          return;
        }

        const [dimensions, resolution] = await Promise.all([
          readDimensions(file),
          readDpi(file),
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
  }, [fileReference, getRawFile]);

  return { imageMetadata, isLoading };
};