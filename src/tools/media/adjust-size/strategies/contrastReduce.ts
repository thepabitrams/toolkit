// src/tools/media/adjust-size/strategies/contrastReduce.ts
export function contrastReduce(
  workingImageData: ImageData, 
  contrastFactor: number
): ImageData {
  const pixelData = workingImageData.data;
  
  for (let pixelIndex = 0; pixelIndex < pixelData.length; pixelIndex += 4) {
    pixelData[pixelIndex] = 128 + (pixelData[pixelIndex] - 128) * contrastFactor;
    pixelData[pixelIndex + 1] = 128 + (pixelData[pixelIndex + 1] - 128) * contrastFactor;
    pixelData[pixelIndex + 2] = 128 + (pixelData[pixelIndex + 2] - 128) * contrastFactor;
  }
  
  return workingImageData;
}