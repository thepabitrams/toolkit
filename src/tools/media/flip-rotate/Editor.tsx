// src/tools/media/flip-rotate/Editor.tsx
import React, { useEffect, useState } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { Controls } from './Controls';
import { useFlipRotate } from './useFlipRotate';
import type { FileReference } from '@/shared/store/file-store';

interface EditorProps {
  fileReference: FileReference | null;
  onProcessImage: (blob: Blob) => Promise<void>;
}

export const Editor: React.FC<EditorProps> = ({
  fileReference,
  onProcessImage,
}): React.JSX.Element => {
  const [previewImageObjectUrl, setPreviewImageObjectUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { getRawFile } = useFileStore();

  const {
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
  } = useFlipRotate();

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const loadPreviewImage = async (): Promise<void> => {
      if (!fileReference) {
        setPreviewImageObjectUrl(null);
        return;
      }
      try {
        const sourceFileObject = await getRawFile(fileReference.storageKey);
        if (sourceFileObject && isComponentMounted) {
          objectUrlInstance = URL.createObjectURL(sourceFileObject);
          setPreviewImageObjectUrl(objectUrlInstance);
        }
      } catch (error) {
        console.warn('Failed to load image for preview:', error);
      }
    };

    loadPreviewImage();

    return () => {
      isComponentMounted = false;
      if (objectUrlInstance) URL.revokeObjectURL(objectUrlInstance);
    };
  }, [fileReference, getRawFile]);

  const handleApplyTransformations = async (): Promise<void> => {
    if (!fileReference || isExporting) return;
    setIsExporting(true);
    try {
      const originalSourceFile = await getRawFile(fileReference.storageKey);
      if (!originalSourceFile) throw new Error('File not found in storage');
      const processedBlob = await processImage(originalSourceFile);
      await onProcessImage(processedBlob);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!fileReference || !previewImageObjectUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-100 md:h-125 bg-slate-200/60 dark:bg-black/50">
        <p className="text-slate-400 text-sm">Upload an image to transform</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="relative w-full h-100 md:h-125 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center overflow-hidden">
        <img
          src={previewImageObjectUrl}
          alt="Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: cssTransformStyle,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
            willChange: 'transform',
          }}
        />
      </div>

      <Controls
        normalizedRotationAngle={normalizedRotationAngle}
        isFlippedHorizontal={isFlippedHorizontal}
        isFlippedVertical={isFlippedVertical}
        onRotateCounterClockwise={rotateCounterClockwise}
        onRotateClockwise={rotateClockwise}
        onToggleFlipHorizontal={toggleFlipHorizontal}
        onToggleFlipVertical={toggleFlipVertical}
        onResetTransformations={resetTransformations}
        hasConfigurationChanges={hasConfigurationChanges}
      />

      <div className="p-4 pt-0">
        <button
          onClick={handleApplyTransformations}
          disabled={isExporting}
          className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Processing...' : 'Apply Transform'}
        </button>
      </div>
    </div>
  );
};