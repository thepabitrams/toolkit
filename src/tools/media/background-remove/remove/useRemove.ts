// src/tools/media/background-remove/remove/useRemove.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { strategies, strategyList } from '../strategies';
import type { ModelStrategy } from '../strategies';

export interface CutoutResult {
  mask: ImageData | null;
  originalFile: File;
  previewBlob: Blob | null;
}

export function useRemove() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('birefnet');

  const processingIntervalReference = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (processingIntervalReference.current) {
        clearInterval(processingIntervalReference.current);
        processingIntervalReference.current = null;
      }
    };
  }, []);

  const getStrategy = useCallback((): ModelStrategy => {
    const strategy = strategies[selectedModelId as keyof typeof strategies];
    if (!strategy) throw new Error(`Strategy ${selectedModelId} not found`);
    return strategy;
  }, [selectedModelId]);

  const generateCutout = useCallback(
    async (sourceFile: File): Promise<CutoutResult> => {
      if (processingIntervalReference.current) {
        clearInterval(processingIntervalReference.current);
        processingIntervalReference.current = null;
      }

      setStatus('loading');
      setProgress(0);
      setErrorMessage(null);

      const strategy = getStrategy();

      try {
        const generatedBlob = await strategy.run(sourceFile, (progressValue: number) => {
          if (progressValue === 10) {
            setStatus('loading');
          } else if (progressValue === 60) {
            setStatus('processing');
            setProgress(60);

            if (processingIntervalReference.current) {
              clearInterval(processingIntervalReference.current);
            }
            processingIntervalReference.current = setInterval(() => {
              setProgress((previousProgress) => {
                const nextProgress = previousProgress + 1;
                if (nextProgress >= 99) {
                  clearInterval(processingIntervalReference.current!);
                  processingIntervalReference.current = null;
                  return 99;
                }
                return nextProgress;
              });
            }, 40);
          } else if (progressValue === 85) {
            setProgress(progressValue);
          } else if (progressValue === 100) {
            if (processingIntervalReference.current) {
              clearInterval(processingIntervalReference.current);
              processingIntervalReference.current = null;
            }
            setStatus('ready');
            setProgress(100);
          }
        });

        if (processingIntervalReference.current) {
          clearInterval(processingIntervalReference.current);
          processingIntervalReference.current = null;
        }
        setStatus('ready');
        setProgress(100);
        
        return { mask: null, originalFile: sourceFile, previewBlob: generatedBlob };
      } catch (error) {
        console.error(`[${strategy.name}] Execution failed:`, error);
        if (processingIntervalReference.current) {
          clearInterval(processingIntervalReference.current);
          processingIntervalReference.current = null;
        }
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
    if (processingIntervalReference.current) {
      clearInterval(processingIntervalReference.current);
      processingIntervalReference.current = null;
    }
    setStatus('idle');
    setErrorMessage(null);
    setProgress(0);
  }, []);

  const setSelectedModel = useCallback((modelId: string) => {
    if (processingIntervalReference.current) {
      clearInterval(processingIntervalReference.current);
      processingIntervalReference.current = null;
    }
    setSelectedModelId(modelId);
    setStatus('idle');
    setErrorMessage(null);
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    if (processingIntervalReference.current) {
      clearInterval(processingIntervalReference.current);
      processingIntervalReference.current = null;
    }
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
  }, []);

  return {
    status,
    progress,
    errorMessage,
    selectedModelId,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    availableModels: strategyList,
  };
}