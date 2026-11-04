// src/tools/media/background-remove/add/AddEditor.tsx
import React, { useState, useEffect } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { useAdd } from './useAdd';
import { AddControls } from './AddControls';
import type { FileReference } from '@/shared/store/file-store';

const MAXIMUM_TOOL_FILES = 15;

interface AddEditorProps {
  cutoutFileReference: FileReference | null;
}

export const AddEditor: React.FC<AddEditorProps> = ({ cutoutFileReference }): React.JSX.Element => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const { getRawFile, save } = useFileStore();

  const { backgroundColor, setBackgroundColor, outputFormat, setOutputFormat, applyBackground } = useAdd();

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const loadCutout = async () => {
      if (!cutoutFileReference) {
        setPreviewImageUrl(null);
        setCutoutBlob(null);
        return;
      }
      try {
        const sourceFile = await getRawFile(cutoutFileReference.storageKey);
        if (sourceFile && isComponentMounted) {
          setCutoutBlob(sourceFile);
          objectUrlInstance = URL.createObjectURL(sourceFile);
          setPreviewImageUrl(objectUrlInstance);
        }
      } catch (caughtError) {
        console.warn('Failed to load cutout:', caughtError);
      }
    };

    loadCutout();

    return () => {
      isComponentMounted = false;
      if (objectUrlInstance) URL.revokeObjectURL(objectUrlInstance);
    };
  }, [cutoutFileReference, getRawFile]);

  const handleApply = async (): Promise<void> => {
    // 👇 FIXED: Added the check for cutoutFileReference here
    if (!cutoutBlob || !cutoutFileReference) return;
    
    try {
      const finalBackgroundBlob = await applyBackground(cutoutBlob, outputFormat);
      const fileExtension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const resultFile = new File(
        [finalBackgroundBlob], 
        `final-with-bg.${fileExtension}`, 
        { type: finalBackgroundBlob.type }
      );
      
      await save([resultFile], 'process', MAXIMUM_TOOL_FILES, cutoutFileReference.id, 0);
    } catch (caughtError) {
      console.error('Export failed:', caughtError);
    }
  };

  if (!cutoutBlob || !previewImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-80 bg-slate-200/60 dark:bg-black/50">
        <p className="text-slate-400 text-sm">Generate a cutout first</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-transparent">
      <div className="relative w-full h-80 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center overflow-hidden">
        <img 
          src={previewImageUrl} 
          alt="Cutout preview" 
          className="max-h-full max-w-full w-auto h-auto object-contain transition-colors duration-200" 
          style={{ backgroundColor: backgroundColor || 'transparent' }}
        />
      </div>
      
      <AddControls
        backgroundColor={backgroundColor}
        onColorChange={setBackgroundColor}
        outputFormat={outputFormat}
        onFormatChange={setOutputFormat}
        onApply={handleApply}
      />
    </div>
  );
};