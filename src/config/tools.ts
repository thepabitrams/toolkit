// src/config/tools.ts

export type ToolCategory = 'media' | 'productivity' | 'finance' | 'personalisation';

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
    seoTitle: 'Crop Images Online - Pixel Perfect & Private',
    seoDescription: 'Crop JPG, PNG, and WebP images with exact pixel precision directly in your browser. Adjust dimensions, crop freely, and download instantly. 100% private.',
    category: 'media',
    component: () => import('@/tools/media/precision-crop'),
  },

  {
    slug: 'adjust-size',
    displayName: 'Adjust Size',
    displayDescription: 'Compress or pad an image to fit within a specific file size range.',
    seoTitle: 'Compress Image to Exact KB Size - 100% Private',
    seoDescription: 'Compress or pad JPG, PNG, WebP, and AVIF images to an exact KB target. Runs entirely in your browser with no server uploads. Fast, secure, and private.',
    category: 'media',
    component: () => import('@/tools/media/adjust-size'),
  },

  {
    slug: 'add-text',
    displayName: 'Add Text',
    displayDescription: 'Overlay custom text, fonts, and colors onto your images locally.',
    seoTitle: 'Add Text to Image Online - Custom Fonts & Colors',
    seoDescription: 'Easily add text, custom fonts, and colors to your images. Overlay text locally in your browser with no uploads. Adjust opacity, size, and background.',
    category: 'media',
    component: () => import('@/tools/media/add-text'),
  },

  {
    slug: 'flip-rotate',
    displayName: 'Rotate & Flip',
    displayDescription: 'Rotate or flip images locally with zero quality loss.',
    seoTitle: 'Rotate & Flip Images Online - Zero Quality Loss',
    seoDescription: 'Rotate images 90 degrees or flip them horizontally and vertically. Process JPG, PNG, and WebP locally in your browser with zero quality loss. 100% private.',
    category: 'media',
    component: () => import('@/tools/media/flip-rotate'),
  },

  {
    slug: 'image-filters',
    displayName: 'Image Filters',
    displayDescription: 'Apply professional lighting, color, and effect filters to your images.',
    seoTitle: 'Apply Image Filters Online - Brightness & Effects',
    seoDescription: 'Apply professional filters to your images. Adjust brightness, contrast, saturation, blur, and vintage effects locally. No uploads, completely private.',
    category: 'media',
    component: () => import('@/tools/media/image-filters'),
  },

  {
    slug: 'background-remove',
    displayName: 'Background Remover',
    displayDescription: 'Remove image backgrounds automatically using AI, 100% locally.',
    seoTitle: 'Remove Image Background with AI - 100% Private',
    seoDescription: 'Remove backgrounds from images automatically using local AI models. No uploads, no servers, completely private. Works instantly right on your device.',
    category: 'media',
    component: () => import('@/tools/media/background-remove'),
  },

  {
    slug: 'wallpaper',
    displayName: 'Wallpaper',
    displayDescription: 'Create solid color wallpapers in any size and format.',
    seoTitle: 'Solid Color Wallpaper Generator - Any Size & Format',
    seoDescription: 'Create custom solid color wallpapers for mobile and desktop. Choose any color, size, and format (PNG, JPG, WEBP). Runs locally in your browser.',
    category: 'personalisation',
    component: () => import('@/tools/personalisation/wallpaper'),
  },

  {
    slug: 'infinite-type',
    displayName: 'Infinite Type',
    displayDescription: 'Endless typing drill with custom character pool.',
    seoTitle: 'Infinite Typing Practice - Custom Character Drill',
    seoDescription: 'Practice typing infinitely with custom character pools. Generate endless text drills and track your CPM, accuracy, and errors locally in your browser.',
    category: 'productivity',
    component: () => import('@/tools/productivity/infinite-type'),
  },

  {
    slug: 'bill-splitter',
    displayName: 'Bill Splitter',
    displayDescription: 'Split bills and group expenses fairly with friends — no signup required.',
    seoTitle: 'Split Bills & Group Expenses Fairly - Free & Private',
    seoDescription: 'Split bills and group expenses fairly with friends. Track who owes what, minimize transactions, and settle up instantly. No signup, 100% private.',
    category: 'finance',
    component: () => import('@/tools/finance/bill-splitter'),
  },

  {
    slug: 'bulletin-board',
    displayName: 'Bulletin Board',
    displayDescription: 'Daily task board with priorities, recurring check-ins, and notes.',
    seoTitle: 'Bulletin Board — Daily Task Tracker',
    seoDescription: 'Organize daily tasks with priorities, recurring check-ins, and notes. Track permanent or temporary tasks locally in your browser. 100% private.',
    category: 'productivity',
    component: () => import('@/tools/productivity/bulletin-board'),
  },

  {
    slug: 'image-converter',
    displayName: 'Image Converter',
    displayDescription: 'Convert images between JPG, PNG, WebP, AVIF, JXL, and HEIC locally.',
    seoTitle: 'Convert Images Online - JPG, PNG, WebP, AVIF, JXL',
    seoDescription: 'Convert JPG, PNG, WebP, AVIF, JXL, and HEIC images directly in your browser. HEIC support, batch-ready, 100% private. No uploads, no servers.',
    category: 'media',
    component: () => import('@/tools/media/image-converter'),
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