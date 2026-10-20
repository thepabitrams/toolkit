import { memo } from 'react';
import { useToolStore } from '@/shared/store/toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiImage, FiFileText, FiFolder } from 'react-icons/fi';
import type { ToolConfig } from '@/config/tools';

interface ToolCardProps {
  tool: ToolConfig;
}

export const ToolCard = memo(function ToolCard({ tool }: ToolCardProps) {
  const { favorites, toggleFavorite, incrementUsage } = useToolStore();
  const isFavorite = favorites.includes(tool.slug);

  const handleFavoriteToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(tool.slug);
  };

  const handleCardClick = () => {
    incrementUsage(tool.slug);
  };

  const CategoryIcon = 
    tool.category === 'media' ? FiImage :
    tool.category === 'productivity' ? FiFileText : FiFolder;

  return (
    <a
      href={`/${tool.slug}`}
      onClick={handleCardClick}
      className="group relative flex flex-col p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-gray-700 h-full"
    >
      <button
        onClick={handleFavoriteToggle}
        className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors z-10"
        aria-label="Toggle favorite"
      >
        {isFavorite ? (
          <FaHeart className="text-red-500 w-4 h-4" />
        ) : (
          <FaRegHeart className="w-4 h-4 group-hover:text-red-400 transition-colors" />
        )}
      </button>

      <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
        <CategoryIcon size={24} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-6 leading-tight line-clamp-1">
        {tool.name}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed grow">
        {tool.seoDescription}
      </p>
    </a>
  );
});