// src/tools/media/adjust-size/strategies/binarySearch.ts
import { loadImage } from '@/shared/lib/browser';

export interface BinarySearchProgress {
  quality: number;
  sizeKB: number;
  iteration: number;
}

export async function binarySearchCompress(
  sourceFile: File,
  targetSizeKB: number,
  outputMimeType: string,
  onProgress?: (data: BinarySearchProgress) => void
): Promise<Blob> {
  const targetSizeBytes = targetSizeKB * 1024;
  const sourceImage = await loadImage(sourceFile);
  const processingCanvas = document.createElement('canvas');
  processingCanvas.width = sourceImage.width;
  processingCanvas.height = sourceImage.height;
  
  const rawContext = processingCanvas.getContext('2d', { alpha: true });
  if (!rawContext) throw new Error('Failed to acquire 2D canvas context');
  const canvasContext: CanvasRenderingContext2D = rawContext;

  canvasContext.clearRect(0, 0, processingCanvas.width, processingCanvas.height);
  canvasContext.drawImage(sourceImage, 0, 0);

  let minimumQuality = 0.05;
  let maximumQuality = 0.95;
  let smallestBlob: Blob | null = null;
  let smallestSizeBytes = Infinity;
  const maximumIterations = 10;

  for (let iteration = 0; iteration < maximumIterations; iteration++) {
    const currentQuality = (minimumQuality + maximumQuality) / 2;
    const encodedBlob = await encodeCanvasToBlob(processingCanvas, currentQuality, outputMimeType);
    const currentSizeBytes = encodedBlob.size;

    onProgress?.({ 
      quality: currentQuality * 100, 
      sizeKB: currentSizeBytes / 1024, 
      iteration: iteration + 1 
    });

    if (currentSizeBytes <= targetSizeBytes) {
      if (currentSizeBytes < smallestSizeBytes) {
        smallestBlob = encodedBlob;
        smallestSizeBytes = currentSizeBytes;
      }
      minimumQuality = currentQuality;
    } else {
      maximumQuality = currentQuality;
    }
  }

  if (!smallestBlob) {
    smallestBlob = await encodeCanvasToBlob(processingCanvas, 0.05, outputMimeType);
  }

  return smallestBlob;
}

function encodeCanvasToBlob(
  canvas: HTMLCanvasElement, 
  quality: number, 
  mimeType: string
): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([]));
    }, mimeType, quality);
  });
}