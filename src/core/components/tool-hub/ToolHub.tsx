import { useState } from 'react';
import { Search } from '@/core/components/ui/Search';
import { ToolCatalog } from './ToolCatalog';
import { Container } from '@/core/components/ui/Container';
import { tools } from '@/config/tools';

interface ToolHubProps {
  displayVariant?: 'grid' | 'list';
  categoryFilter?: string | null;
  inputFilter?: string | null;
  actionFilter?: { category: string; inputType: string } | undefined;
  handleToolSelect?: (toolSlug: string) => void;
}

export function ToolHub({
  displayVariant = 'grid',
  categoryFilter = null,
  inputFilter = null,
  actionFilter,
  handleToolSelect,
}: ToolHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const registeredTools = tools;
  const activeCategory = actionFilter?.category || categoryFilter;

  const filteredTools = registeredTools.filter((toolItem) => {
    const matchesSearch = toolItem.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? toolItem.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  }).map((toolItem) => ({ 
    ...toolItem, 
    id: toolItem.slug,
    name: toolItem.displayName 
  }));

  const handleSelect = (toolSlug: string) => {
    if (handleToolSelect) {
      handleToolSelect(toolSlug);
    } else {
      window.location.href = `/${toolSlug}`;
    }
  };

  const handleHover = (toolSlug: string) => {
    const matchedTool = registeredTools.find((toolItem) => toolItem.slug === toolSlug);
    if (matchedTool) matchedTool.component();
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <Container className="px-0">
        <Search value={searchQuery} onChange={setSearchQuery} />
      </Container>
      <Container className="px-0">
        <ToolCatalog
          toolItems={filteredTools}
          displayVariant={displayVariant}
          isLoadingCatalog={false}
          activeToolSlug={null}
          handleToolSelect={handleSelect}
          handleToolHover={handleHover}
        />
      </Container>
    </div>
  );
}