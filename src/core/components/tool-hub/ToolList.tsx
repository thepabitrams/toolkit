import { ToolListItem } from './ToolListItem';
import type { ToolConfig } from '@/config/tools';

interface ToolListProps {
  toolItems: (ToolConfig & { id: string; name: string })[];
  isLoadingCatalog: boolean;
  activeToolSlug: string | null;
  handleToolSelect?: (toolSlug: string) => void;
  handleToolHover?: (toolSlug: string) => void;
  loadingToolSlug?: string | null;
}

function ToolListSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg animate-pulse">
      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export function ToolList({
  toolItems,
  isLoadingCatalog,
  handleToolSelect,
  handleToolHover,
  loadingToolSlug,
}: ToolListProps) {
  if (isLoadingCatalog) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, placeholderIndex) => (
          <ToolListSkeleton key={placeholderIndex} />
        ))}
      </div>
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
    <div className="space-y-1">
      {toolItems.map((toolItem, index) => (
        <ToolListItem
          key={toolItem.id}
          tool={toolItem}
          onToolSelect={handleToolSelect}
          onToolHover={handleToolHover}
          isLoading={loadingToolSlug === toolItem.id}
          isTopActive={index === 0}
        />
      ))}
    </div>
  );
}