// src/tools/media/adjust-size/useAdjustSize.ts
import { useState, useCallback } from 'react';
import {
  readDimensions,
  readDpi,
  writeDpi,
  detectFormatAndAlpha,
} from '@/shared/entities/image';
import { binarySearchCompress, padding } from './strategies';
import { compressProgressive } from './compression';

export interface ProcessProgress {
  type?: string;
  strategy?: string;
  quality?: number;
  sizeKB?: number;
  iteration?: number;
  value?: number;
  names?: string;
  values?: number[];
  done?: boolean;
}

export interface ProcessResult {
  processedBlob: Blob;
  sizeKB: number;
  minSizeKB: number;
  maxSizeKB: number;
  isWithinRange: boolean;
  smallestPossibleKB: number;
  error?: string;
  outputMimeType: string;
}

export function useAdjustSize() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(
    async (
      sourceFile: File,
      minSizeKB: number,
      maxSizeKB: number,
      onProgress?: (data: ProcessProgress) => void
    ): Promise<ProcessResult> => {
      setIsProcessing(true);
      try {
        const [, dpiResult] = await Promise.all([
          readDimensions(sourceFile),
          readDpi(sourceFile),
        ]);
        const dpi = dpiResult.dpi || 300;

        const sourceSizeKB = sourceFile.size / 1024;
        const targetMidpointKB = (minSizeKB + maxSizeKB) / 2;

        const { format: sourceMimeType, hasAlpha } = await detectFormatAndAlpha(sourceFile);
        const isLossyFormat = ['image/jpeg', 'image/webp', 'image/avif'].includes(sourceMimeType);

        let processedBlob: Blob = sourceFile;
        let outputMimeType = sourceMimeType;

        if (sourceSizeKB < minSizeKB) {
          processedBlob = await padding(sourceFile, targetMidpointKB);
          outputMimeType = sourceFile.type || sourceMimeType;
        } else if (sourceSizeKB > maxSizeKB) {
          let compressedBlob: Blob = sourceFile;

          if (isLossyFormat) {
            compressedBlob = await binarySearchCompress(
              sourceFile,
              maxSizeKB,
              sourceMimeType,
              (data) => {
                onProgress?.({ ...data, type: 'compress', strategy: 'binarySearch' });
              }
            );
          }

          if (compressedBlob.size / 1024 > maxSizeKB) {
            compressedBlob = await compressProgressive(
              compressedBlob,
              maxSizeKB,
              sourceMimeType,
              hasAlpha,
              isLossyFormat,
              onProgress
            );
          }

          if (compressedBlob.size / 1024 < minSizeKB) {
            const temporaryFile = new File([compressedBlob], 'temp-compressed', { 
              type: compressedBlob.type 
            });
            compressedBlob = await padding(temporaryFile, targetMidpointKB);
          }

          processedBlob = compressedBlob;
          outputMimeType = compressedBlob.type || sourceMimeType;
        }

        const fileExtension = outputMimeType.split('/')[1] || 'png';
        const metadataFile = new File([processedBlob], `output.${fileExtension}`, { 
          type: outputMimeType 
        });
        const finalBlob = await writeDpi(metadataFile, dpi);

        const finalSizeKB = finalBlob.size / 1024;

        return {
          processedBlob: finalBlob,
          sizeKB: finalSizeKB,
          minSizeKB,
          maxSizeKB,
          isWithinRange: finalSizeKB >= minSizeKB && finalSizeKB <= maxSizeKB,
          smallestPossibleKB: finalSizeKB,
          error:
            finalSizeKB > maxSizeKB
              ? `Cannot compress below ${maxSizeKB}KB. Smallest: ${finalSizeKB.toFixed(1)}KB.`
              : undefined,
          outputMimeType,
        };
      } catch (error) {
        return {
          processedBlob: sourceFile,
          sizeKB: sourceFile.size / 1024,
          minSizeKB,
          maxSizeKB,
          isWithinRange: false,
          smallestPossibleKB: sourceFile.size / 1024,
          error: error instanceof Error ? error.message : String(error),
          outputMimeType: sourceFile.type || 'image/png',
        };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { processImage, isProcessing };
}