// src/tools/media/image-converter/worker/jsquash-codecs.ts
import type { DecoderFunction, EncoderFunction } from './types';

const codecInitializationPromises = new Map<string, Promise<void>>();

async function downloadWasmArrayBuffer(filename: string): Promise<ArrayBuffer> {
  const response = await fetch(`/wasm/jsquash/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch WASM module: ${filename} (Status: ${response.status})`);
  }
  return response.arrayBuffer();
}

async function initializeJsquashCodec(mimeType: string): Promise<void> {
  if (codecInitializationPromises.has(mimeType)) {
    return codecInitializationPromises.get(mimeType)!;
  }

  const initPromise = (async (): Promise<void> => {
    switch (mimeType) {
      case 'image/jpeg': {
        const { init: initDecoder } = await import('@jsquash/jpeg/decode');
        const { init: initEncoder } = await import('@jsquash/jpeg/encode');
        const [decoderBuffer, encoderBuffer] = await Promise.all([
          downloadWasmArrayBuffer('mozjpeg_dec.wasm'),
          downloadWasmArrayBuffer('mozjpeg_enc.wasm'),
        ]);
        const [decoderModule, encoderModule] = await Promise.all([
          WebAssembly.compile(decoderBuffer),
          WebAssembly.compile(encoderBuffer),
        ]);
        await Promise.all([initDecoder(decoderModule), initEncoder(encoderModule)]);
        break;
      }
      case 'image/png': {
        const { init: initDecoder } = await import('@jsquash/png/decode');
        const { init: initEncoder } = await import('@jsquash/png/encode');
        const pngBuffer = await downloadWasmArrayBuffer('squoosh_png_bg.wasm');
        const pngModule = await WebAssembly.compile(pngBuffer);
        await Promise.all([initDecoder(pngModule), initEncoder(pngModule)]);
        break;
      }
      case 'image/webp': {
        const { init: initDecoder } = await import('@jsquash/webp/decode');
        const { init: initEncoder } = await import('@jsquash/webp/encode');
        const [decoderBuffer, encoderBuffer] = await Promise.all([
          downloadWasmArrayBuffer('webp_dec.wasm'),
          downloadWasmArrayBuffer('webp_enc.wasm'),
        ]);
        const [decoderModule, encoderModule] = await Promise.all([
          WebAssembly.compile(decoderBuffer),
          WebAssembly.compile(encoderBuffer),
        ]);
        await Promise.all([initDecoder(decoderModule), initEncoder(encoderModule)]);
        break;
      }
      default:
        return;
    }
  })();

  codecInitializationPromises.set(mimeType, initPromise);
  return initPromise;
}

export async function resolveJsquashDecoder(mimeType: string): Promise<DecoderFunction> {
  await initializeJsquashCodec(mimeType);
  switch (mimeType) {
    case 'image/jpeg': {
      const { default: decode } = await import('@jsquash/jpeg/decode');
      return decode as DecoderFunction;
    }
    case 'image/png': {
      const { default: decode } = await import('@jsquash/png/decode');
      return decode as DecoderFunction;
    }
    case 'image/webp': {
      const { default: decode } = await import('@jsquash/webp/decode');
      return decode as DecoderFunction;
    }
    default:
      throw new Error(`Unsupported jSquash input format: ${mimeType}`);
  }
}

export async function resolveJsquashEncoder(mimeType: string): Promise<EncoderFunction> {
  await initializeJsquashCodec(mimeType);
  switch (mimeType) {
    case 'image/jpeg': {
      const { default: encode } = await import('@jsquash/jpeg/encode');
      return encode as EncoderFunction;
    }
    case 'image/png': {
      const { default: encode } = await import('@jsquash/png/encode');
      return encode as EncoderFunction;
    }
    case 'image/webp': {
      const { default: encode } = await import('@jsquash/webp/encode');
      return encode as EncoderFunction;
    }
    default:
      throw new Error(`Unsupported jSquash output format: ${mimeType}`);
  }
}

export async function decodePngBuffer(pngBuffer: ArrayBuffer): Promise<ImageData> {
  const decodePng = await resolveJsquashDecoder('image/png');
  return decodePng(pngBuffer);
}