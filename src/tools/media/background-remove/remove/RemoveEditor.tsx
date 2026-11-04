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

  const { 
    status, 
    errorMessage, 
    selectedModelId, 
    setSelectedModel, 
    generateCutout, 
    retry, 
    availableModels 
  } = useRemove();

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrlInstance: string | null = null;

    const loadPreview = async () => {
      if (!fileReference) {
        setPreviewImageUrl(null);
        return;
      }
      try {
        const rawSourceFileBlob = await getRawFile(fileReference.storageKey);
        if (rawSourceFileBlob && isComponentMounted) {
          objectUrlInstance = URL.createObjectURL(rawSourceFileBlob);
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
    
    const activeSourceBlob = await getRawFile(fileReference.storageKey);
    if (!activeSourceBlob) return;

    try {
      const generationResult = await generateCutout(activeSourceBlob);
      
      if (generationResult && generationResult.previewBlob) {
        const fileExtension = generationResult.previewBlob.type.split('/')[1] || 'png';
        const generatedCutoutFile = new File(
          [generationResult.previewBlob], 
          `cutout.${fileExtension}`, 
          { type: generationResult.previewBlob.type }
        );
        
        await save([generatedCutoutFile], 'cutout', MAXIMUM_TOOL_FILES, fileReference.id, 0);
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

  const isGeneratingCutout = status === 'loading' || status === 'processing';

  return (
    <div className="w-full flex flex-col bg-transparent">
      <div className="relative w-full h-80 bg-[#F1F3F4] dark:bg-[#2a2a2a] rounded-t-xl flex items-center justify-center overflow-hidden">
        
        {isGeneratingCutout && (
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