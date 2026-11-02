// src/tools/media/add-text/useAddText.ts
import { useState, useCallback, useMemo } from 'react';
import { readDpi, writeDpi, detectFormatAndAlpha } from '@/shared/entities/image';
import { loadImage, exportCanvas } from '@/shared/lib/browser';

export interface TextConfiguration {
  content: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  opacity: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  position: 'top' | 'bottom';
}

export interface AddTextReturn {
  textConfiguration: TextConfiguration;
  updateTextContent: (content: string) => void;
  updateFontSize: (fontSize: number) => void;
  updateTextColor: (color: string) => void;
  updateBackgroundColor: (backgroundColor: string) => void;
  updateOpacity: (opacity: number) => void;
  updateFontFamily: (fontFamily: string) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  updatePosition: (position: 'top' | 'bottom') => void;
  resetConfiguration: () => void;
  hasConfigurationChanges: boolean;
  processImage: (sourceFile: File) => Promise<Blob>;
}

const DEFAULT_TEXT_CONFIGURATION: TextConfiguration = {
  content: 'Add your text here',
  fontSize: 48,
  color: '#ffffff',
  backgroundColor: 'transparent',
  opacity: 1,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  position: 'bottom',
};

export function useAddText(): AddTextReturn {
  const [textConfiguration, setTextConfiguration] = useState<TextConfiguration>(DEFAULT_TEXT_CONFIGURATION);

  const updateTextContent = useCallback((content: string) => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, content }));
  }, []);

  const updateFontSize = useCallback((fontSize: number) => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, fontSize }));
  }, []);

  const updateTextColor = useCallback((color: string) => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, color }));
  }, []);

  const updateBackgroundColor = useCallback((backgroundColor: string) => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, backgroundColor }));
  }, []);

  const updateOpacity = useCallback((opacity: number) => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, opacity }));
  }, []);

  const updateFontFamily = useCallback((fontFamily: string) => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, fontFamily }));
  }, []);

  const toggleBold = useCallback(() => {
    setTextConfiguration((previousConfiguration) => ({
      ...previousConfiguration,
      fontWeight: previousConfiguration.fontWeight === 'bold' ? 'normal' : 'bold',
    }));
  }, []);

  const toggleItalic = useCallback(() => {
    setTextConfiguration((previousConfiguration) => ({
      ...previousConfiguration,
      fontStyle: previousConfiguration.fontStyle === 'italic' ? 'normal' : 'italic',
    }));
  }, []);

  const updatePosition = useCallback((position: 'top' | 'bottom') => {
    setTextConfiguration((previousConfiguration) => ({ ...previousConfiguration, position }));
  }, []);

  const resetConfiguration = useCallback(() => {
    setTextConfiguration(DEFAULT_TEXT_CONFIGURATION);
  }, []);

  const hasConfigurationChanges = useMemo(() => {
    return (
      textConfiguration.content !== DEFAULT_TEXT_CONFIGURATION.content ||
      textConfiguration.fontSize !== DEFAULT_TEXT_CONFIGURATION.fontSize ||
      textConfiguration.color !== DEFAULT_TEXT_CONFIGURATION.color ||
      textConfiguration.backgroundColor !== DEFAULT_TEXT_CONFIGURATION.backgroundColor ||
      textConfiguration.opacity !== DEFAULT_TEXT_CONFIGURATION.opacity ||
      textConfiguration.fontFamily !== DEFAULT_TEXT_CONFIGURATION.fontFamily ||
      textConfiguration.fontWeight !== DEFAULT_TEXT_CONFIGURATION.fontWeight ||
      textConfiguration.fontStyle !== DEFAULT_TEXT_CONFIGURATION.fontStyle ||
      textConfiguration.position !== DEFAULT_TEXT_CONFIGURATION.position
    );
  }, [textConfiguration]);

  const processImage = useCallback(async (sourceFile: File): Promise<Blob> => {
    const sourceImage = await loadImage(sourceFile);
    const imageWidth = sourceImage.width;
    const imageHeight = sourceImage.height;

    let originalDpi = 96;
    try {
      const dpiResult = await readDpi(sourceFile);
      if (dpiResult.dpi) originalDpi = dpiResult.dpi;
    } catch {
      originalDpi = 96;
    }

    const processingCanvas = document.createElement('canvas');
    processingCanvas.width = imageWidth;
    processingCanvas.height = imageHeight;
    const rawContext = processingCanvas.getContext('2d');
    if (!rawContext) throw new Error('Failed to acquire 2D canvas context');
    const canvasContext: CanvasRenderingContext2D = rawContext;

    canvasContext.drawImage(sourceImage, 0, 0, imageWidth, imageHeight);

    const {
      content,
      fontSize,
      color,
      backgroundColor,
      opacity,
      fontFamily,
      fontWeight,
      fontStyle,
      position,
    } = textConfiguration;

    const textLines = content.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = textLines.length * lineHeight;
    const textPadding = 4;

    canvasContext.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    canvasContext.textAlign = 'center';

    if (backgroundColor !== 'transparent' && backgroundColor !== '') {
      canvasContext.save();
      canvasContext.globalAlpha = opacity;
      canvasContext.fillStyle = backgroundColor;

      const backgroundBoxX = 0;
      const backgroundBoxWidth = imageWidth;
      let backgroundBoxY;
      let backgroundBoxHeight;

      if (position === 'top') {
        backgroundBoxY = 0;
        backgroundBoxHeight = totalTextHeight + textPadding * 2;
      } else {
        backgroundBoxY = imageHeight - totalTextHeight - textPadding * 2;
        backgroundBoxHeight = totalTextHeight + textPadding * 2;
      }

      canvasContext.fillRect(backgroundBoxX, backgroundBoxY, backgroundBoxWidth, backgroundBoxHeight);
      canvasContext.restore();
    }

    canvasContext.save();
    canvasContext.globalAlpha = opacity;
    canvasContext.textAlign = 'center';
    canvasContext.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    canvasContext.fillStyle = color;

    let initialYPosition;
    if (position === 'top') {
      canvasContext.textBaseline = 'top';
      initialYPosition = textPadding;
    } else {
      canvasContext.textBaseline = 'bottom';
      initialYPosition = imageHeight - textPadding;
    }

    for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
      const currentLine = textLines[lineIndex] || ' ';
      const currentYPosition =
        position === 'top'
          ? initialYPosition + lineIndex * lineHeight
          : initialYPosition - (textLines.length - 1 - lineIndex) * lineHeight;
      canvasContext.fillText(currentLine, imageWidth / 2, currentYPosition);
    }

    canvasContext.restore();

    const { format, hasAlpha } = await detectFormatAndAlpha(sourceFile);
    const outputMimeType = hasAlpha ? format : 'image/jpeg';
    const exportQuality = outputMimeType === 'image/jpeg' ? 0.95 : undefined;
    const exportedBlob = await exportCanvas(processingCanvas, outputMimeType, exportQuality);

    const fileExtension = outputMimeType.split('/')[1] || 'png';
    const metadataFile = new File([exportedBlob], `text-added.${fileExtension}`, { type: outputMimeType });
    return writeDpi(metadataFile, originalDpi);
  }, [textConfiguration]);

  return {
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
  };
}