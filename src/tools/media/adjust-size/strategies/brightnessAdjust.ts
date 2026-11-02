// src/tools/media/adjust-size/strategies/brightnessAdjust.ts
export function brightnessAdjust(
  workingImageData: ImageData, 
  adjustmentAmount: number
): ImageData {
  const pixelData = workingImageData.data;
  
  for (let pixelIndex = 0; pixelIndex < pixelData.length; pixelIndex += 4) {
    pixelData[pixelIndex] = Math.max(0, pixelData[pixelIndex] - adjustmentAmount);
    pixelData[pixelIndex + 1] = Math.max(0, pixelData[pixelIndex + 1] - adjustmentAmount);
    pixelData[pixelIndex + 2] = Math.max(0, pixelData[pixelIndex + 2] - adjustmentAmount);
  }
  
  return workingImageData;
}