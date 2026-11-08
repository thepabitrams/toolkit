import type { DecoderFunction, EncoderFunction } from './types';

const codecInitializationPromises = new Map<string, Promise<void>>();

async function fetchWasmBuffer(filename: string): Promise<ArrayBuffer> {
  const response = await fetch(`/wasm/jsquash/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch WASM: ${filename} (Status: ${response.status})`);
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
        const { init: initDecode } = await import('@jsquash/jpeg/decode');
        const { init: initEncode } = await import('@jsquash/jpeg/encode');
        const [decBuffer, encBuffer] = await Promise.all([
          fetchWasmBuffer('mozjpeg_dec.wasm'),
          fetchWasmBuffer('mozjpeg_enc.wasm'),
        ]);
        await Promise.all([
          initDecode({ wasmBinary: decBuffer }),
          initEncode({ wasmBinary: encBuffer }),
        ]);
        break;
      }
      case 'image/png': {
        const { init: initDecode } = await import('@jsquash/png/decode');
        const { init: initEncode } = await import('@jsquash/png/encode');
        const pngBuffer = await fetchWasmBuffer('squoosh_png_bg.wasm');
        await Promise.all([
          initDecode({ wasmBinary: pngBuffer }),
          initEncode({ wasmBinary: pngBuffer }),
        ]);
        break;
      }
      case 'image/webp': {
        const { init: initDecode } = await import('@jsquash/webp/decode');
        const { init: initEncode } = await import('@jsquash/webp/encode');
        const [decBuffer, encBuffer] = await Promise.all([
          fetchWasmBuffer('webp_dec.wasm'),
          fetchWasmBuffer('webp_enc.wasm'),
        ]);
        await Promise.all([
          initDecode({ wasmBinary: decBuffer }),
          initEncode({ wasmBinary: encBuffer }),
        ]);
        break;
      }
      case 'image/avif': {
        const { init: initDecode } = await import('@jsquash/avif/decode');
        const { init: initEncode } = await import('@jsquash/avif/encode');
        const [decBuffer, encBuffer] = await Promise.all([
          fetchWasmBuffer('avif_dec.wasm'),
          fetchWasmBuffer('avif_enc.wasm'),
        ]);
        await Promise.all([
          initDecode({ wasmBinary: decBuffer }),
          initEncode({ wasmBinary: encBuffer }),
        ]);
        break;
      }
      case 'image/jxl': {
        const { init: initDecode } = await import('@jsquash/jxl/decode');
        const { init: initEncode } = await import('@jsquash/jxl/encode');
        const [decBuffer, encBuffer] = await Promise.all([
          fetchWasmBuffer('jxl_dec.wasm'),
          fetchWasmBuffer('jxl_enc.wasm'),
        ]);
        await Promise.all([
          initDecode({ wasmBinary: decBuffer }),
          initEncode({ wasmBinary: encBuffer }),
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