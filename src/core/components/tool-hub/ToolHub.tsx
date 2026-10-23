import { useState } from 'react';
import { Search } from '@/core/components/ui/Search';
import { Container } from '@/core/components/ui/Container';
import { tools } from '@/config/tools';
import { useFilteredTools } from './useFilteredTools';
import { useToolStore } from './toolStore';
import { ToolGrid } from './ToolGrid';
import { ToolList } from './ToolList';

interface ToolHubProps {
  displayVariant: 'grid' | 'list';
  categoryFilter?: string | null;
  inputFilter?: string | null;
  actionFilter?: { category: string; inputType: string } | undefined;
  handleToolSelect?: (toolSlug: string) => void;
}

export function ToolHub({
  displayVariant,
  categoryFilter = null,
  inputFilter = null,
  actionFilter,
  handleToolSelect,
}: ToolHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentToolSlug } = useToolStore();
  const activeCategory = actionFilter?.category || categoryFilter;

  const mappedTools = tools.map((toolItem) => ({ 
    ...toolItem, 
    id: toolItem.slug,
    name: toolItem.displayName 
  }));

  const filteredTools = useFilteredTools(mappedTools, searchQuery, { 
    category: activeCategory, 
    input: inputFilter 
  });

  const handleSelect = (toolSlug: string) => {
    if (handleToolSelect) {
      handleToolSelect(toolSlug);
    } else {
      window.location.href = `/${toolSlug}`;
    }
  };

  const handleHover = (toolSlug: string) => {
    const matchedTool = tools.find((toolItem) => toolItem.slug === toolSlug);
    if (matchedTool) matchedTool.component();
  };

  const catalogProps = {
    toolItems: filteredTools,
    isLoadingCatalog: false,
    activeToolSlug: currentToolSlug,
    handleToolSelect: handleSelect,
    handleToolHover: handleHover,
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <Container className="px-0">
        <Search value={searchQuery} onChange={setSearchQuery} />
      </Container>
      <Container className="px-0">
        {displayVariant === 'grid' ? (
          <ToolGrid {...catalogProps} />
        ) : (
          <ToolList {...catalogProps} />
        )}
      </Container>
    </div>
  );
}