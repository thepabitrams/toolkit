// src/_pages/tool/ui/ToolView.tsx
import { useEffect, useState } from 'react';
import { tools as registeredTools } from '@/config/tools';
import type { ToolConfig } from '@/config/tools';
import { setActiveToolIdentifier } from '@/shared/store/file-store';

interface ToolViewProps {
  toolSlug: string;
}

export default function ToolView({ toolSlug }: ToolViewProps) {
  const [activeToolConfig, setActiveToolConfig] = useState<ToolConfig | null>(null);
  const [DynamicToolComponent, setDynamicToolComponent] = useState<React.ComponentType<any> | null>(null);
  const [isComponentLoading, setIsComponentLoading] = useState(true);

  useEffect(() => {
    let isComponentMounted = true;
    
    if (!toolSlug) {
      setActiveToolConfig(null);
      setDynamicToolComponent(null);
      setIsComponentLoading(false);
      return;
    }

    setActiveToolIdentifier(toolSlug);

    const matchingTool = registeredTools.find((registeredTool) => registeredTool.slug === toolSlug);

    if (!matchingTool) {
      setActiveToolConfig(null);
      setDynamicToolComponent(null);
      setIsComponentLoading(false);
      return;
    }

    setActiveToolConfig(matchingTool);
    
    matchingTool.component()
      .then((dynamicToolModule) => {
        if (isComponentMounted) {
          setDynamicToolComponent(() => dynamicToolModule.default);
          setIsComponentLoading(false);
        }
      })
      .catch(() => {
        if (isComponentMounted) {
          setActiveToolConfig(null);
          setDynamicToolComponent(null);
          setIsComponentLoading(false);
        }
      });

    return () => {
      isComponentMounted = false;
    };
  }, [toolSlug]);

  if (isComponentLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!activeToolConfig || !DynamicToolComponent) {
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
      <DynamicToolComponent
        category={activeToolConfig.category}
        toolId={toolSlug}
      />
    </div>
  );
}