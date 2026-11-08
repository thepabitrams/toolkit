export function createImageDataFromRgbaBytes(
  rgbaBytes: ArrayLike<number>,
  imageWidth: number,
  imageHeight: number
): ImageData {
  const clampedPixels = new Uint8ClampedArray(rgbaBytes.length);
  clampedPixels.set(rgbaBytes);
  return new ImageData(clampedPixels, imageWidth, imageHeight);
}