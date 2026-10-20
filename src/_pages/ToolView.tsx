import { useEffect, useState, type ComponentType } from 'react';
import { getTool } from '@/config/tools';

export default function ToolView({ slug }: { slug: string }) {
  const [DynamicTool, setDynamicTool] = useState<ComponentType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTool() {
      const tool = getTool(slug);
      if (!tool) {
        setLoadError(`Tool "${slug}" not found.`);
        return;
      }
      try {
        const module = await tool.component();
        setDynamicTool(() => module.default || module);
      } catch (err) {
        setLoadError('Failed to load the tool.');
      }
    }
    loadTool();
  }, [slug]);

  if (loadError) return <div className="text-red-500 p-4">{loadError}</div>;
  if (!DynamicTool) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-800 rounded-lg p-4">Loading Tool...</div>;

  return <DynamicTool />;
}