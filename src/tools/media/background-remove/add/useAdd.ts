// src/tools/media/background-remove/add/useAdd.ts
import { useState, useCallback } from 'react';
import { writeDpi } from '@/shared/entities/image';
import { loadImage, createCanvas, exportCanvas } from '@/shared/lib/browser';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export function useAdd() {
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');

  const applyBackground = useCallback(
    async (cutoutBlob: Blob, format: OutputFormat): Promise<Blob> => {
      if (backgroundColor === null && format === 'png') {
        return new Blob([cutoutBlob], { type: 'image/png' });
      }

      const sourceImage = await loadImage(cutoutBlob);
      const imageWidth = sourceImage.width;
      const imageHeight = sourceImage.height;

      const processingCanvas = createCanvas(imageWidth, imageHeight);
      const rawContext = processingCanvas.getContext('2d');
      if (!rawContext) throw new Error('Failed to acquire 2D context');
      const canvasContext: CanvasRenderingContext2D = rawContext;

      canvasContext.fillStyle = backgroundColor || '#ffffff';
      canvasContext.fillRect(0, 0, imageWidth, imageHeight);
      canvasContext.drawImage(sourceImage, 0, 0, imageWidth, imageHeight);

      let outputMimeType = 'image/png';
      let exportQuality: number | undefined = undefined;
      
      if (format === 'jpeg') {
        outputMimeType = 'image/jpeg';
        exportQuality = 0.95;
      } else if (format === 'webp') {
        outputMimeType = 'image/webp';
        exportQuality = 0.95;
      }

      return await exportCanvas(processingCanvas, outputMimeType, exportQuality);
    },
    [backgroundColor]
  );

  const applyBackgroundWithMetadata = useCallback(
    async (cutoutBlob: Blob, dpiValue: number | undefined, format: OutputFormat): Promise<Blob> => {
      let finalBlob = await applyBackground(cutoutBlob, format);

      if (dpiValue) {
        const fileExtension = format === 'jpeg' ? 'jpg' : format;
        const temporaryFile = new File([finalBlob], `final.${fileExtension}`, {
          type: finalBlob.type || 'image/png',
        });
        finalBlob = await writeDpi(temporaryFile, dpiValue);
      }

      return finalBlob;
    },
    [applyBackground]
  );

  return {
    backgroundColor,
    setBackgroundColor,
    outputFormat,
    setOutputFormat,
    applyBackground,
    applyBackgroundWithMetadata,
  };
}