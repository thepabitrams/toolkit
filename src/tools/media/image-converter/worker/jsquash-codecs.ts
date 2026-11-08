import type { DecoderFunction, EncoderFunction } from './types';

const codecInitializationPromises = new Map<string, Promise<void>>();

async function fetchWasmBuffer(filename: string): Promise<ArrayBuffer> {
  const response = await fetch(`/wasm/jsquash/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to download WASM file: /wasm/jsquash/${filename}`);
  }
  return response.arrayBuffer();
}

async function initializeJsquashCodec(mimeType: string): Promise<void> {
  if (codecInitializationPromises.has(mimeType)) {
    return codecInitializationPromises.get(mimeType)!;
  }

  const initPromise = (async (): Promise<void> => {
    let decFilename = '';
    let encFilename = '';

    switch (mimeType) {
      case 'image/jpeg':
        decFilename = 'mozjpeg_dec.wasm';
        encFilename = 'mozjpeg_enc.wasm';
        break;
      case 'image/png':
        decFilename = 'squoosh_png_bg.wasm';
        encFilename = 'squoosh_png_bg.wasm';
        break;
      case 'image/webp':
        decFilename = 'webp_dec.wasm';
        encFilename = 'webp_enc.wasm';
        break;
      case 'image/avif':
        decFilename = 'avif_dec.wasm';
        encFilename = 'avif_enc.wasm';
        break;
      case 'image/jxl':
        decFilename = 'jxl_dec.wasm';
        encFilename = 'jxl_enc.wasm';
        break;
      default:
        return;
    }

    const [decBuffer, encBuffer] = await Promise.all([
      fetchWasmBuffer(decFilename),
      fetchWasmBuffer(encFilename),
    ]);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith(decFilename)) {
        return new Response(decBuffer, { headers: { 'Content-Type': 'application/wasm' } });
      }
      if (url.endsWith(encFilename)) {
        return new Response(encBuffer, { headers: { 'Content-Type': 'application/wasm' } });
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