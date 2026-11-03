// src/tools/media/image-filters/core/types.ts
export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
  blur: number;
  highlights: number;
  shadows: number;
  hue: number;
  exposure: number;
  posterize: number;
  invert: number;
  grayscale: boolean;
  sepia: boolean;
  vintage: boolean;
  noir: boolean;
  vignette: boolean;
  hdr: boolean;
  clarendon: boolean;
  moon: boolean;
  cyberpunk: boolean;
}

export type FilterKey = keyof FilterState;