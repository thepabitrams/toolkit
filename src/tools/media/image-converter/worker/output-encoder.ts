// src/tools/media/image-converter/worker/output-encoder.ts
import { IMAGE_IN_BROWSER_OUTPUT_MIME_TYPES } from './constants';
import { encodeWithImageInBrowser } from './image-in-browser-codecs';
import { resolveJsquashEncoder } from './jsquash-codecs';
import { encodeWithImagescript } from './imagescript-codecs';
import { normalizeMimeType } from './mime-type';

export async function encodeOutputImage(
  sourceImageData: ImageData,
  rawOutputMimeType: string,
  outputQuality: number
): Promise<ArrayBuffer> {
  const outputMimeType = normalizeMimeType(rawOutputMimeType);

  if (IMAGE_IN_BROWSER_OUTPUT_MIME_TYPES.has(outputMimeType)) {
    return encodeWithImageInBrowser(outputMimeType, sourceImageData);
  }

  if (outputMimeType === 'image/avif' || outputMimeType === 'image/jxl') {
    return encodeWithImagescript(outputMimeType, sourceImageData, outputQuality);
  }

  const jsquashEncoder = await resolveJsquashEncoder(outputMimeType);
  const encodeOptions = outputMimeType === 'image/png' ? undefined : { quality: outputQuality };
  return jsquashEncoder(sourceImageData, encodeOptions);
}