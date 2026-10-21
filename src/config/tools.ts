// src/config/tools.ts

export type ToolCategory = 'media' | 'productivity' | 'finance';

export interface ToolConfig {
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  category: ToolCategory;
  icon?: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
}

export const tools: ToolConfig[] = [
  {
    slug: 'precision-crop',
    name: 'Precision Crop',
    seoTitle: 'Precision Crop Image Online',
    seoDescription: 'Crop images with pixel-perfect precision in your browser.',
    category: 'media',
    icon: '🖼️',
    component: () => import('@/tools/media/precision-crop'),
  },
];

/** Lookup map — used by [slug].astro getStaticPaths */
export const toolsBySlug: Record<string, ToolConfig> = Object.fromEntries(
  tools.map((t) => [t.slug, t])
);

/** Getter with a loud error on typo */
export function getTool(slug: string): ToolConfig {
  const tool = toolsBySlug[slug];
  if (!tool) {
    throw new Error(
      `Unknown tool slug: "${slug}". Add it to src/config/tools.ts.`
    );
  }
  return tool;
}