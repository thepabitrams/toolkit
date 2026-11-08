import {
  createPreviewBuffer,
  decodeSourceImage,
  encodeOutputImage,
  type CodecWorkerScope,
  type ConvertMessage,
  type WorkerErrorMessage,
  type WorkerSuccessMessage,
} from './index';

const workerScope = self as unknown as CodecWorkerScope;

async function processConvertMessage(convertMessage: ConvertMessage): Promise<void> {
  try {
    const sourceImageData = await decodeSourceImage(
      convertMessage.buffer,
      convertMessage.inputMime
    );
    const convertedBuffer = await encodeOutputImage(
      sourceImageData,
      convertMessage.outputMime,
      convertMessage.outputQuality
    );
    const previewBuffer = await createPreviewBuffer(
      convertedBuffer,
      convertMessage.outputMime
    );
    const successMessage: WorkerSuccessMessage = {
      type: 'success',
      buffer: convertedBuffer,
      previewBuffer,
    };
    const transferableBuffers = previewBuffer
      ? [convertedBuffer, previewBuffer]
      : [convertedBuffer];
    workerScope.postMessage(successMessage, transferableBuffers);
  } catch (caughtError) {
    const errorMessage: WorkerErrorMessage = {
      type: 'error',
      message: caughtError instanceof Error ? caughtError.message : 'Conversion failed',
    };
    workerScope.postMessage(errorMessage);
  }
}

workerScope.addEventListener('message', (messageEvent) => {
  void processConvertMessage(messageEvent.data);
});