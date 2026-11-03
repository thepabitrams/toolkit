// src/tools/media/flip-rotate/useFlipRotate.ts
import { useState, useCallback, useMemo } from 'react';
import { readDpi, writeDpi, detectFormatAndAlpha } from '@/shared/entities/image';
import { loadImage, exportCanvas, prepareCanvas, resizeCanvas } from '@/shared/lib/browser';

export interface UseFlipRotateReturn {
  rotation: number;
  isFlippedHorizontal: boolean;
  isFlippedVertical: boolean;
  rotateCounterClockwise: () => void;
  rotateClockwise: () => void;
  toggleFlipHorizontal: () => void;
  toggleFlipVertical: () => void;
  resetTransformations: () => void;
  cssTransformStyle: string;
  normalizedRotationAngle: number;
  hasConfigurationChanges: boolean;
  processImage: (sourceFile: File) => Promise<Blob>;
}

export function useFlipRotate(): UseFlipRotateReturn {
  const [rotation, setRotation] = useState(0);
  const [isFlippedHorizontal, setIsFlippedHorizontal] = useState(false);
  const [isFlippedVertical, setIsFlippedVertical] = useState(false);

  const rotateCounterClockwise = useCallback(() => setRotation((previousAngle) => previousAngle - 90), []);
  const rotateClockwise = useCallback(() => setRotation((previousAngle) => previousAngle + 90), []);
  const toggleFlipHorizontal = useCallback(() => setIsFlippedHorizontal((previousState) => !previousState), []);
  const toggleFlipVertical = useCallback(() => setIsFlippedVertical((previousState) => !previousState), []);
  
  const resetTransformations = useCallback(() => {
    setRotation(0);
    setIsFlippedHorizontal(false);
    setIsFlippedVertical(false);
  }, []);

  const cssTransformStyle = useMemo(() => {
    return `rotate(${rotation}deg) scaleX(${isFlippedHorizontal ? -1 : 1}) scaleY(${isFlippedVertical ? -1 : 1})`;
  }, [rotation, isFlippedHorizontal, isFlippedVertical]);

  const normalizedRotationAngle = useMemo(() => {
    return ((rotation % 360) + 360) % 360;
  }, [rotation]);

  const hasConfigurationChanges = rotation !== 0 || isFlippedHorizontal || isFlippedVertical;

  const processImage = useCallback(async (sourceFile: File): Promise<Blob> => {
    let originalDpi = 96;
    try {
      const dpiResult = await readDpi(sourceFile);
      if (dpiResult.dpi) originalDpi = dpiResult.dpi;
    } catch (error) {
      originalDpi = 96;
    }

    const { format: originalFormat, hasAlpha } = await detectFormatAndAlpha(sourceFile);
    const outputMimeType = hasAlpha ? originalFormat : 'image/jpeg';
    const exportQuality = outputMimeType === 'image/jpeg' ? 0.95 : undefined;

    const sourceImage = await loadImage(sourceFile);

    let outputWidth = sourceImage.width;
    let outputHeight = sourceImage.height;
    
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    if (normalizedRotation === 90 || normalizedRotation === 270) {
      [outputWidth, outputHeight] = [outputHeight, outputWidth];
    }

    const processingCanvas = document.createElement('canvas');
    resizeCanvas(processingCanvas, outputWidth, outputHeight);
    const canvasContext = prepareCanvas(processingCanvas, hasAlpha);

    canvasContext.translate(outputWidth / 2, outputHeight / 2);
    canvasContext.rotate((rotation * Math.PI) / 180);
    canvasContext.scale(isFlippedHorizontal ? -1 : 1, isFlippedVertical ? -1 : 1);
    canvasContext.drawImage(sourceImage, -sourceImage.width / 2, -sourceImage.height / 2);

    const exportedBlob = await exportCanvas(processingCanvas, outputMimeType, exportQuality);

    const fileExtension = outputMimeType.split('/')[1] || 'png';
    const metadataFile = new File([exportedBlob], `transformed.${fileExtension}`, { type: outputMimeType });
    return writeDpi(metadataFile, originalDpi);
  }, [rotation, isFlippedHorizontal, isFlippedVertical]);

  return {
    rotation,
    isFlippedHorizontal,
    isFlippedVertical,
    rotateCounterClockwise,
    rotateClockwise,
    toggleFlipHorizontal,
    toggleFlipVertical,
    resetTransformations,
    cssTransformStyle,
    normalizedRotationAngle,
    hasConfigurationChanges,
    processImage,
  };
}