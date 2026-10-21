import { useState } from 'react';
import { tools as allTools } from '@/config/tools';
import { Search } from '@/_pages/home/ui/Search';
import { ToolCatalog } from '@/_pages/home/ui/ToolCatalog';
import { useFilteredTools } from '@/core/hooks/useFilteredTools';

interface ToolHubProps {
  variant?: 'grid' | 'list';
  currentSlug?: string | null;
  onToolSelect?: (slug: string) => void;
}

export function ToolHub({
  variant = 'grid',
  currentSlug = null,
  onToolSelect,
}: ToolHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTools = useFilteredTools(allTools, searchQuery);

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <div className="px-4 mb-4">
        <Search 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search tools..." 
        />
      </div>
      <div className="px-2">
        <ToolCatalog
          tools={filteredTools}
          variant={variant}
          loading={false}
          currentToolId={currentSlug}
          onToolSelect={onToolSelect}
        />
      </div>
    </div>
  );
}