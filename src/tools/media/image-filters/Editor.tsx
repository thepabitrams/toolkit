// src/tools/media/image-filters/Editor.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { useMobile } from '@/core/hooks/useMobile';
import { Controls } from './Controls';
import { useImageFilters } from './useImageFilters';
import { processCanvas } from './core/canvasProcessor';
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
  const [isPreviewProcessing, setIsPreviewProcessing] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { getRawFile } = useFileStore();
  
  const isMobileViewport = useMobile(768);

  const {
    filterConfiguration,
    updateFilterValue,
    resetFilterConfiguration,
    hasConfigurationChanges,
    processImage,
  } = useImageFilters();

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
    if (!previewCanvasRef.current || !sourceImage) return;

    setIsPreviewProcessing(true);

    const debounceTimeout = setTimeout(() => {
      const previewCanvas = previewCanvasRef.current;
      if (!previewCanvas) return;

      previewCanvas.width = sourceImage.width;
      previewCanvas.height = sourceImage.height;
      const rawContext = previewCanvas.getContext('2d');
      
      if (rawContext) {
        processCanvas(rawContext, sourceImage, filterConfiguration);
      }
      setIsPreviewProcessing(false);
    }, 50);

    return () => clearTimeout(debounceTimeout);
  }, [sourceImage, filterConfiguration]);

  const handleApplyFilters = async (): Promise<void> => {
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
      <div className="flex flex-col items-center justify-center w-full h-64 bg-slate-200/60 dark:bg-black/50">
        <p className="text-slate-400 text-sm">Upload an image to apply filters</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[70vh] max-h-187.5 min-h-137.5 bg-transparent overflow-hidden rounded-xl">
      
      <div className="relative w-full h-55 sm:h-80 shrink-0 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain" />
        
        {isPreviewProcessing && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Rendering
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 w-full relative bg-white dark:bg-gray-950">
        <Controls
          filterConfiguration={filterConfiguration}
          onUpdateFilter={updateFilterValue}
          onResetFilters={resetFilterConfiguration}
          hasConfigurationChanges={hasConfigurationChanges}
          onApplyFilters={handleApplyFilters}
          isExporting={isExporting}
        />
      </div>
      
    </div>
  );
};