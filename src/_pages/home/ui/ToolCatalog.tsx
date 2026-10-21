import { ToolCard } from './ToolCard';
import type { ToolConfig } from '@/config/tools';

interface ToolCatalogProps {
  tools: ToolConfig[];
  variant: 'grid' | 'list';
  loading: boolean;
  currentToolId: string | null;
  onToolSelect?: (toolSlug: string) => void;
  onToolHover?: (toolSlug: string) => void;
  loadingToolId?: string | null;
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xs border border-gray-200/50 dark:border-gray-800/50 animate-pulse w-full max-w-[280px] mx-auto">
    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 ml-auto mb-4" />
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-2 rounded-lg animate-pulse">
    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
  </div>
);

export function ToolCatalog({
  tools,
  variant,
  loading,
  currentToolId,
  onToolSelect,
  onToolHover,
  loadingToolId,
}: ToolCatalogProps) {
  if (loading) {
    if (variant === 'list') {
      return (
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 pt-6">
        {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No tools found. Try a different search.</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-1">
        {tools.map((tool) => (
          <div
            key={tool.slug}
            className={`rounded-lg transition-colors ${
              currentToolId === tool.slug
                ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                : ''
            }`}
          >
            <ToolCard
              tool={tool}
              variant="list"
              onToolSelect={onToolSelect}
              onToolHover={onToolHover}
              isLoading={loadingToolId === tool.slug}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 pt-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.slug}
          tool={tool}
          variant="grid"
          onToolSelect={onToolSelect}
          onToolHover={onToolHover}
          isLoading={loadingToolId === tool.slug}
        />
      ))}
    </div>
  );
}