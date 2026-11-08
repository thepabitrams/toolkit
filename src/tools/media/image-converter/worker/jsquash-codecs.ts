// src/tools/media/image-converter/worker/jsquash-codecs.ts
import type { DecoderFunction, EncoderFunction } from './types';

import JPEG_DEC_WASM from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url';
import JPEG_ENC_WASM from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import PNG_WASM from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm?url';
import WEBP_DEC_WASM from '@jsquash/webp/codec/dec/webp_dec.wasm?url';
import WEBP_ENC_WASM from '@jsquash/webp/codec/enc/webp_enc.wasm?url';
import AVIF_DEC_WASM from '@jsquash/avif/codec/dec/avif_dec.wasm?url';
import AVIF_ENC_WASM from '@jsquash/avif/codec/enc/avif_enc.wasm?url';
import JXL_DEC_WASM from '@jsquash/jxl/codec/dec/jxl_dec.wasm?url';
import JXL_ENC_WASM from '@jsquash/jxl/codec/enc/jxl_enc.wasm?url';

const codecInitializationPromises = new Map<string, Promise<void>>();

async function initializeJsquashCodec(mimeType: string): Promise<void> {
  if (codecInitializationPromises.has(mimeType)) {
    return codecInitializationPromises.get(mimeType)!;
  }

  const initPromise = (async (): Promise<void> => {
    switch (mimeType) {
      case 'image/jpeg': {
        const { init: initDecode } = await import('@jsquash/jpeg/decode');
        const { init: initEncode } = await import('@jsquash/jpeg/encode');
        await Promise.all([
          initDecode({ locateFile: () => JPEG_DEC_WASM }),
          initEncode({ locateFile: () => JPEG_ENC_WASM }),
        ]);
        break;
      }
      case 'image/png': {
        const { init: initDecode } = await import('@jsquash/png/decode');
        const { init: initEncode } = await import('@jsquash/png/encode');
        await Promise.all([
          initDecode({ locateFile: () => PNG_WASM }),
          initEncode({ locateFile: () => PNG_WASM }),
        ]);
        break;
      }
      case 'image/webp': {
        const { init: initDecode } = await import('@jsquash/webp/decode');
        const { init: initEncode } = await import('@jsquash/webp/encode');
        await Promise.all([
          initDecode({ locateFile: () => WEBP_DEC_WASM }),
          initEncode({ locateFile: () => WEBP_ENC_WASM }),
        ]);
        break;
      }
      case 'image/avif': {
        const { init: initDecode } = await import('@jsquash/avif/decode');
        const { init: initEncode } = await import('@jsquash/avif/encode');
        await Promise.all([
          initDecode({ locateFile: () => AVIF_DEC_WASM }),
          initEncode({ locateFile: () => AVIF_ENC_WASM }),
        ]);
        break;
      }
      case 'image/jxl': {
        const { init: initDecode } = await import('@jsquash/jxl/decode');
        const { init: initEncode } = await import('@jsquash/jxl/encode');
        await Promise.all([
          initDecode({ locateFile: () => JXL_DEC_WASM }),
          initEncode({ locateFile: () => JXL_ENC_WASM }),
        ]);
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