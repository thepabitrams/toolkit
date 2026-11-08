import type { DecoderFunction, EncoderFunction } from './types';

export async function resolveJsquashDecoder(mimeType: string): Promise<DecoderFunction> {
  switch (mimeType) {
    case 'image/jpeg':
      return (await import('@jsquash/jpeg')).decode as DecoderFunction;
    case 'image/png':
      return (await import('@jsquash/png')).decode as DecoderFunction;
    case 'image/webp':
      return (await import('@jsquash/webp')).decode as DecoderFunction;
    case 'image/avif':
      return (await import('@jsquash/avif')).decode as DecoderFunction;
    case 'image/jxl':
      return (await import('@jsquash/jxl')).decode as DecoderFunction;
    default:
      throw new Error(`Unsupported jSquash input format: ${mimeType}`);
  }
}

export async function resolveJsquashEncoder(mimeType: string): Promise<EncoderFunction> {
  switch (mimeType) {
    case 'image/jpeg':
      return (await import('@jsquash/jpeg')).encode as EncoderFunction;
    case 'image/png':
      return (await import('@jsquash/png')).encode as EncoderFunction;
    case 'image/webp':
      return (await import('@jsquash/webp')).encode as EncoderFunction;
    case 'image/avif':
      return (await import('@jsquash/avif')).encode as EncoderFunction;
    case 'image/jxl':
      return (await import('@jsquash/jxl')).encode as EncoderFunction;
    default:
      throw new Error(`Unsupported jSquash output format: ${mimeType}`);
  }
}

export async function decodePngBuffer(pngBuffer: ArrayBuffer): Promise<ImageData> {
  const decodePng = await resolveJsquashDecoder('image/png');
  return decodePng(pngBuffer);
}