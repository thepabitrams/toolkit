import { useState } from 'react';
import { Search } from '@/core/components/ui/Search';
import { ToolCatalog } from '@/core/components/ui/ToolCatalog';
import { Container } from '@/core/components/ui/Container';
import { tools as allTools } from '@/config/tools';

interface ToolHubProps {
  variant?: 'grid' | 'list';
  category?: string | null;
  input?: string | null;
  filter?: { category: string; inputType: string } | undefined;
  onToolSelect?: (toolId: string) => void;
}

export function ToolHub({
  variant = 'grid',
  category = null,
  input = null,
  filter,
  onToolSelect,
}: ToolHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeCategory = filter?.category || category;

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? tool.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  }).map(t => ({ ...t, id: t.slug }));

  const handleSelect = (toolId: string) => {
    if (onToolSelect) {
      onToolSelect(toolId);
    } else {
      window.location.href = `/${toolId}`;
    }
  };

  const handleHover = (toolId: string) => {
    const tool = allTools.find(t => t.slug === toolId);
    if (tool) tool.component();
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <Container className="px-0">
        <Search value={searchQuery} onChange={setSearchQuery} />
      </Container>
      <Container className="px-0">
        <ToolCatalog
          tools={filteredTools}
          variant={variant}
          loading={false}
          currentToolId={null}
          onToolSelect={handleSelect}
          onToolHover={handleHover}
        />
      </Container>
    </div>
  );
}