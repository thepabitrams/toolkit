import { PREVIEW_REQUIRED_MIME_TYPES } from './constants';
import { resolveJsquashEncoder } from './jsquash-codecs';
import { normalizeMimeType } from './mime-type';
import { decodeSourceImage } from './source-decoder';

export async function createPreviewBuffer(
  convertedBuffer: ArrayBuffer,
  rawOutputMimeType: string
): Promise<ArrayBuffer | null> {
  const outputMimeType = normalizeMimeType(rawOutputMimeType);
  if (!PREVIEW_REQUIRED_MIME_TYPES.has(outputMimeType)) return null;

  try {
    const decodedImageData = await decodeSourceImage(convertedBuffer.slice(0), outputMimeType);
    const encodePng = await resolveJsquashEncoder('image/png');
    return await encodePng(decodedImageData);
  } catch {
    return null;
  }
}