import { useEffect, useState } from 'react';
import { tools } from '@/config/tools';
import type { ToolConfig } from '@/config/tools';

interface ToolViewerProps {
  toolId: string;
}

export function ToolViewer({ toolId }: ToolViewerProps) {
  const [tool, setTool] = useState<ToolConfig | null>(null);
  const [ToolComponent, setToolComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    if (!toolId) {
      setTool(null);
      setToolComponent(null);
      setLoading(false);
      return;
    }

    const foundTool = tools.find(t => t.slug === toolId);

    if (!foundTool) {
      setTool(null);
      setToolComponent(null);
      setLoading(false);
      return;
    }

    setTool(foundTool);
    
    foundTool.component()
      .then((mod) => {
        if (isMounted) {
          setToolComponent(() => mod.default);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTool(null);
          setToolComponent(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [toolId]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!tool || !ToolComponent) {
    return (
      <div className="w-full max-w-7xl mx-auto text-center py-12">
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300">
          Tool not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The tool you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <ToolComponent
        category={tool.category}
        toolId={toolId}
      />
    </div>
  );
}