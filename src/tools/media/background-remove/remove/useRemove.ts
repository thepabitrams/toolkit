// src/tools/media/background-remove/remove/useRemove.ts
import { useState, useCallback } from 'react';
import { AVAILABLE_AI_MODELS, runInference, type WorkerStatus } from '../ai-models';

export interface CutoutResult {
  previewBlob: Blob | null;
}

export type UIStatus = 'idle' | 'loading' | 'processing' | 'ready' | 'error';

export function useRemove() {
  const [status, setStatus] = useState<UIStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModelIdentifier, setSelectedModelIdentifier] = useState<string>('birefnet');

  const generateCutout = useCallback(
    async (sourceImageFile: File): Promise<CutoutResult> => {
      setStatus('loading');
      setErrorMessage(null);

      const targetModelConfiguration = AVAILABLE_AI_MODELS.find((model) => model.identifier === selectedModelIdentifier);
      if (!targetModelConfiguration) throw new Error(`Model ${selectedModelIdentifier} not found`);

      try {
        const cutoutBlob = await runInference(
          sourceImageFile, 
          targetModelConfiguration, 
          (inferenceProgressStatus: WorkerStatus) => {
            if (inferenceProgressStatus === 'done') {
              setStatus('ready');
            } else {
              setStatus(inferenceProgressStatus);
            }
          }
        );

        setStatus('ready');
        return { previewBlob: cutoutBlob };
      } catch (error) {
        console.error('Execution failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    [selectedModelIdentifier]
  );

  const retry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const setSelectedModel = useCallback((modelIdentifier: string) => {
    setSelectedModelIdentifier(modelIdentifier);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    status,
    errorMessage,
    selectedModelId: selectedModelIdentifier,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    availableModels: AVAILABLE_AI_MODELS.map((model) => ({ id: model.identifier, name: model.displayName })),
  };
}