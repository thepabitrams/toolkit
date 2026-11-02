// src/tools/media/add-text/Editor.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/core/components/ui';
import { useFileStore } from '@/shared/store/file-store';
import { Controls } from './Controls';
import { useAddText } from './useAddText';
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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [previewScaleFactor, setPreviewScaleFactor] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const previewContainerRef = useRef<HTMLDivElement>(null);
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
        setPreviewImageObjectUrl(null);
        return;
      }
      try {
        const sourceFileObject = await getRawFile(fileReference.storageKey);
        if (sourceFileObject && isComponentMounted) {
          const previewImage = new Image();
          const objectUrl = URL.createObjectURL(sourceFileObject);
          previewImage.onload = () => {
            setImageDimensions({ width: previewImage.width, height: previewImage.height });
          };
          previewImage.src = objectUrl;
          objectUrlInstance = objectUrl;
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

  useEffect(() => {
    if (!previewContainerRef.current || !imageDimensions.width) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setPreviewScaleFactor(width / imageDimensions.width);
        }
      }
    });
    
    resizeObserver.observe(previewContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [imageDimensions.width]);

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

  if (!fileReference || !previewImageObjectUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-100 md:h-125 bg-slate-200/60 dark:bg-black/50">
        <p className="text-slate-400 text-sm">Upload an image to add text</p>
      </div>
    );
  }

  const textLines = textConfiguration.content.split('\n');
  const hasVisibleContent = textLines.some((line) => line.trim() || line === '');

  const scaledFontSize = textConfiguration.fontSize * previewScaleFactor;
  const scaledPadding = 4 * previewScaleFactor;

  const generateTextContainerStyle = (): React.CSSProperties => {
    return {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      color: textConfiguration.color,
      fontSize: `${scaledFontSize}px`,
      fontFamily: textConfiguration.fontFamily,
      fontWeight: textConfiguration.fontWeight,
      fontStyle: textConfiguration.fontStyle as React.CSSProperties['fontStyle'],
      opacity: textConfiguration.opacity,
      lineHeight: '1.2',
      textAlign: 'center',
      boxSizing: 'border-box',
      padding: '0',
      margin: '0',
      top: textConfiguration.position === 'top' ? 0 : 'auto',
      bottom: textConfiguration.position === 'bottom' ? 0 : 'auto',
      left: 0,
      right: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      transform: 'none',
    };
  };

  const generateTextBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      wordBreak: 'break-word',
      padding: `${scaledPadding}px 0`,
      margin: '0',
      boxSizing: 'border-box',
    };

    if (textConfiguration.backgroundColor === 'transparent' || textConfiguration.backgroundColor === '') {
      return baseStyle;
    }

    return {
      ...baseStyle,
      backgroundColor: textConfiguration.backgroundColor,
    };
  };

  const wrapperAspectRatio =
    imageDimensions.width && imageDimensions.height
      ? imageDimensions.width / imageDimensions.height
      : 1;

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="relative w-full h-100 md:h-125 bg-slate-200/60 dark:bg-black/50">
        <div
          className="relative w-full h-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            ref={previewContainerRef}
            style={{
              position: 'relative',
              aspectRatio: wrapperAspectRatio,
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              flexShrink: 0,
            }}
          >
            <img
              src={previewImageObjectUrl}
              alt="Preview"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />

            {hasVisibleContent && (
              <div style={generateTextContainerStyle()}>
                <div style={generateTextBackgroundStyle()}>
                  {textLines.map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      style={{
                        whiteSpace: 'pre-wrap',
                        width: '100%',
                        textAlign: 'center',
                        lineHeight: '1.2',
                        padding: '0',
                        margin: '0',
                      }}
                    >
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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