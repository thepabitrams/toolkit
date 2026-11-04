// src/tools/media/background-remove/remove/RemoveEditor.tsx
import React, { useEffect, useState } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { useRemove } from './useRemove';
import { RemoveControls } from './RemoveControls';
import styles from './RemoveEditor.module.css';
import type { FileReference } from '@/shared/store/file-store';

const MAXIMUM_TOOL_FILES = 15;

interface RemoveEditorProps {
  fileReference: FileReference | null;
}

export const RemoveEditor: React.FC<RemoveEditorProps> = ({ fileReference }): React.JSX.Element => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const { getRawFile, save } = useFileStore();

  const { status, errorMessage, selectedModelId, setSelectedModel, generateCutout, retry, availableModels } = useRemove();

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const loadPreview = async () => {
      if (!fileReference) {
        setPreviewImageUrl(null);
        return;
      }
      try {
        const sourceFile = await getRawFile(fileReference.storageKey);
        if (sourceFile && isComponentMounted) {
          objectUrlInstance = URL.createObjectURL(sourceFile);
          setPreviewImageUrl(objectUrlInstance);
        }
      } catch (caughtError) {
        console.warn('Failed to load preview:', caughtError);
      }
    };

    loadPreview();

    return () => {
      isComponentMounted = false;
      if (objectUrlInstance) URL.revokeObjectURL(objectUrlInstance);
    };
  }, [fileReference, getRawFile]);

  const handleGenerateCutout = async (): Promise<void> => {
    if (!fileReference) return;
    const activeSourceFile = await getRawFile(fileReference.storageKey);
    if (!activeSourceFile) return;

    try {
      const generationResult = await generateCutout(activeSourceFile);
      if (generationResult && generationResult.previewBlob) {
        const fileExtension = generationResult.previewBlob.type.split('/')[1] || 'png';
        const cutoutFile = new File(
          [generationResult.previewBlob], 
          `cutout.${fileExtension}`, 
          { type: generationResult.previewBlob.type }
        );
        
        await save([cutoutFile], 'cutout', MAXIMUM_TOOL_FILES, fileReference.id, 0);
      }
    } catch (caughtError) {
      console.error('Generation failed:', caughtError);
    }
  };

  if (!fileReference || !previewImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-80 bg-slate-200/60 dark:bg-black/50 rounded-t-xl">
        <p className="text-slate-400 text-sm">Upload an image first</p>
      </div>
    );
  }

  const isBusy = status === 'loading' || status === 'processing';

  return (
    <div className="w-full flex flex-col bg-transparent">
      <div className="relative w-full h-80 bg-[#F1F3F4] dark:bg-[#2a2a2a] rounded-t-xl flex items-center justify-center overflow-hidden">
        
        {isBusy && (
          <div className={styles.traceWrapper}>
            <div className={styles.traceLine} />
          </div>
        )}

        <img 
          src={previewImageUrl} 
          alt="Original" 
          className="relative z-0 w-full h-full object-contain" 
        />
      </div>
      
      <RemoveControls
        status={status}
        errorMessage={errorMessage}
        selectedModelId={selectedModelId}
        onModelChange={setSelectedModel}
        onGenerate={handleGenerateCutout}
        onRetry={retry}
        availableModels={availableModels}
      />
    </div>
  );
};