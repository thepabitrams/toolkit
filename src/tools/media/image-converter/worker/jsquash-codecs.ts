// src/tools/media/image-converter/worker/jsquash-codecs.ts
import type { DecoderFunction, EncoderFunction } from './types';

const codecInitializationPromises = new Map<string, Promise<void>>();

async function initializeJsquashCodec(mimeType: string): Promise<void> {
  if (codecInitializationPromises.has(mimeType)) {
    return codecInitializationPromises.get(mimeType)!;
  }

  const initPromise = (async (): Promise<void> => {
    const originalFetch = globalThis.fetch;
    
    globalThis.fetch = async (input, init) => {
      let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      if (url.includes('.wasm')) {
        const filename = url.split('/').pop()?.split('?')[0] || '';
        return originalFetch(`/wasm/jsquash/${filename}`, init);
      }
      return originalFetch(input, init);
    };

    try {
      switch (mimeType) {
        case 'image/jpeg': {
          const { init: initDecode } = await import('@jsquash/jpeg/decode');
          const { init: initEncode } = await import('@jsquash/jpeg/encode');
          await Promise.all([initDecode(), initEncode()]);
          break;
        }
        case 'image/png': {
          const { init: initDecode } = await import('@jsquash/png/decode');
          const { init: initEncode } = await import('@jsquash/png/encode');
          await Promise.all([initDecode(), initEncode()]);
          break;
        }
        case 'image/webp': {
          const { init: initDecode } = await import('@jsquash/webp/decode');
          const { init: initEncode } = await import('@jsquash/webp/encode');
          await Promise.all([initDecode(), initEncode()]);
          break;
        }
        case 'image/avif': {
          const { init: initDecode } = await import('@jsquash/avif/decode');
          const { init: initEncode } = await import('@jsquash/avif/encode');
          await Promise.all([initDecode(), initEncode()]);
          break;
        }
        case 'image/jxl': {
          const { init: initDecode } = await import('@jsquash/jxl/decode');
          const { init: initEncode } = await import('@jsquash/jxl/encode');
          await Promise.all([initDecode(), initEncode()]);
          break;
        }
        default:
          return;
      }
    } finally {
      globalThis.fetch = originalFetch;
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
    case 'image/avif': {
      const { default: decode } = await import('@jsquash/avif/decode');
      return decode as DecoderFunction;
    }
    case 'image/jxl': {
      const { default: decode } = await import('@jsquash/jxl/decode');
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
    case 'image/avif': {
      const { default: encode } = await import('@jsquash/avif/encode');
      return encode as EncoderFunction;
    }
    case 'image/jxl': {
      const { default: encode } = await import('@jsquash/jxl/encode');
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