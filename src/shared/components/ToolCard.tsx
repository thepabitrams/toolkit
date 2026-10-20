import { memo } from 'react';
import { useToolStore } from '@/shared/store/toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import type { ToolConfig } from '@/config/tools';

interface ToolCardProps {
  tool: ToolConfig;
}

export const ToolCard = memo(function ToolCard({ tool }: ToolCardProps) {
  const { favorites, toggleFavorite, incrementUsage } = useToolStore();
  const isFavorite = favorites.includes(tool.slug);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool.slug);
  };

  return (
    <a
      href={`/${tool.slug}`}
      onClick={() => incrementUsage(tool.slug)}
      className="group relative flex flex-col p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
    >
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        aria-label="Toggle favorite"
      >
        {isFavorite ? <FaHeart className="text-red-500 w-4 h-4" /> : <FaRegHeart className="text-gray-400 w-4 h-4" />}
      </button>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-8">
        {tool.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {tool.seoDescription}
      </p>
    </a>
  );
});