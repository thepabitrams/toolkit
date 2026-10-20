import { useMemo, useDeferredValue } from 'react';
import { useToolStore } from '@/shared/store/toolStore';
import type { ToolConfig } from '@/config/tools';

interface ToolFilters {
  category?: string | null;
  input?: string | null;
}

export function useFilteredTools(
  tools: ToolConfig[],
  searchQuery: string,
  filters: ToolFilters = {}
) {
  const { favorites, usageCounts } = useToolStore();
  const deferredQuery = useDeferredValue(searchQuery);

  return useMemo(() => {
    let result = tools;

    if (filters.category) {
      result = result.filter((tool) => tool.category === filters.category);
    }

    if (deferredQuery.trim()) {
      const lower = deferredQuery.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(lower) ||
          tool.seoDescription.toLowerCase().includes(lower) ||
          tool.category.toLowerCase().includes(lower)
      );
    }

    return result.sort((a, b) => {
      const aFav = favorites.includes(a.slug) ? 1 : 0;
      const bFav = favorites.includes(b.slug) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      const aUsage = usageCounts[a.slug] || 0;
      const bUsage = usageCounts[b.slug] || 0;
      if (aUsage !== bUsage) return bUsage - aUsage;
      return a.name.localeCompare(b.name);
    });
  }, [tools, deferredQuery, filters, favorites, usageCounts]);
}