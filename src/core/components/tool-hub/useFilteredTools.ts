import { useMemo, useDeferredValue } from 'react';
import { useToolStore } from './toolStore';
import type { ToolConfig } from '@/config/tools';

export interface ToolCatalogItem extends ToolConfig {
  id: string;
  name: string;
}

interface FilterOptions {
  category?: string | null;
  input?: string | null;
}

const HOT_RANKING_GRAVITY = 1.5;

function calculateHotScore(totalUsageCount: number, lastAccessedAt: number): number {
  if (totalUsageCount === 0 || lastAccessedAt === 0) return 0;
  const hoursSinceLastAccess = (Date.now() - lastAccessedAt) / (1000 * 60 * 60);
  return totalUsageCount / Math.pow(hoursSinceLastAccess + 2, HOT_RANKING_GRAVITY);
}

export function useFilteredTools(
  catalogTools: ToolCatalogItem[],
  searchQuery: string,
  activeFilters: FilterOptions = {}
) {
  const { favorites: favoriteToolSlugs, usageMetrics: toolUsageMetrics } = useToolStore();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  return useMemo(() => {
    let filteredCatalog = catalogTools;

    if (activeFilters.category) {
      filteredCatalog = filteredCatalog.filter((catalogTool) => catalogTool.category === activeFilters.category);
    }

    if (activeFilters.input) {
      filteredCatalog = filteredCatalog.filter((catalogTool) => (catalogTool as any).input === activeFilters.input);
    }

    if (deferredSearchQuery.trim()) {
      const normalizedSearchTerm = deferredSearchQuery.toLowerCase();
      filteredCatalog = filteredCatalog.filter(
        (catalogTool) =>
          catalogTool.displayName.toLowerCase().includes(normalizedSearchTerm) ||
          catalogTool.displayDescription.toLowerCase().includes(normalizedSearchTerm)
      );
    }

    return [...filteredCatalog].sort((primaryTool, comparisonTool) => {
      const isPrimaryFavorite = favoriteToolSlugs.includes(primaryTool.slug) ? 1 : 0;
      const isComparisonFavorite = favoriteToolSlugs.includes(comparisonTool.slug) ? 1 : 0;
      if (isPrimaryFavorite !== isComparisonFavorite) return isComparisonFavorite - isPrimaryFavorite;

      const primaryMetric = toolUsageMetrics[primaryTool.slug] || { count: 0, lastUsedTimestamp: 0 };
      const comparisonMetric = toolUsageMetrics[comparisonTool.slug] || { count: 0, lastUsedTimestamp: 0 };

      const primaryScore = calculateHotScore(primaryMetric.count, primaryMetric.lastUsedTimestamp);
      const comparisonScore = calculateHotScore(comparisonMetric.count, comparisonMetric.lastUsedTimestamp);

      if (primaryScore !== comparisonScore) return comparisonScore - primaryScore;

      return primaryTool.displayName.localeCompare(comparisonTool.displayName);
    });
  }, [catalogTools, deferredSearchQuery, activeFilters, favoriteToolSlugs, toolUsageMetrics]);
}