export type ToolCategory = 'media' | 'productivity' | 'finance';

export interface ToolConfig {
  slug: string;
  displayName: string;
  displayDescription: string;
  seoTitle: string;
  seoDescription: string;
  category: ToolCategory;
  component: () => Promise<{ default: React.ComponentType<any> }>;
}

export const tools: ToolConfig[] = [
  {
    slug: 'precision-crop',
    displayName: 'Precision Crop',
    displayDescription: 'Crop images with pixel-perfect precision in your browser.',
    seoTitle: 'Free Precision Image Cropper Online - 100% Private',
    seoDescription: 'Crop JPG, PNG, and WebP images with exact pixel dimensions directly in your browser. No uploads, no servers, completely private.',
    category: 'media',
    component: () => import('@/tools/media/precision-crop'),
  },

  {
    slug: 'adjust-size',
    displayName: 'Adjust Size',
    displayDescription: 'Compress or pad an image to fit within a specific file size range, 100% in your browser.',
    seoTitle: 'Free Image Size Adjuster - 100% Private | Toolkit',
    seoDescription: 'Compress JPG, PNG, WebP, AVIF, GIF, and BMP images to a target KB size. Runs entirely in your browser.',
    category: 'media',
    component: () => import('@/tools/media/adjust-size'),
  },

  {
    slug: 'add-text',
    displayName: 'Add Text',
    displayDescription: 'Overlay custom text, fonts, and colors onto your images locally.',
    seoTitle: 'Free Image Text Editor - 100% Private | Toolkit',
    seoDescription: 'Add text to your images directly in the browser. Custom fonts, colors, and opacity with no server uploads.',
    category: 'media',
    component: () => import('@/tools/media/add-text'),
  },

  {
    slug: 'flip-rotate',
    displayName: 'Rotate & Flip',
    displayDescription: 'Rotate or flip images locally with zero quality loss.',
    seoTitle: 'Free Image Rotator & Flipper - 100% Private | Toolkit',
    seoDescription: 'Rotate 90 degrees or flip JPG, PNG, and WebP images in your browser. No uploads required.',
    category: 'media',
    component: () => import('@/tools/media/flip-rotate'),
  },
];

export const toolsBySlug: Record<string, ToolConfig> = Object.fromEntries(
  tools.map((toolItem) => [toolItem.slug, toolItem])
);

export function getTool(slug: string): ToolConfig {
  const matchingTool = toolsBySlug[slug];
  if (!matchingTool) {
    throw new Error(`Unknown tool slug: "${slug}". Add it to src/config/tools.ts.`);
  }
  return matchingTool;
}