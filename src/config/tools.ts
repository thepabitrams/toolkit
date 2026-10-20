export interface ToolConfig {
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  category: 'media' | 'productivity' | 'finance';
  component: () => Promise<any>;
}

export const tools: ToolConfig[] = [
  // We will uncomment this in Phase 2 when we move the precision-crop folder!
  // {
  //   slug: 'precision-crop',
  //   name: 'Precision Crop',
  //   seoTitle: 'Precision Crop Image Online — Free & Private',
  //   seoDescription: 'Crop images with pixel-perfect precision in your browser.',
  //   category: 'media',
  //   component: () => import('../tools/media/precision-crop/index.tsx'),
  // },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}