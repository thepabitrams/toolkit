import { useState, useDeferredValue } from 'react';
import { tools as allTools } from '@/config/tools';
import { ToolCard } from './ToolCard';
import { Search } from './Search';
import { useToolStore } from '@/shared/store/toolStore';

const TOOLS_PER_PAGE = 50;

export default function ToolExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { favorites, usageCounts } = useToolStore();

  // 1. INLINE SORTING LOGIC
  const sortedTools = [...allTools].sort((toolA, toolB) => {
    const isFavA = favorites.includes(toolA.slug) ? 1 : 0;
    const isFavB = favorites.includes(toolB.slug) ? 1 : 0;
    if (isFavA !== isFavB) return isFavB - isFavA;

    const usageA = usageCounts[toolA.slug] || 0;
    const usageB = usageCounts[toolB.slug] || 0;
    if (usageA !== usageB) return usageB - usageA;

    return toolA.name.localeCompare(toolB.name);
  });

  // 2. FILTERING LOGIC
  const filteredTools = sortedTools.filter((tool) => {
    if (!deferredSearchQuery) return true;
    const normalizedQuery = deferredSearchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(normalizedQuery) ||
      tool.seoDescription.toLowerCase().includes(normalizedQuery)
    );
  });

  const visibleTools = filteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTools.length;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(TOOLS_PER_PAGE);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24">
      {/* Fixed top-[60px] to top-15 */}
      <div className="sticky top-15 z-40 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md py-6 px-4 border-b border-gray-200/50 dark:border-gray-800/50 mb-12 flex justify-center">
        <Search
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholderText="Search tools (e.g., crop, pdf, image)..."
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No tools found matching "{searchQuery}".
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleTools.map((tool) => (
              <ToolCard key={tool.slug} toolMetadata={tool} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + TOOLS_PER_PAGE)}
                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all"
              >
                Load More Tools
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}