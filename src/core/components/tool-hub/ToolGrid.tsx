import { ToolGridItem } from './ToolGridItem';
import { Grid } from '@/core/components/ui/Grid';
import { Card } from '@/core/components/ui';
import type { ToolConfig } from '@/config/tools';

interface ToolGridProps {
  toolItems: (ToolConfig & { id: string; name: string })[];
  isLoadingCatalog: boolean;
  activeToolSlug: string | null;
  handleToolSelect?: (toolSlug: string) => void;
  handleToolHover?: (toolSlug: string) => void;
  loadingToolSlug?: string | null;
}

function ToolGridSkeleton() {
  return (
    <Card className="p-6 animate-pulse w-full max-w-70 mx-auto">
      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 ml-auto mb-4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </Card>
  );
}

export function ToolGrid({
  toolItems,
  isLoadingCatalog,
  handleToolSelect,
  handleToolHover,
  loadingToolSlug,
}: ToolGridProps) {
  if (isLoadingCatalog) {
    return (
      <Grid minCardWidth={200} gap={16} className="pt-6">
        {Array.from({ length: 12 }).map((_, placeholderIndex) => (
          <ToolGridSkeleton key={placeholderIndex} />
        ))}
      </Grid>
    );
  }

  if (toolItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No tools found. Try a different search.</p>
      </div>
    );
  }

  return (
    <Grid minCardWidth={200} gap={16} className="pt-6">
      {toolItems.map((toolItem) => (
        <ToolGridItem
          key={toolItem.id}
          tool={toolItem}
          onToolSelect={handleToolSelect}
          onToolHover={handleToolHover}
          isLoading={loadingToolSlug === toolItem.id}
        />
      ))}
    </Grid>
  );
}