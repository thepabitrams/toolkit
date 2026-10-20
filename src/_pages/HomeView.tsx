import { useState, useDeferredValue } from 'react';
import { tools as allTools } from '@/config/tools';
import { ToolCard } from '@/shared/ui/ToolCard';
import { useToolStore } from '@/shared/store/toolStore';

export default function HomeView() {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const { favorites } = useToolStore();

  const filteredTools = allTools.filter((tool) => {
    if (!deferredQuery) return true;
    const lower = deferredQuery.toLowerCase();
    return tool.name.toLowerCase().includes(lower) || tool.seoDescription.toLowerCase().includes(lower);
  }).sort((a, b) => {
    const aFav = favorites.includes(a.slug) ? 1 : 0;
    const bFav = favorites.includes(b.slug) ? 1 : 0;
    return bFav - aFav;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">Privacy-First Tools</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">All processing happens in your browser. No uploads, no servers.</p>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <p className="text-gray-500">No tools found matching "{searchQuery}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}