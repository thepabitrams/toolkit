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