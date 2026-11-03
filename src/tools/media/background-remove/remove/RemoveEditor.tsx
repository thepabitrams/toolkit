// src/tools/media/background-remove/remove/RemoveEditor.tsx
import React, { useEffect, useState } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { useRemove } from './useRemove';
import { StatusBadge } from '../components/StatusBadge';
import { RemoveControls } from './RemoveControls';
import type { FileReference } from '@/shared/store/file-store';

interface RemoveEditorProps {
  fileReference: FileReference | null;
}

export const RemoveEditor: React.FC<RemoveEditorProps> = ({ fileReference }): React.JSX.Element => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const { getRawFile, save } = useFileStore();

  const { status, progress, errorMessage, selectedModelId, setSelectedModel, generateCutout, retry, availableModels } = useRemove();

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
      } catch (error) {
        console.warn('Failed to load preview:', error);
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
    const actualFile = await getRawFile(fileReference.storageKey);
    if (!actualFile) return;

    try {
      const result = await generateCutout(actualFile);
      if (result && result.previewBlob) {
        const fileExtension = result.previewBlob.type.split('/')[1] || 'png';
        const cutoutFile = new File([result.previewBlob], `cutout.${fileExtension}`, { type: result.previewBlob.type });
        await save([cutoutFile], 'cutout', undefined, 0);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  if (!fileReference || !previewImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-80 bg-slate-200/60 dark:bg-black/50">
        <p className="text-slate-400 text-sm">Upload an image first</p>
      </div>
    );
  }

  const isBusy = status === 'loading' || status === 'processing';

  return (
    <div className="w-full flex flex-col bg-transparent">
      <div className="relative w-full h-80 bg-slate-200/60 dark:bg-black/50 flex items-center justify-center overflow-hidden">
        <img src={previewImageUrl} alt="Original" className="w-full h-full object-contain" style={{ opacity: isBusy ? 0.5 : 1 }} />
        {/* 🛠️ FIX: Only render the badge if the status is NOT idle */}
        {status !== 'idle' && <StatusBadge status={status} progress={progress} />}
      </div>
      
      <RemoveControls
        status={status}
        progress={progress}
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