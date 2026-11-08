export interface ConvertMessage {
  buffer: ArrayBuffer;
  inputMime: string;
  outputMime: string;
  outputQuality: number;
}

export interface WorkerSuccessMessage {
  type: 'success';
  buffer: ArrayBuffer;
  previewBuffer: ArrayBuffer | null;
}

export interface WorkerErrorMessage {
  type: 'error';
  message: string;
}

export interface CodecWorkerScope {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<ConvertMessage>) => void
  ) => void;
}

export type DecoderFunction = (buffer: ArrayBuffer) => Promise<ImageData>;

export type EncoderFunction = (
  imageData: ImageData,
  options?: { quality?: number }
) => Promise<ArrayBuffer>;