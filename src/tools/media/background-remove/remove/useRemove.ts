// src/tools/media/background-remove/remove/useRemove.ts
import { useState, useCallback } from 'react';
import { strategies, strategyList } from '../strategies';
import type { ModelStrategy } from '../strategies';

export interface CutoutResult {
  mask: ImageData | null;
  originalFile: File;
  previewBlob: Blob | null;
}

export function useRemove() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('birefnet');

  const getStrategy = useCallback((): ModelStrategy => {
    const strategy = strategies[selectedModelId as keyof typeof strategies];
    if (!strategy) throw new Error(`Strategy ${selectedModelId} not found`);
    return strategy;
  }, [selectedModelId]);

  const generateCutout = useCallback(
    async (sourceFile: File): Promise<CutoutResult> => {
      setStatus('loading');
      setErrorMessage(null);

      const strategy = getStrategy();

      try {
        const generatedBlob = await strategy.run(sourceFile, (progressValue: number) => {
          if (progressValue === 10) {
            setStatus('loading');
          } else if (progressValue === 60) {
            setStatus('processing');
          } else if (progressValue === 100) {
            setStatus('ready');
          }
        });

        setStatus('ready');
        return { mask: null, originalFile: sourceFile, previewBlob: generatedBlob };
      } catch (error) {
        console.error(`[${strategy.name}] Execution failed:`, error);
        setStatus('error');
        setErrorMessage(
          `${strategy.name} failed: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
      }
    },
    [getStrategy]
  );

  const retry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
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
    selectedModelId,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    availableModels: strategyList,
  };
}