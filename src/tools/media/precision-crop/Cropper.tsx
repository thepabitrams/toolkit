import React, { useState, useCallback, useEffect } from "react";
import ReactEasyCrop from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { usePrecisionCrop } from "./usePrecisionCrop";
import { CropControls } from "./Controls";
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { loadImage, exportCanvas, prepareCanvas } from '@/shared/lib/browser';
import { writeDpi } from '@/shared/entities/image';

interface CropperProps {
  fileReference: FileReference | null;
  aspectRatio: number;
  targetWidthPixels: number;
  targetHeightPixels: number;
  inputDpi?: number;
  handleCropConfirm: (croppedBlob: Blob, generatedFileName: string) => Promise<void>;
}

export const Cropper: React.FC<CropperProps> = ({
  fileReference,
  aspectRatio,
  targetWidthPixels,
  targetHeightPixels,
  inputDpi = 96,
  handleCropConfirm,
}): React.JSX.Element => {
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const { getRawFile } = useFileStore();

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

    const fetchImageFile = async (): Promise<void> => {
      if (!fileReference) {
        setImageObjectUrl(null);
        return;
      }

      try {
        const originalFileObject = await getRawFile(fileReference.storageKey);
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
  }, [fileReference, getRawFile]);

  const onCropAreaComplete = useCallback((_: Area, completedCroppedAreaPixels: Area): void => {
    setCroppedAreaPixels(completedCroppedAreaPixels);
  }, []);

  const handleCropExecution = useCallback(async (): Promise<void> => {
    if (!fileReference || !croppedAreaPixels || !imageObjectUrl) return;

    try {
      const originalFileObject = await getRawFile(fileReference.storageKey);
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

      let actualMimeType = croppedBlob.type || originalMimeType;

      const finalFileObject = new File([croppedBlob], fileReference.name, { type: actualMimeType });
      const dpiProcessedBlob = await writeDpi(finalFileObject, inputDpi);

      const fileExtension = actualMimeType.split('/')[1] || 'jpg';
      const baseName = fileReference.name.replace(/\.[^.]+$/, '');
      const newFileName = `${baseName}_cropped_${targetWidthPixels}x${targetHeightPixels}.${fileExtension}`;

      await handleCropConfirm(dpiProcessedBlob, newFileName);

    } catch (error) {
      console.error('Crop error:', error);
      throw new Error('Failed to crop image. Please try again.');
    }
  }, [fileReference, croppedAreaPixels, targetWidthPixels, targetHeightPixels, inputDpi, handleCropConfirm, imageObjectUrl, getRawFile]);

  if (!fileReference) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-700">
        <p className="text-slate-400 text-sm">Select an image to begin</p>
      </div>
    );
  }

  if (!imageObjectUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-700">
         <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="relative w-full h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-700 rounded-t-none sm:rounded-t-3xl"
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
    </div>
  );
};