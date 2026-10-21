// src/core/components/tool-hub/ToolCatalog.tsx

import { ToolCard } from '@/core/components/tool-hub/ToolCard';
import { Grid } from '@/core/components/ui/Grid';
import type { ToolConfig } from '@/config/tools';

interface ToolCatalogItem extends ToolConfig {
  id: string;
  name: string;
}

interface ToolCatalogProps {
  toolItems: ToolCatalogItem[];
  displayVariant: 'grid' | 'list';
  isLoadingCatalog: boolean;
  activeToolSlug: string | null;
  handleToolSelect?: (toolSlug: string) => void;
  handleToolHover?: (toolSlug: string) => void;
  loadingToolSlug?: string | null;
}

const CatalogSkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xs border border-gray-200/50 dark:border-gray-800/50 animate-pulse w-full max-w-70 mx-auto">
    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 ml-auto mb-4" />
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
);

const CatalogSkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-2 rounded-lg animate-pulse">
    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
  </div>
);

export function ToolCatalog({
  toolItems,
  displayVariant,
  isLoadingCatalog,
  activeToolSlug,
  handleToolSelect,
  handleToolHover,
  loadingToolSlug,
}: ToolCatalogProps) {
  if (isLoadingCatalog) {
    if (displayVariant === 'list') {
      return (
        <div className="space-y-1">
          {[...Array(8)].map((_, placeholderIndex) => <CatalogSkeletonRow key={placeholderIndex} />)}
        </div>
      );
    }
    return (
      <Grid minCardWidth={200} gap={16} className="pt-6">
        {[...Array(12)].map((_, placeholderIndex) => <CatalogSkeletonCard key={placeholderIndex} />)}
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

  if (displayVariant === 'list') {
    return (
      <div className="space-y-1">
        {toolItems.map((toolItem) => (
          <div
            key={toolItem.id}
            className={`rounded-lg transition-colors ${
              activeToolSlug === toolItem.id
                ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                : ''
            }`}
          >
            <ToolCard
              tool={toolItem}
              variant="list"
              onToolSelect={handleToolSelect}
              onToolHover={handleToolHover}
              isLoading={loadingToolSlug === toolItem.id}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Grid minCardWidth={200} gap={16} className="pt-6">
      {toolItems.map((toolItem) => (
        <ToolCard
          key={toolItem.id}
          tool={toolItem}
          variant="grid"
          onToolSelect={handleToolSelect}
          onToolHover={handleToolHover}
          isLoading={loadingToolSlug === toolItem.id}
        />
      ))}
    </Grid>
  );
}