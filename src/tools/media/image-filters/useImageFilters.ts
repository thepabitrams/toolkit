// src/tools/media/image-filters/useImageFilters.ts
import { useState, useCallback, useMemo } from 'react';
import { readDpi, writeDpi, detectFormatAndAlpha } from '@/shared/entities/image';
import { loadImage, exportCanvas } from '@/shared/lib/browser';
import { FILTER_DEFAULTS, DEFAULT_DPI } from './core/constants';
import { processCanvas } from './core/canvasProcessor';
import type { FilterState, FilterKey } from './core/types';

export interface UseImageFiltersReturn {
  filterConfiguration: FilterState;
  updateFilterValue: (key: FilterKey, value: number | boolean) => void;
  resetFilterConfiguration: () => void;
  hasConfigurationChanges: boolean;
  processImage: (sourceFile: File) => Promise<Blob>;
}

export function useImageFilters(): UseImageFiltersReturn {
  const [filterConfiguration, setFilterConfiguration] = useState<FilterState>(FILTER_DEFAULTS);

  const updateFilterValue = useCallback((key: FilterKey, value: number | boolean) => {
    setFilterConfiguration((previousState) => ({ ...previousState, [key]: value }));
  }, []);

  const resetFilterConfiguration = useCallback(() => {
    setFilterConfiguration(FILTER_DEFAULTS);
  }, []);

  const hasConfigurationChanges = useMemo(() => {
    return JSON.stringify(filterConfiguration) !== JSON.stringify(FILTER_DEFAULTS);
  }, [filterConfiguration]);

  const processImage = useCallback(async (sourceFile: File): Promise<Blob> => {
    const sourceImage = await loadImage(sourceFile);
    let originalDpi = DEFAULT_DPI;
    
    try {
      const dpiResult = await readDpi(sourceFile);
      if (dpiResult.dpi) originalDpi = dpiResult.dpi;
    } catch {
      originalDpi = DEFAULT_DPI;
    }

    const processingCanvas = document.createElement('canvas');
    processingCanvas.width = sourceImage.width;
    processingCanvas.height = sourceImage.height;
    
    const rawContext = processingCanvas.getContext('2d');
    if (!rawContext) throw new Error('Failed to acquire 2D canvas context');
    const canvasContext: CanvasRenderingContext2D = rawContext;

    processCanvas(canvasContext, sourceImage, filterConfiguration);

    const { format, hasAlpha } = await detectFormatAndAlpha(sourceFile);
    const outputMimeType = hasAlpha ? format : 'image/jpeg';
    const exportQuality = outputMimeType === 'image/jpeg' ? 0.95 : undefined;
    
    const exportedBlob = await exportCanvas(processingCanvas, outputMimeType, exportQuality);
    const fileExtension = outputMimeType.split('/')[1] || 'png';
    const metadataFile = new File([exportedBlob], `filtered.${fileExtension}`, { type: outputMimeType });
    
    return writeDpi(metadataFile, originalDpi);
  }, [filterConfiguration]);

  return {
    filterConfiguration,
    updateFilterValue,
    resetFilterConfiguration,
    hasConfigurationChanges,
    processImage,
  };
}