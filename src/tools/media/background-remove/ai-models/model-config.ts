// src/tools/media/background-remove/ai-models/model-config.ts

export interface AIModelConfiguration {
  identifier: string;
  displayName: string;
  huggingFacePath: string;
  dataType: 'q8' | 'fp16' | 'fp32';
}

export const AVAILABLE_AI_MODELS: AIModelConfiguration[] = [
  { 
    identifier: 'birefnet', 
    displayName: 'BiRefNet', 
    huggingFacePath: 'onnx-community/BiRefNet_512x512-ONNX', 
    dataType: 'fp16' 
  },
  { 
    identifier: 'isnet', 
    displayName: 'ISNet', 
    huggingFacePath: 'onnx-community/ISNet-ONNX', 
    dataType: 'fp32' 
  },
  { 
    identifier: 'modnet', 
    displayName: 'MODNet', 
    huggingFacePath: 'Xenova/modnet', 
    dataType: 'q8' 
  },
  { 
    identifier: 'ormbg', 
    displayName: 'ORMBG', 
    huggingFacePath: 'onnx-community/ormbg-ONNX', 
    dataType: 'q8' 
  },
  { 
    identifier: 'mvanet', 
    displayName: 'MVANet', 
    huggingFacePath: 'onnx-community/MVANet-ONNX', 
    dataType: 'fp32' 
  },
];