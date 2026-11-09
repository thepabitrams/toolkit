// src/tools/media/image-converter/worker/imagescript-codecs.ts
import { Image } from 'imagescript';

export async function decodeWithImagescript(sourceBuffer: ArrayBuffer): Promise<ImageData> {
  const decodedImage = await Image.decode(sourceBuffer);
  return new ImageData(
    new Uint8ClampedArray(decodedImage.bitmap),
    decodedImage.width,
    decodedImage.height
  );
}

export async function encodeWithImagescript(
  mimeType: string,
  sourceImageData: ImageData,
  outputQuality: number
): Promise<ArrayBuffer> {
  const image = new Image(sourceImageData.width, sourceImageData.height);
  image.bitmap = sourceImageData.data;

  if (mimeType === 'image/avif') {
    const encodedBuffer = await image.encodeAVIF({ quality: outputQuality });
    return encodedBuffer.buffer as ArrayBuffer;
  }

  if (mimeType === 'image/jxl') {
    const encodedBuffer = await image.encodeJXL({ quality: outputQuality });
    return encodedBuffer.buffer as ArrayBuffer;
  }

  throw new Error(`Unsupported imagescript format: ${mimeType}`);
}