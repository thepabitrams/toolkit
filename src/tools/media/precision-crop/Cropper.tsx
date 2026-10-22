// src/tools/media/precision-crop/Cropper.tsx
import React, { useState, useCallback, useEffect } from "react";
import ReactEasyCrop from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { usePrecisionCrop } from "./usePrecisionCrop";
import { CropControls } from "./Controls";
import { useFileStore } from '@/shared/store/file-store';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import type { FileReference } from '@/shared/store/file-store';
import { loadImage, exportCanvas, prepareCanvas } from '@/lib/browser';
import { writeDpi } from '@/entities/image';

interface CropperProperties {
  fileReference: FileReference | null;
  aspectRatio: number;
  targetWidthPixels: number;
  targetHeightPixels: number;
  inputDpi?: number;
  handleCropConfirm: (croppedBlob: Blob, fileName: string, originalMimeType: string, actualMimeType: string) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const Cropper: React.FC<CropperProperties> = ({
  fileReference,
  aspectRatio,
  targetWidthPixels,
  targetHeightPixels,
  inputDpi = 96,
  handleCropConfirm,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const { readRawFile } = useFileStore();

  const {
    cropPosition,
    zoomLevel,
    setCropPosition,
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    isAtMinZoom,
    isAtMaxZoom,
  } = usePrecisionCrop();

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const fetchImageFile = async () => {
      if (!fileReference) {
        setImageObjectUrl(null);
        return;
      }

      try {
        const originalFileObject = await readRawFile(fileReference.storageKey);
        if (originalFileObject && isComponentMounted) {
          objectUrlInstance = URL.createObjectURL(originalFileObject);
          setImageObjectUrl(objectUrlInstance);
        }
      } catch (error) {
        console.warn('Failed to load image for cropper:', error);
      }
    };

    fetchImageFile();

    return () => {
      isComponentMounted = false;
      if (objectUrlInstance) {
        URL.revokeObjectURL(objectUrlInstance);
      }
    };
  }, [fileReference, readRawFile]);

  const onCropAreaComplete = useCallback((_: Area, completedCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(completedCroppedAreaPixels);
  }, []);

  const handleCropExecution = useCallback(async () => {
    if (!fileReference || !croppedAreaPixels || !imageObjectUrl) return;

    try {
      const originalFileObject = await readRawFile(fileReference.storageKey);
      if (!originalFileObject) throw new Error("Failed to read file");

      const sourceImage = await loadImage(originalFileObject);

      const originalMimeType = originalFileObject.type || 'image/png';
      const supportsAlphaChannel = originalMimeType !== 'image/jpeg' && originalMimeType !== 'image/bmp';

      const canvasElement = document.createElement('canvas');
      canvasElement.width = targetWidthPixels;
      canvasElement.height = targetHeightPixels;
      const canvasContext = prepareCanvas(canvasElement, supportsAlphaChannel);

      const { x, y, width, height } = croppedAreaPixels;
      canvasContext.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in canvasContext) {
        canvasContext.imageSmoothingQuality = 'high';
      }
      canvasContext.drawImage(
        sourceImage,
        x, y, width, height,
        0, 0, targetWidthPixels, targetHeightPixels
      );

      let croppedBlob: Blob;
      const exportQuality = (originalMimeType === 'image/jpeg' || originalMimeType === 'image/webp') ? 0.92 : undefined;

      try {
        croppedBlob = await exportCanvas(canvasElement, originalMimeType, exportQuality);
      } catch {
        croppedBlob = await exportCanvas(canvasElement, 'image/png');
      }

      let actualMimeType = croppedBlob.type || '';

      if (!actualMimeType) {
        try {
          const temporaryFile = new File([croppedBlob], 'temp', { type: originalMimeType });
          actualMimeType = temporaryFile.type || originalMimeType;
        } catch {
          actualMimeType = originalMimeType;
        }
      }

      const finalMimeType = actualMimeType;

      const finalFileObject = new File([croppedBlob], fileReference.name, { type: finalMimeType });
      const dpiProcessedBlob = await writeDpi(finalFileObject, inputDpi);

      const fileExtension = finalMimeType.split('/')[1] || 'jpg';
      const baseName = fileReference.name.replace(/\.[^.]+$/, '');
      const newFileName = `${baseName}_cropped_${targetWidthPixels}x${targetHeightPixels}.${fileExtension}`;

      await handleCropConfirm(dpiProcessedBlob, newFileName, originalMimeType, actualMimeType);

    } catch (error) {
      console.error('Crop error:', error);
      throw new Error('Failed to crop image. Please try again.');
    }
  }, [fileReference, croppedAreaPixels, targetWidthPixels, targetHeightPixels, inputDpi, handleCropConfirm, imageObjectUrl, readRawFile]);

  if (!fileReference || !imageObjectUrl) {
    return (
      <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
        <Container className="px-0 h-full">
          <Card className="p-4 flex flex-col items-center justify-center min-h-50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to crop</p>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
      <Container className="px-0 h-full">
        <Card className="overflow-hidden p-0 h-full">
          <div
            className="relative w-full aspect-square min-h-75 sm:min-h-100 bg-gray-100 dark:bg-gray-700"
            style={{ touchAction: 'none' }}
          >
            <ReactEasyCrop
              image={imageObjectUrl}
              crop={cropPosition}
              zoom={zoomLevel}
              rotation={0}
              aspect={aspectRatio}
              minZoom={1}
              maxZoom={5}
              restrictPosition={true}
              zoomWithScroll={true}
              onCropChange={setCropPosition}
              onZoomChange={setZoomLevel}
              onCropComplete={onCropAreaComplete}
              style={{
                containerStyle: { width: "100%", height: "100%", position: "relative" },
                cropAreaStyle: {
                  border: "2px solid rgba(59, 130, 246, 0.8)",
                  borderRadius: "8px",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                },
                mediaStyle: {
                  transition: "transform 0.15s ease-out",
                  willChange: "transform",
                },
              }}
            />
          </div>

          <CropControls
            currentZoom={zoomLevel}
            isAtMinZoom={isAtMinZoom}
            isAtMaxZoom={isAtMaxZoom}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            handleReset={handleReset}
            handleApplyCrop={handleCropExecution}
          />
        </Card>
      </Container>
    </div>
  );
};