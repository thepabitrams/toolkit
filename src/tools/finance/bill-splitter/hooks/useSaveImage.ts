// src/tools/finance/split/hooks/useSaveImage.ts
import { useCallback } from 'react';
import { snapdom } from '@zumer/snapdom';

interface UseSaveImageProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useSaveImage({ onSuccess, onError }: UseSaveImageProps) {
  const downloadReceiptImage = useCallback(async (receiptElementRef: React.RefObject<HTMLDivElement | null>) => {
    if (!receiptElementRef.current) {
      onError('Receipt element not found');
      return;
    }

    try {
      await snapdom.download(receiptElementRef.current, {
        format: 'png',
        filename: `toolkit-split-${Date.now()}.png`,
        scale: 2,
        backgroundColor: '#ffffff',
      });

      onSuccess('Image saved');
    } catch (error) {
      console.error('Save image failed:', error);
      onError('Failed to save image');
    }
  }, [onSuccess, onError]);

  return { downloadReceiptImage };
}