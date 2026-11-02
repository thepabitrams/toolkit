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
  updateFontSize: (sizeOrUpdater: number | ((previousSize: number) => number)) => void;
  updateTextColor: (color: string) => void;
  updateBackgroundColor: (backgroundColor: string) => void;
  updateOpacity: (opacityOrUpdater: number | ((prevOpacity: number) => number)) => void;
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

export const drawTextOnCanvas = (
  canvas: HTMLCanvasElement,
  sourceImage: HTMLImageElement,
  textConfiguration: TextConfiguration
): void => {
  const rawContext = canvas.getContext('2d');
  if (!rawContext) return;
  const canvasContext: CanvasRenderingContext2D = rawContext;

  const imageWidth = sourceImage.width;
  const imageHeight = sourceImage.height;

  canvas.width = imageWidth;
  canvas.height = imageHeight;

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

  canvasContext.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  const maxTextWidth = imageWidth * 0.95;

  const wrapText = (text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    text.split('\n').forEach((paragraph) => {
      if (paragraph === '') {
        lines.push('');
        return;
      }
      const words = paragraph.split(' ');
      let currentLine = '';
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const word = words[wordIndex];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = canvasContext.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
    });
    return lines;
  };

  const textLines = wrapText(content, maxTextWidth);
  const lineHeight = fontSize * 1.2;
  const totalTextHeight = textLines.length * lineHeight;
  const textPadding = 4;

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
};

export function useAddText(): AddTextReturn {
  const [textConfiguration, setTextConfiguration] = useState<TextConfiguration>(DEFAULT_TEXT_CONFIGURATION);

  const updateTextContent = useCallback((content: string) => {
    setTextConfiguration((prev) => ({ ...prev, content }));
  }, []);

  const updateFontSize = useCallback((sizeOrUpdater: number | ((previousSize: number) => number)) => {
    setTextConfiguration((prev) => ({
      ...prev,
      fontSize: typeof sizeOrUpdater === 'function' ? sizeOrUpdater(prev.fontSize) : sizeOrUpdater,
    }));
  }, []);

  const updateTextColor = useCallback((color: string) => {
    setTextConfiguration((prev) => ({ ...prev, color }));
  }, []);

  const updateBackgroundColor = useCallback((backgroundColor: string) => {
    setTextConfiguration((prev) => ({ ...prev, backgroundColor }));
  }, []);

  const updateOpacity = useCallback((opacityOrUpdater: number | ((prevOpacity: number) => number)) => {
    setTextConfiguration((prev) => ({
      ...prev,
      opacity: typeof opacityOrUpdater === 'function' ? opacityOrUpdater(prev.opacity) : opacityOrUpdater,
    }));
  }, []);

  const updateFontFamily = useCallback((fontFamily: string) => {
    setTextConfiguration((prev) => ({ ...prev, fontFamily }));
  }, []);

  const toggleBold = useCallback(() => {
    setTextConfiguration((prev) => ({
      ...prev,
      fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold',
    }));
  }, []);

  const toggleItalic = useCallback(() => {
    setTextConfiguration((prev) => ({
      ...prev,
      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic',
    }));
  }, []);

  const updatePosition = useCallback((position: 'top' | 'bottom') => {
    setTextConfiguration((prev) => ({ ...prev, position }));
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
    let originalDpi = 96;
    try {
      const dpiResult = await readDpi(sourceFile);
      if (dpiResult.dpi) originalDpi = dpiResult.dpi;
    } catch {
      originalDpi = 96;
    }

    const processingCanvas = document.createElement('canvas');
    drawTextOnCanvas(processingCanvas, sourceImage, textConfiguration);

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