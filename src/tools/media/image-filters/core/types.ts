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
  grayscale: boolean;
  sepia: boolean;
  vintage: boolean;
  noir: boolean;
  vignette: boolean;
  hdr: boolean;
}

export type FilterKey = keyof FilterState;