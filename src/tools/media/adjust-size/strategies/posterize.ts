// src/tools/media/adjust-size/strategies/posterize.ts
export function posterize(
  workingImageData: ImageData, 
  colorLevels: number
): ImageData {
  const pixelData = workingImageData.data;
  const quantizationStep = 255 / (colorLevels - 1);
  
  for (let pixelIndex = 0; pixelIndex < pixelData.length; pixelIndex += 4) {
    pixelData[pixelIndex] = Math.round(pixelData[pixelIndex] / quantizationStep) * quantizationStep;
    pixelData[pixelIndex + 1] = Math.round(pixelData[pixelIndex + 1] / quantizationStep) * quantizationStep;
    pixelData[pixelIndex + 2] = Math.round(pixelData[pixelIndex + 2] / quantizationStep) * quantizationStep;
  }
  
  return workingImageData;
}