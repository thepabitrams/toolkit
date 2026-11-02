// src/tools/media/adjust-size/compression/qualityOptimizer.ts

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([]));
    }, mimeType, quality);
  });
}

export async function optimizeQuality(
  sourceCanvas: HTMLCanvasElement,
  outputMimeType: string,
  targetSizeKB: number,
  initialQuality: number = 0.8
): Promise<Blob> {
  const targetSizeBytes = targetSizeKB * 1024;
  let currentQuality = initialQuality;
  let smallestBlob: Blob | null = null;
  let smallestSizeBytes = Infinity;

  while (currentQuality >= 0.05) {
    const compressedBlob = await canvasToBlob(sourceCanvas, outputMimeType, currentQuality);

    if (compressedBlob.size <= targetSizeBytes) {
      if (compressedBlob.size < smallestSizeBytes) {
        smallestBlob = compressedBlob;
        smallestSizeBytes = compressedBlob.size;
      }
      break;
    }

    if (compressedBlob.size < smallestSizeBytes) {
      smallestBlob = compressedBlob;
      smallestSizeBytes = compressedBlob.size;
    }

    currentQuality -= 0.05;
  }

  return smallestBlob || (await canvasToBlob(sourceCanvas, outputMimeType, 0.0));
}