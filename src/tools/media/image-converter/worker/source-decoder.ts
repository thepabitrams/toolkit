import {
  EPS_MIME_TYPES,
  HEIC_MIME_TYPES,
  IMAGE_IN_BROWSER_INPUT_MIME_TYPES,
  SVG_MIME_TYPE,
} from './constants';
import { decodeEps } from './eps-decoder';
import { decodeHeic } from './heic-decoder';
import { decodeWithImageInBrowser } from './image-in-browser-codecs';
import { resolveJsquashDecoder } from './jsquash-codecs';
import { normalizeMimeType } from './mime-type';
import { decodeSvg } from './svg-decoder';

export async function decodeSourceImage(
  sourceBuffer: ArrayBuffer,
  rawInputMimeType: string
): Promise<ImageData> {
  const inputMimeType = normalizeMimeType(rawInputMimeType);

  if (HEIC_MIME_TYPES.has(inputMimeType)) return decodeHeic(sourceBuffer, inputMimeType);
  if (EPS_MIME_TYPES.has(inputMimeType)) return decodeEps(sourceBuffer);
  if (inputMimeType === SVG_MIME_TYPE) return decodeSvg(sourceBuffer);
  if (IMAGE_IN_BROWSER_INPUT_MIME_TYPES.has(inputMimeType)) {
    return decodeWithImageInBrowser(inputMimeType, sourceBuffer);
  }

  const jsquashDecoder = await resolveJsquashDecoder(inputMimeType);
  return jsquashDecoder(sourceBuffer);
}