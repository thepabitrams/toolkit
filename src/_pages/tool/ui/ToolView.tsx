import { useEffect, useState } from 'react';
import { tools as registeredTools } from '@/config/tools';
import type { ToolConfig } from '@/config/tools';

interface ToolViewProps {
  toolSlug: string;
}

export default function ToolView({ toolSlug }: ToolViewProps) {
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);
  const [ToolComponent, setToolComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isComponentMounted = true;
    
    if (!toolSlug) {
      setActiveTool(null);
      setToolComponent(null);
      setIsLoading(false);
      return;
    }

    const matchingTool = registeredTools.find((toolItem) => toolItem.slug === toolSlug);

    if (!matchingTool) {
      setActiveTool(null);
      setToolComponent(null);
      setIsLoading(false);
      return;
    }

    setActiveTool(matchingTool);
    
    matchingTool.component()
      .then((toolModule) => {
        if (isComponentMounted) {
          setToolComponent(() => toolModule.default);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isComponentMounted) {
          setActiveTool(null);
          setToolComponent(null);
          setIsLoading(false);
        }
      });

    return () => {
      isComponentMounted = false;
    };
  }, [toolSlug]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!activeTool || !ToolComponent) {
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
        category={activeTool.category}
        toolId={toolSlug}
      />
    </div>
  );
}