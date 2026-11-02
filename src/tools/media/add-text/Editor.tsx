// src/tools/media/add-text/Editor.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/core/components/ui';
import { useFileStore } from '@/shared/store/file-store';
import { Controls } from './Controls';
import { useAddText, drawTextOnCanvas } from './useAddText';
import type { FileReference } from '@/shared/store/file-store';

interface EditorProps {
  fileReference: FileReference | null;
  onProcessImage: (blob: Blob) => Promise<void>;
}

export const Editor: React.FC<EditorProps> = ({
  fileReference,
  onProcessImage,
}): React.JSX.Element => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { getRawFile } = useFileStore();

  const {
    textConfiguration,
    updateTextContent,
    updateFontSize,
    updateTextColor,
    updateBackgroundColor,
    updateOpacity,
    updateFontFamily,
    toggleBold,
    toggleItalic,
    updatePosition,
    resetConfiguration,
    hasConfigurationChanges,
    processImage,
  } = useAddText();

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const loadPreviewImage = async (): Promise<void> => {
      if (!fileReference) {
        setSourceImage(null);
        return;
      }
      try {
        const sourceFileObject = await getRawFile(fileReference.storageKey);
        if (sourceFileObject && isComponentMounted) {
          const previewImage = new Image();
          const objectUrl = URL.createObjectURL(sourceFileObject);
          previewImage.onload = () => {
            if (isComponentMounted) setSourceImage(previewImage);
          };
          previewImage.src = objectUrl;
          objectUrlInstance = objectUrl;
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

  useEffect(() => {
    if (previewCanvasRef.current && sourceImage) {
      drawTextOnCanvas(previewCanvasRef.current, sourceImage, textConfiguration);
    }
  }, [sourceImage, textConfiguration]);

  const handleApplyText = async (): Promise<void> => {
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

  if (!fileReference || !sourceImage) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-100 md:h-125 bg-slate-200/60 dark:bg-black/50">
        <p className="text-slate-400 text-sm">Upload an image to add text</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="relative w-full h-100 md:h-125 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center overflow-hidden">
        <canvas 
          ref={previewCanvasRef}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <Controls
        textConfiguration={textConfiguration}
        onTextChange={updateTextContent}
        onFontSizeChange={updateFontSize}
        onColorChange={updateTextColor}
        onBackgroundColorChange={updateBackgroundColor}
        onOpacityChange={updateOpacity}
        onFontFamilyChange={updateFontFamily}
        onToggleBold={toggleBold}
        onToggleItalic={toggleItalic}
        onPositionChange={updatePosition}
        onReset={resetConfiguration}
        hasChanges={hasConfigurationChanges}
        onApply={handleApplyText}
        isExporting={isExporting}
      />
    </div>
  );
};