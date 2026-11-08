import { IMAGE_IN_BROWSER_OUTPUT_MIME_TYPES } from './constants';
import { encodeWithImageInBrowser } from './image-in-browser-codecs';
import { resolveJsquashEncoder } from './jsquash-codecs';
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

  const jsquashEncoder = await resolveJsquashEncoder(outputMimeType);
  const encodeOptions = outputMimeType === 'image/png' ? undefined : { quality: outputQuality };
  return jsquashEncoder(sourceImageData, encodeOptions);
}