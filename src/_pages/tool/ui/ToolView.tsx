import { useEffect, useState, type ComponentType } from 'react';
import { getTool } from '@/config/tools';
import { useToolStore } from '@/shared/store/toolStore';

interface ToolProps {
  category?: string;
  toolId?: string;
}

interface ToolViewProperties {
  slug: string;
}

export default function ToolView({ slug }: ToolViewProperties) {
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
        <p className="text-gray-500 dark:text-gray-400 mt-2">The tool you're looking for doesn't exist or failed to load.</p>
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