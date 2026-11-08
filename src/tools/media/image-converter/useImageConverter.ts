import { useCallback, useEffect, useRef, useState } from 'react';
import { detectFormatAndAlpha } from '@/shared/entities/image/detect';

export type OutputFormat =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/avif'
  | 'image/jxl'
  | 'image/bmp'
  | 'image/gif'
  | 'image/ico'
  | 'image/tga'
  | 'image/tiff';

export interface ConversionSettings {
  outputFormat: OutputFormat;
  outputQuality: number;
}

export interface ConversionProgress {
  isConverting: boolean;
  percent: number;
}

export interface ConversionResult {
  convertedFile: File;
  previewFile: File | null;
}

interface WorkerSuccessResponse {
  type: 'success';
  buffer: ArrayBuffer;
  previewBuffer: ArrayBuffer | null;
}

interface WorkerErrorResponse {
  type: 'error';
  message: string;
}

type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

const PREVIEW_MIME_TYPE = 'image/png';

const EXTENSION_BY_MIME: Record<OutputFormat, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/jxl': 'jxl',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/ico': 'ico',
  'image/tga': 'tga',
  'image/tiff': 'tiff',
};

const HEIC_FILE_EXTENSIONS = new Set(['heic', 'heif']);
const EPS_FILE_EXTENSIONS = new Set(['eps', 'ps']);
const SVG_FILE_EXTENSIONS = new Set(['svg']);
const PSD_FILE_EXTENSIONS = new Set(['psd']);

function resolveSourceMime(sourceFile: File, detectedFormat: string): string {
  const filenameExtension = sourceFile.name.split('.').pop()?.toLowerCase() ?? '';
  if (HEIC_FILE_EXTENSIONS.has(filenameExtension)) return 'image/heic';
  if (EPS_FILE_EXTENSIONS.has(filenameExtension)) return 'application/postscript';
  if (SVG_FILE_EXTENSIONS.has(filenameExtension)) return 'image/svg+xml';
  if (PSD_FILE_EXTENSIONS.has(filenameExtension)) return 'image/psd';
  return detectedFormat;
}

function createResultFromResponse(
  response: WorkerSuccessResponse,
  sourceFile: File,
  settings: ConversionSettings
): ConversionResult {
  const outputBaseName = sourceFile.name.replace(/\.[^.]+$/, '') || 'converted';
  const outputExtension = EXTENSION_BY_MIME[settings.outputFormat];
  const convertedFile = new File(
    [new Blob([response.buffer], { type: settings.outputFormat })],
    `${outputBaseName}.${outputExtension}`,
    { type: settings.outputFormat }
  );
  const previewFile = response.previewBuffer
    ? new File(
        [new Blob([response.previewBuffer], { type: PREVIEW_MIME_TYPE })],
        `${outputBaseName}-preview.png`,
        { type: PREVIEW_MIME_TYPE }
      )
    : null;
  return { convertedFile, previewFile };
}

export function useImageConverter() {
  const codecWorkerRef = useRef<Worker | null>(null);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress>({
    isConverting: false,
    percent: 0,
  });
  const [conversionError, setConversionError] = useState<string | null>(null);

  useEffect(() => {
    const codecWorker = new Worker(
      new URL('./worker/worker.ts', import.meta.url),
      { type: 'module' }
    );
    codecWorkerRef.current = codecWorker;
    return () => {
      codecWorker.terminate();
      codecWorkerRef.current = null;
    };
  }, []);

  const convertSingleFile = useCallback(
    async (
      sourceFile: File,
      resolvedSourceMime: string,
      settings: ConversionSettings
    ): Promise<ConversionResult> => {
      const codecWorker = codecWorkerRef.current;
      if (!codecWorker) throw new Error('Conversion engine not ready');

      const sourceBuffer = await sourceFile.arrayBuffer();

      return new Promise<ConversionResult>((resolve, reject) => {
        const detachListeners = (): void => {
          codecWorker.removeEventListener('message', handleWorkerMessage);
          codecWorker.removeEventListener('error', handleWorkerError);
        };

        const handleWorkerMessage = (event: MessageEvent<WorkerResponse>): void => {
          detachListeners();
          const response = event.data;
          if (response.type === 'success') {
            resolve(createResultFromResponse(response, sourceFile, settings));
          } else {
            reject(new Error(response.message));
          }
        };

        const handleWorkerError = (event: ErrorEvent): void => {
          detachListeners();
          reject(event.error ?? new Error(event.message));
        };

        codecWorker.addEventListener('message', handleWorkerMessage);
        codecWorker.addEventListener('error', handleWorkerError);
        codecWorker.postMessage(
          {
            buffer: sourceBuffer,
            inputMime: resolvedSourceMime,
            outputMime: settings.outputFormat,
            outputQuality: settings.outputQuality,
          },
          [sourceBuffer]
        );
      });
    },
    []
  );

  const convertFiles = useCallback(
    async (
      sourceFiles: File[],
      settings: ConversionSettings
    ): Promise<ConversionResult[]> => {
      setConversionError(null);
      setConversionProgress({ isConverting: true, percent: 0 });
      const conversionResults: ConversionResult[] = [];

      try {
        for (let fileIndex = 0; fileIndex < sourceFiles.length; fileIndex += 1) {
          const sourceFile = sourceFiles[fileIndex];
          
          let detectedSourceFormat = sourceFile.type || 'image/png';
          try {
            const detectionResult = await detectFormatAndAlpha(sourceFile);
            detectedSourceFormat = detectionResult.format;
          } catch (caughtError) {
            console.warn('Format detection failed, using file type:', caughtError);
          }

          const resolvedSourceMime = resolveSourceMime(sourceFile, detectedSourceFormat);
          const conversionResult = await convertSingleFile(
            sourceFile,
            resolvedSourceMime,
            settings
          );
          conversionResults.push(conversionResult);
          setConversionProgress({
            isConverting: true,
            percent: Math.round(((fileIndex + 1) / sourceFiles.length) * 100),
          });
        }
        return conversionResults;
      } catch (caughtError) {
        setConversionError(
          caughtError instanceof Error ? caughtError.message : 'Conversion failed'
        );
        return [];
      } finally {
        setConversionProgress({ isConverting: false, percent: 0 });
      }
    },
    [convertSingleFile]
  );

  return {
    conversionProgress,
    conversionError,
    convertFiles,
  };
}