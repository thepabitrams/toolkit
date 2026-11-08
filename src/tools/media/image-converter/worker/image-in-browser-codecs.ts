import type { MemoryImage } from 'image-in-browser';
import { MAXIMUM_ICO_DIMENSION, RGBA_CHANNEL_COUNT } from './constants';
import { copyBytesToArrayBuffer } from './buffer-utils';
import { createImageDataFromRgbaBytes } from './image-data-utils';

async function createImageDataFromMemoryImage(memoryImage: MemoryImage): Promise<ImageData> {
  const { Format } = await import('image-in-browser');
  const rgbaMemoryImage = memoryImage.convert({
    format: Format.uint8,
    numChannels: RGBA_CHANNEL_COUNT,
  });
  return createImageDataFromRgbaBytes(
    rgbaMemoryImage.getBytes(),
    rgbaMemoryImage.width,
    rgbaMemoryImage.height
  );
}

async function createMemoryImageFromImageData(sourceImageData: ImageData): Promise<MemoryImage> {
  const { MemoryImage: MemoryImageClass } = await import('image-in-browser');
  const pixelBytes = new Uint8Array(
    sourceImageData.data.buffer,
    sourceImageData.data.byteOffset,
    sourceImageData.data.byteLength
  );
  return MemoryImageClass.fromBytes({
    width: sourceImageData.width,
    height: sourceImageData.height,
    bytes: copyBytesToArrayBuffer(pixelBytes),
    numChannels: RGBA_CHANNEL_COUNT,
  });
}

async function fitMemoryImageWithinIcoLimit(memoryImage: MemoryImage): Promise<MemoryImage> {
  const largestDimension = Math.max(memoryImage.width, memoryImage.height);
  if (largestDimension <= MAXIMUM_ICO_DIMENSION) return memoryImage;

  const { Transform, Interpolation } = await import('image-in-browser');
  const scaleFactor = MAXIMUM_ICO_DIMENSION / largestDimension;
  return Transform.copyResize({
    image: memoryImage,
    width: Math.max(1, Math.round(memoryImage.width * scaleFactor)),
    height: Math.max(1, Math.round(memoryImage.height * scaleFactor)),
    interpolation: Interpolation.average,
  });
}

export async function decodeWithImageInBrowser(
  mimeType: string,
  sourceBuffer: ArrayBuffer
): Promise<ImageData> {
  const {
    decodeBmp,
    decodeGif,
    decodeIco,
    decodeTga,
    decodeTiff,
    decodePsd,
  } = await import('image-in-browser');
  const decodePayload = { data: new Uint8Array(sourceBuffer) };
  let decodedMemoryImage: MemoryImage | undefined | null;

  switch (mimeType) {
    case 'image/bmp':
      decodedMemoryImage = decodeBmp(decodePayload);
      break;
    case 'image/gif':
      decodedMemoryImage = decodeGif(decodePayload);
      break;
    case 'image/ico':
      decodedMemoryImage = decodeIco(decodePayload);
      break;
    case 'image/tga':
      decodedMemoryImage = decodeTga(decodePayload);
      break;
    case 'image/tiff':
      decodedMemoryImage = decodeTiff(decodePayload);
      break;
    case 'image/psd':
      decodedMemoryImage = decodePsd(decodePayload);
      break;
    default:
      throw new Error(`Unsupported image-in-browser input format: ${mimeType}`);
  }

  if (!decodedMemoryImage) throw new Error(`Failed to decode ${mimeType}`);
  return createImageDataFromMemoryImage(decodedMemoryImage);
}

export async function encodeWithImageInBrowser(
  mimeType: string,
  sourceImageData: ImageData
): Promise<ArrayBuffer> {
  const {
    encodeBmp,
    encodeGif,
    encodeIco,
    encodeTga,
    encodeTiff,
  } = await import('image-in-browser');
  const sourceMemoryImage = await createMemoryImageFromImageData(sourceImageData);
  let encodedBytes: Uint8Array | undefined | null;

  switch (mimeType) {
    case 'image/bmp':
      encodedBytes = encodeBmp({ image: sourceMemoryImage });
      break;
    case 'image/gif':
      encodedBytes = encodeGif({ image: sourceMemoryImage });
      break;
    case 'image/ico': {
      const icoCompatibleImage = await fitMemoryImageWithinIcoLimit(sourceMemoryImage);
      encodedBytes = encodeIco({ image: icoCompatibleImage });
      break;
    }
    case 'image/tga':
      encodedBytes = encodeTga({ image: sourceMemoryImage });
      break;
    case 'image/tiff':
      encodedBytes = encodeTiff({ image: sourceMemoryImage });
      break;
    default:
      throw new Error(`Unsupported image-in-browser output format: ${mimeType}`);
  }

  if (!encodedBytes) throw new Error(`Failed to encode ${mimeType}`);
  return copyBytesToArrayBuffer(encodedBytes);
}