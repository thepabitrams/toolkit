// src/tools/media/background-remove/ai-models/background-worker.ts
import { pipeline, RawImage } from '@huggingface/transformers';

self.onmessage = async (event: MessageEvent) => {
  const { file: sourceImageFile, modelId: modelIdentifier, dtype: modelDataType } = event.data;

  try {
    self.postMessage({ status: 'loading' });

    let segmentationPipeline;
    try {
      segmentationPipeline = await pipeline('image-segmentation', modelIdentifier, { 
        dtype: modelDataType,
        device: 'webgpu' 
      });
    } catch (webgpuError) {
      segmentationPipeline = await pipeline('image-segmentation', modelIdentifier, { 
        dtype: modelDataType,
        device: 'wasm' 
      });
    }

    self.postMessage({ status: 'processing' });

    const rawSourceImage = await RawImage.fromBlob(sourceImageFile);
    const inferenceResults = await segmentationPipeline(rawSourceImage);
    
    const generatedMaskTensor = inferenceResults[0].mask;
    if (!generatedMaskTensor) throw new Error('No mask generated');

    const resizedMaskImage = await generatedMaskTensor.resize(rawSourceImage.width, rawSourceImage.height);

    const processingCanvas = new OffscreenCanvas(rawSourceImage.width, rawSourceImage.height);
    const canvasContext = processingCanvas.getContext('2d');
    if (!canvasContext) throw new Error('Failed to get OffscreenCanvas context');

    const sourceImageBitmap = await createImageBitmap(sourceImageFile);
    canvasContext.drawImage(sourceImageBitmap, 0, 0);

    const compositeImageData = canvasContext.getImageData(0, 0, rawSourceImage.width, rawSourceImage.height);
    const rgbaPixelBuffer = compositeImageData.data;

    const maskProcessingCanvas = new OffscreenCanvas(rawSourceImage.width, rawSourceImage.height);
    const maskCanvasContext = maskProcessingCanvas.getContext('2d');
    if (!maskCanvasContext) throw new Error('Failed to get mask context');

    maskCanvasContext.drawImage(resizedMaskImage.toCanvas(), 0, 0);
    const maskAlphaBuffer = maskCanvasContext.getImageData(0, 0, rawSourceImage.width, rawSourceImage.height).data;

    for (let pixelIndex = 0; pixelIndex < rgbaPixelBuffer.length; pixelIndex += 4) {
      const calculatedAlpha = maskAlphaBuffer[pixelIndex] / 255;
      rgbaPixelBuffer[pixelIndex + 3] = Math.min(rgbaPixelBuffer[pixelIndex + 3], calculatedAlpha * 255);
    }

    canvasContext.putImageData(compositeImageData, 0, 0);
    const transparentBackgroundBlob = await processingCanvas.convertToBlob({ type: 'image/png' });

    self.postMessage({ status: 'done', blob: transparentBackgroundBlob });

  } catch (error) {
    self.postMessage({ status: 'error', message: error instanceof Error ? error.message : String(error) });
  }
};