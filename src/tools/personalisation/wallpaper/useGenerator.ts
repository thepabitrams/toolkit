// src/tools/personalisation/wallpaper/useGenerator.ts
import { exportCanvas } from '@/shared/lib/browser';
import { writeDpi } from '@/shared/entities/image';

export function useGenerator() {
  const generateWallpaper = async (
    hexColor: string,
    imageWidth: number,
    imageHeight: number,
    fileFormat: 'png' | 'jpeg' | 'webp'
  ): Promise<Blob> => {
    const generationCanvas = document.createElement('canvas');
    generationCanvas.width = imageWidth;
    generationCanvas.height = imageHeight;
    
    const rawContext = generationCanvas.getContext('2d');
    if (!rawContext) throw new Error('Could not create canvas context');
    
    const canvasContext: CanvasRenderingContext2D = rawContext;
    canvasContext.fillStyle = hexColor;
    canvasContext.fillRect(0, 0, generationCanvas.width, generationCanvas.height);

    const outputMimeType = `image/${fileFormat}`;
    const exportQuality = fileFormat === 'png' ? undefined : 0.95;

    const exportedBlob = await exportCanvas(generationCanvas, outputMimeType, exportQuality);

    const fileExtension = fileFormat === 'jpeg' ? 'jpg' : fileFormat;
    const generatedFile = new File([exportedBlob], `wallpaper.${fileExtension}`, { type: outputMimeType });
    
    return writeDpi(generatedFile, 96);
  };

  return { generateWallpaper };
}