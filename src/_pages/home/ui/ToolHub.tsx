import { useState } from 'react';
import { Search } from './Search';
import { ToolCatalog } from './ToolCatalog';
import { Container } from '@/shared/ui/Container';
import { tools as allTools } from '@/config/tools';
import { useToolStore } from '@/shared/store/toolStore';

export function ToolHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, usageCounts } = useToolStore();

  let filteredTools = [...allTools];
  
  if (searchQuery.trim()) {
    const lower = searchQuery.toLowerCase();
    filteredTools = filteredTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lower) ||
        tool.seoDescription.toLowerCase().includes(lower) ||
        tool.category.toLowerCase().includes(lower)
    );
  }
  
  filteredTools.sort((a, b) => {
    const aFav = favorites.includes(a.slug) ? 1 : 0;
    const bFav = favorites.includes(b.slug) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    
    const aUsage = usageCounts[a.slug] || 0;
    const bUsage = usageCounts[b.slug] || 0;
    if (aUsage !== bUsage) return bUsage - aUsage;
    
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <Container className="px-0">
        <Search value={searchQuery} onChange={setSearchQuery} />
      </Container>
      <Container className="px-0">
        <ToolCatalog
          tools={filteredTools}
          variant="grid"
          loading={false}
          currentToolId={null}
        />
      </Container>
    </div>
  );
}