// src/tools/media/adjust-size/strategies/gaussianBlur.ts
export function gaussianBlur(
  workingImageData: ImageData, 
  blurRadius: number
): ImageData {
  const imageWidth = workingImageData.width;
  const imageHeight = workingImageData.height;
  const sourcePixelData = workingImageData.data;
  const outputPixelData = new Uint8ClampedArray(sourcePixelData);

  const kernelSize = Math.max(3, Math.ceil(blurRadius * 2.5));
  const gaussianKernel = new Float32Array(kernelSize);
  let kernelWeightSum = 0;
  const standardDeviation = blurRadius / 2;
  
  for (let index = 0; index < kernelSize; index++) {
    const offsetFromCenter = index - (kernelSize - 1) / 2;
    gaussianKernel[index] = Math.exp(-(offsetFromCenter * offsetFromCenter) / (2 * standardDeviation * standardDeviation));
    kernelWeightSum += gaussianKernel[index];
  }
  
  for (let index = 0; index < kernelSize; index++) {
    gaussianKernel[index] /= kernelWeightSum;
  }

  const halfKernelSize = Math.floor(kernelSize / 2);
  const temporaryPixelData = new Uint8ClampedArray(sourcePixelData);

  const applyHorizontalBlur = (): void => {
    for (let rowY = 0; rowY < imageHeight; rowY++) {
      for (let columnX = 0; columnX < imageWidth; columnX++) {
        let redSum = 0;
        let greenSum = 0;
        let blueSum = 0;
        
        for (let kernelIndex = 0; kernelIndex < kernelSize; kernelIndex++) {
          const sampleX = Math.min(imageWidth - 1, Math.max(0, columnX + kernelIndex - halfKernelSize));
          const pixelIndex = (rowY * imageWidth + sampleX) * 4;
          const kernelWeight = gaussianKernel[kernelIndex];
          
          redSum += temporaryPixelData[pixelIndex] * kernelWeight;
          greenSum += temporaryPixelData[pixelIndex + 1] * kernelWeight;
          blueSum += temporaryPixelData[pixelIndex + 2] * kernelWeight;
        }
        
        const outputIndex = (rowY * imageWidth + columnX) * 4;
        outputPixelData[outputIndex] = redSum;
        outputPixelData[outputIndex + 1] = greenSum;
        outputPixelData[outputIndex + 2] = blueSum;
      }
    }
  };

  applyHorizontalBlur();
  temporaryPixelData.set(outputPixelData);

  const applyVerticalBlur = (): void => {
    for (let rowY = 0; rowY < imageHeight; rowY++) {
      for (let columnX = 0; columnX < imageWidth; columnX++) {
        let redSum = 0;
        let greenSum = 0;
        let blueSum = 0;
        
        for (let kernelIndex = 0; kernelIndex < kernelSize; kernelIndex++) {
          const sampleY = Math.min(imageHeight - 1, Math.max(0, rowY + kernelIndex - halfKernelSize));
          const pixelIndex = (sampleY * imageWidth + columnX) * 4;
          const kernelWeight = gaussianKernel[kernelIndex];
          
          redSum += temporaryPixelData[pixelIndex] * kernelWeight;
          greenSum += temporaryPixelData[pixelIndex + 1] * kernelWeight;
          blueSum += temporaryPixelData[pixelIndex + 2] * kernelWeight;
        }
        
        const outputIndex = (rowY * imageWidth + columnX) * 4;
        outputPixelData[outputIndex] = redSum;
        outputPixelData[outputIndex + 1] = greenSum;
        outputPixelData[outputIndex + 2] = blueSum;
      }
    }
  };

  applyVerticalBlur();

  return new ImageData(outputPixelData, imageWidth, imageHeight);
}