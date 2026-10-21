import { useEffect, useState, type ComponentType } from 'react';
import { getTool } from '@/config/tools';
import { useToolStore } from '@/core/store/toolStore';

interface ToolProps {
  category?: string;
  toolId?: string;
}

export default function ToolView({ slug }: { slug: string }) {
  const [ToolComponent, setToolComponent] = useState<ComponentType<ToolProps> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const setCurrentTool = useToolStore((state) => state.setCurrentTool);

  useEffect(() => {
    async function loadTool() {
      const toolMetadata = getTool(slug);
      if (!toolMetadata) {
        setError(true);
        setLoading(false);
        return;
      }

      setCurrentTool(toolMetadata);

      try {
        const module = await toolMetadata.component();
        setToolComponent(() => module.default || module);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadTool();
  }, [slug, setCurrentTool]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (error || !ToolComponent) {
    return (
      <div className="w-full max-w-7xl mx-auto text-center py-12">
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300">Tool not found</h2>
      </div>
    );
  }

  const toolMetadata = getTool(slug);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <ToolComponent category={toolMetadata?.category} toolId={slug} />
    </div>
  );
}