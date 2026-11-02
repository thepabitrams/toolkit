// src/tools/media/adjust-size/compression/compressProgressive.ts
import { loadImage } from '@/shared/lib/browser';
import {
  posterize,
  contrastReduce,
  brightnessAdjust,
  gaussianBlur,
  chromaSubsampling,
} from '../strategies';
import {
  BRIGHTNESS_ADJUSTMENTS,
  CONTRAST_REDUCTIONS,
  POSTERIZE_LEVELS,
  BLUR_RADII,
} from './compressionConfig';

export interface CompressionProgress {
  strategy: string;
  sizeKB: number;
  value?: number;
  names?: string;
  values?: number[];
  done?: boolean;
}

export interface CompressionStrategy {
  name: string;
  values: number[];
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([]));
    }, mimeType, quality);
  });
}

export async function compressProgressive(
  sourceBlob: Blob,
  targetSizeKB: number,
  outputMimeType: string,
  hasAlphaChannel: boolean,
  isLossyMimeType: boolean,
  onProgress?: (data: CompressionProgress) => void
): Promise<Blob> {
  const sourceImage = await loadImage(sourceBlob);
  const processingCanvas = document.createElement('canvas');
  processingCanvas.width = sourceImage.width;
  processingCanvas.height = sourceImage.height;
  
  const rawContext = processingCanvas.getContext('2d', { alpha: true });
  if (!rawContext) throw new Error('Failed to acquire 2D canvas context');
  const canvasContext: CanvasRenderingContext2D = rawContext;

  canvasContext.drawImage(sourceImage, 0, 0);
  const baseImageData = canvasContext.getImageData(0, 0, processingCanvas.width, processingCanvas.height);

  let smallestBlob: Blob = sourceBlob;
  let smallestSizeKB = sourceBlob.size / 1024;

  const activeStrategies: CompressionStrategy[] = [];

  if (isLossyMimeType && !hasAlphaChannel) {
    activeStrategies.push({ name: 'chroma', values: [1] });
  }
  if (!hasAlphaChannel) {
    activeStrategies.push({ name: 'blur', values: BLUR_RADII });
  }
  activeStrategies.push({ name: 'posterize', values: POSTERIZE_LEVELS });
  activeStrategies.push({ name: 'contrast', values: CONTRAST_REDUCTIONS });
  activeStrategies.push({ name: 'brightness', values: BRIGHTNESS_ADJUSTMENTS });

  async function applyStrategyToImageData(
    sourceImageData: ImageData,
    strategyName: string,
    parameterValue: number
  ): Promise<Blob> {
    const dataCopy = new Uint8ClampedArray(sourceImageData.data);
    const workingImageData = new ImageData(dataCopy, sourceImageData.width, sourceImageData.height);

    switch (strategyName) {
      case 'blur': 
        if (!hasAlphaChannel) gaussianBlur(workingImageData, parameterValue); 
        break;
      case 'posterize': 
        posterize(workingImageData, parameterValue); 
        break;
      case 'contrast': 
        contrastReduce(workingImageData, parameterValue); 
        break;
      case 'brightness': 
        brightnessAdjust(workingImageData, parameterValue); 
        break;
      case 'chroma': 
        chromaSubsampling(workingImageData, '4:2:0'); 
        break;
      default: 
        return sourceBlob;
    }

    canvasContext.putImageData(workingImageData, 0, 0);
    return canvasToBlob(processingCanvas, outputMimeType);
  }

  async function testSingleStrategy(
    strategy: CompressionStrategy,
    targetSize: number,
    progressCallback?: (data: CompressionProgress) => void
  ): Promise<{ resultBlob: Blob; isUnderTarget: boolean }> {
    const minimumValue = strategy.values[0];
    const minimumResultBlob = await applyStrategyToImageData(baseImageData, strategy.name, minimumValue);
    
    progressCallback?.({ 
      strategy: strategy.name, 
      value: minimumValue, 
      sizeKB: minimumResultBlob.size / 1024 
    });
    
    if (minimumResultBlob.size / 1024 <= targetSize) {
      return { resultBlob: minimumResultBlob, isUnderTarget: true };
    }

    const maximumValue = strategy.values[strategy.values.length - 1];
    const maximumResultBlob = await applyStrategyToImageData(baseImageData, strategy.name, maximumValue);
    
    progressCallback?.({ 
      strategy: strategy.name, 
      value: maximumValue, 
      sizeKB: maximumResultBlob.size / 1024 
    });

    return { resultBlob: maximumResultBlob, isUnderTarget: maximumResultBlob.size / 1024 <= targetSize };
  }

  async function testStrategyCombination(
    combinationStrategies: CompressionStrategy[],
    targetSize: number,
    progressCallback?: (data: CompressionProgress) => void
  ): Promise<Blob | null> {
    const valueCombinations = generateValueCombinations(combinationStrategies);
    
    for (const parameterValues of valueCombinations) {
      const workingImageData = new ImageData(
        new Uint8ClampedArray(baseImageData.data),
        baseImageData.width,
        baseImageData.height
      );

      for (let index = 0; index < combinationStrategies.length; index++) {
        const strategy = combinationStrategies[index];
        const parameterValue = parameterValues[index];
        
        switch (strategy.name) {
          case 'blur': if (!hasAlphaChannel) gaussianBlur(workingImageData, parameterValue); break;
          case 'posterize': posterize(workingImageData, parameterValue); break;
          case 'contrast': contrastReduce(workingImageData, parameterValue); break;
          case 'brightness': brightnessAdjust(workingImageData, parameterValue); break;
          case 'chroma': chromaSubsampling(workingImageData, '4:2:0'); break;
          default: break;
        }
      }

      canvasContext.putImageData(workingImageData, 0, 0);
      const processedBlob = await canvasToBlob(processingCanvas, outputMimeType);
      const currentSizeKB = processedBlob.size / 1024;
      
      progressCallback?.({
        strategy: 'combination',
        names: combinationStrategies.map(s => s.name).join('+'),
        values: parameterValues,
        sizeKB: currentSizeKB,
      });

      if (currentSizeKB <= targetSize) return processedBlob;
      
      if (processedBlob.size < smallestBlob.size) {
        smallestBlob = processedBlob;
        smallestSizeKB = currentSizeKB;
      }
    }
    return null;
  }

  for (const strategy of activeStrategies) {
    const { resultBlob, isUnderTarget } = await testSingleStrategy(strategy, targetSizeKB, onProgress);
    
    if (isUnderTarget) {
      onProgress?.({ strategy: strategy.name, sizeKB: resultBlob.size / 1024, done: true });
      return resultBlob;
    }
    
    if (resultBlob.size < smallestBlob.size) {
      smallestBlob = resultBlob;
      smallestSizeKB = resultBlob.size / 1024;
    }
  }

  for (let combinationSize = 2; combinationSize <= activeStrategies.length; combinationSize++) {
    const strategyCombinations = getStrategyCombinations(activeStrategies, combinationSize);
    
    for (const combination of strategyCombinations) {
      const resultBlob = await testStrategyCombination(combination, targetSizeKB, onProgress);
      
      if (resultBlob) {
        onProgress?.({
          strategy: 'combination',
          names: combination.map(s => s.name).join('+'),
          sizeKB: resultBlob.size / 1024,
          done: true,
        });
        return resultBlob;
      }
    }
  }

  const fallbackBlob = await applyFallbackCompression(smallestBlob, outputMimeType, isLossyMimeType);
  onProgress?.({ strategy: 'smallestPossible', sizeKB: fallbackBlob.size / 1024 });
  return fallbackBlob;
}

function generateValueCombinations(strategies: CompressionStrategy[]): number[][] {
  if (strategies.length === 0) return [];
  
  let combinations: number[][] = [[]];
  for (const strategy of strategies) {
    const newCombinations: number[][] = [];
    for (const combination of combinations) {
      for (const value of strategy.values) {
        newCombinations.push([...combination, value]);
      }
    }
    combinations = newCombinations;
  }
  return combinations;
}

function getStrategyCombinations(strategies: CompressionStrategy[], combinationSize: number): CompressionStrategy[][] {
  if (combinationSize === 0) return [[]];
  if (strategies.length === 0) return [];
  
  const result: CompressionStrategy[][] = [];
  const [firstStrategy, ...remainingStrategies] = strategies;
  const combinationsWithoutFirst = getStrategyCombinations(remainingStrategies, combinationSize);
  const combinationsWithFirst = getStrategyCombinations(remainingStrategies, combinationSize - 1).map(combo => [firstStrategy, ...combo]);
  
  return [...combinationsWithoutFirst, ...combinationsWithFirst];
}

async function applyFallbackCompression(
  sourceBlob: Blob, 
  outputMimeType: string, 
  isLossyMimeType: boolean
): Promise<Blob> {
  const sourceImage = await loadImage(sourceBlob);
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = sourceImage.width;
  fallbackCanvas.height = sourceImage.height;
  
  const rawContext = fallbackCanvas.getContext('2d', { alpha: true });
  if (!rawContext) throw new Error('Failed to acquire 2D canvas context');
  const canvasContext: CanvasRenderingContext2D = rawContext;

  canvasContext.drawImage(sourceImage, 0, 0);
  
  let fallbackImageData = canvasContext.getImageData(0, 0, fallbackCanvas.width, fallbackCanvas.height);
  fallbackImageData = posterize(fallbackImageData, 2);
  
  if (!isLossyMimeType) {
    fallbackImageData = brightnessAdjust(fallbackImageData, 50);
    fallbackImageData = contrastReduce(fallbackImageData, 0.35);
  }
  
  canvasContext.putImageData(fallbackImageData, 0, 0);
  
  return canvasToBlob(fallbackCanvas, outputMimeType, isLossyMimeType ? 0.0 : undefined);
}