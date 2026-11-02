// src/tools/media/adjust-size/strategies/chromaSubsampling.ts
export function chromaSubsampling(
  workingImageData: ImageData,
  subsamplingMode: '4:4:4' | '4:2:2' | '4:2:0' | '4:1:1'
): ImageData {
  const sourcePixelData = workingImageData.data;
  const imageWidth = workingImageData.width;
  const imageHeight = workingImageData.height;
  const outputPixelData = new Uint8ClampedArray(sourcePixelData);

  if (subsamplingMode === '4:4:4') {
    return workingImageData;
  }

  if (subsamplingMode === '4:2:2') {
    for (let rowY = 0; rowY < imageHeight; rowY++) {
      for (let columnX = 0; columnX < imageWidth; columnX += 2) {
        const pixel1Index = (rowY * imageWidth + columnX) * 4;
        const pixel2Index = (rowY * imageWidth + Math.min(columnX + 1, imageWidth - 1)) * 4;
        
        const averageRed = (sourcePixelData[pixel1Index] + sourcePixelData[pixel2Index]) / 2;
        const averageGreen = (sourcePixelData[pixel1Index + 1] + sourcePixelData[pixel2Index + 1]) / 2;
        const averageBlue = (sourcePixelData[pixel1Index + 2] + sourcePixelData[pixel2Index + 2]) / 2;
        
        outputPixelData[pixel1Index] = averageRed;
        outputPixelData[pixel1Index + 1] = averageGreen;
        outputPixelData[pixel1Index + 2] = averageBlue;
        outputPixelData[pixel2Index] = averageRed;
        outputPixelData[pixel2Index + 1] = averageGreen;
        outputPixelData[pixel2Index + 2] = averageBlue;
      }
    }
    return new ImageData(outputPixelData, imageWidth, imageHeight);
  }

  if (subsamplingMode === '4:2:0') {
    for (let rowY = 0; rowY < imageHeight; rowY += 2) {
      for (let columnX = 0; columnX < imageWidth; columnX += 2) {
        const pixel1Index = (rowY * imageWidth + columnX) * 4;
        const pixel2Index = (rowY * imageWidth + Math.min(columnX + 1, imageWidth - 1)) * 4;
        const pixel3Index = (Math.min(rowY + 1, imageHeight - 1) * imageWidth + columnX) * 4;
        const pixel4Index = (Math.min(rowY + 1, imageHeight - 1) * imageWidth + Math.min(columnX + 1, imageWidth - 1)) * 4;
        
        const averageRed = (sourcePixelData[pixel1Index] + sourcePixelData[pixel2Index] + sourcePixelData[pixel3Index] + sourcePixelData[pixel4Index]) / 4;
        const averageGreen = (sourcePixelData[pixel1Index + 1] + sourcePixelData[pixel2Index + 1] + sourcePixelData[pixel3Index + 1] + sourcePixelData[pixel4Index + 1]) / 4;
        const averageBlue = (sourcePixelData[pixel1Index + 2] + sourcePixelData[pixel2Index + 2] + sourcePixelData[pixel3Index + 2] + sourcePixelData[pixel4Index + 2]) / 4;
        
        outputPixelData[pixel1Index] = averageRed;
        outputPixelData[pixel1Index + 1] = averageGreen;
        outputPixelData[pixel1Index + 2] = averageBlue;
        outputPixelData[pixel2Index] = averageRed;
        outputPixelData[pixel2Index + 1] = averageGreen;
        outputPixelData[pixel2Index + 2] = averageBlue;
        outputPixelData[pixel3Index] = averageRed;
        outputPixelData[pixel3Index + 1] = averageGreen;
        outputPixelData[pixel3Index + 2] = averageBlue;
        outputPixelData[pixel4Index] = averageRed;
        outputPixelData[pixel4Index + 1] = averageGreen;
        outputPixelData[pixel4Index + 2] = averageBlue;
      }
    }
    return new ImageData(outputPixelData, imageWidth, imageHeight);
  }

  if (subsamplingMode === '4:1:1') {
    for (let rowY = 0; rowY < imageHeight; rowY++) {
      for (let columnX = 0; columnX < imageWidth; columnX += 4) {
        const pixelIndices: number[] = [];
        
        for (let offset = 0; offset < 4; offset++) {
          const sampleX = Math.min(columnX + offset, imageWidth - 1);
          pixelIndices.push((rowY * imageWidth + sampleX) * 4);
        }
        
        let sumRed = 0;
        let sumGreen = 0;
        let sumBlue = 0;
        
        for (const pixelIndex of pixelIndices) {
          sumRed += sourcePixelData[pixelIndex];
          sumGreen += sourcePixelData[pixelIndex + 1];
          sumBlue += sourcePixelData[pixelIndex + 2];
        }
        
        const averageRed = sumRed / pixelIndices.length;
        const averageGreen = sumGreen / pixelIndices.length;
        const averageBlue = sumBlue / pixelIndices.length;
        
        for (const pixelIndex of pixelIndices) {
          outputPixelData[pixelIndex] = averageRed;
          outputPixelData[pixelIndex + 1] = averageGreen;
          outputPixelData[pixelIndex + 2] = averageBlue;
        }
      }
    }
    return new ImageData(outputPixelData, imageWidth, imageHeight);
  }

  return workingImageData;
}