// src/tools/media/background-remove/ai-models/run-inference.ts
import type { AIModelConfiguration } from './model-config';

export type WorkerStatus = 'loading' | 'processing' | 'done';

export const runInference = (
  sourceFile: File,
  modelConfiguration: AIModelConfiguration,
  onStatusChange: (status: WorkerStatus) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const inferenceWorker = new Worker(new URL('./background-worker.ts', import.meta.url), { type: 'module' });
    
    inferenceWorker.postMessage({ 
      file: sourceFile, 
      modelId: modelConfiguration.huggingFacePath, 
      dtype: modelConfiguration.dataType 
    });

    inferenceWorker.onmessage = (event: MessageEvent) => {
      const { status, blob, message } = event.data;

      if (status === 'loading' || status === 'processing') {
        onStatusChange(status);
      } else if (status === 'error') {
        inferenceWorker.terminate();
        reject(new Error(message));
      } else if (status === 'done') {
        inferenceWorker.terminate();
        if (blob) {
          onStatusChange('done');
          resolve(blob);
        } else {
          reject(new Error('Worker finished but returned no blob'));
        }
      }
    };

    inferenceWorker.onerror = (error) => {
      inferenceWorker.terminate();
      reject(new Error(error.message || 'Worker error'));
    };
  });
};