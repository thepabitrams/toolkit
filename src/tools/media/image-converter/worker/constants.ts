export const MAXIMUM_ICO_DIMENSION = 256;
export const RGBA_CHANNEL_COUNT = 4;
export const SVG_RENDER_WIDTH = 1024;
export const EPS_RENDER_WIDTH = 612;
export const EPS_RENDER_HEIGHT = 792;
export const EPS_RENDER_DPI = 144;

export const SVG_MIME_TYPE = 'image/svg+xml';

export const HEIC_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/heic',
  'image/heif',
]);

export const EPS_MIME_TYPES: ReadonlySet<string> = new Set([
  'application/postscript',
  'image/eps',
]);

export const IMAGE_IN_BROWSER_INPUT_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/bmp',
  'image/gif',
  'image/ico',
  'image/tga',
  'image/tiff',
  'image/psd',
]);

export const IMAGE_IN_BROWSER_OUTPUT_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/bmp',
  'image/gif',
  'image/ico',
  'image/tga',
  'image/tiff',
]);

export const PREVIEW_REQUIRED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/tiff',
  'image/tga',
  'image/jxl',
]);