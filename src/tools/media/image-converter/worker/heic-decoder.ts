import { decodePngBuffer } from './jsquash-codecs';

export async function decodeHeic(
  sourceBuffer: ArrayBuffer,
  heicMimeType: string
): Promise<ImageData> {
  const heic2anyModule = await import('heic2any');
  const convertHeic = heic2anyModule.default;
  const heicBlob = new Blob([sourceBuffer], { type: heicMimeType });
  const conversionResult = await convertHeic({
    blob: heicBlob,
    toType: 'image/png',
  });
  const pngBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
  const pngBuffer = await pngBlob.arrayBuffer();
  return decodePngBuffer(pngBuffer);
}