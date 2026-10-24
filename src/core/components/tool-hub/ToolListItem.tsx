import { memo, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useToolStore } from './toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import type { ToolConfig } from '@/config/tools';

interface ToolListItemProps {
  tool: ToolConfig;
  onToolSelect?: (toolSlug: string) => void;
  onToolHover?: (toolSlug: string) => void;
  isLoading?: boolean;
  isTopActive?: boolean;
}

export const ToolListItem = memo(function ToolListItem({
  tool,
  onToolSelect,
  onToolHover,
  isLoading,
  isTopActive = false,
}: ToolListItemProps) {
  const { favorites, toggleFavorite, incrementUsage } = useToolStore();
  const isFavorite = favorites.includes(tool.slug);

  const handleToolClick = () => {
    incrementUsage(tool.slug);
    if (onToolSelect) {
      onToolSelect(tool.slug);
    } else {
      window.location.href = `/${tool.slug}`;
    }
  };

  const handleFavoriteToggle = (mouseEvent: React.MouseEvent) => {
    mouseEvent.stopPropagation();
    toggleFavorite(tool.slug);
  };

  const titleRef = useRef<HTMLDivElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    if (titleRef.current) {
      const maxScroll = titleRef.current.scrollWidth - titleRef.current.clientWidth;
      setOverflowDistance(maxScroll > 0 ? maxScroll : 0);
    }
  }, [tool.displayName]);

  const baseClasses = "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-all duration-200";
  
  const stateClasses = isTopActive 
    ? "bg-gray-100 dark:bg-[#1e242d] text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700/50" 
    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1e242d]/50 hover:text-gray-900 dark:hover:text-gray-200";

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      onClick={handleToolClick}
      onMouseEnter={() => onToolHover?.(tool.slug)}
    >
      <div className="flex-1 min-w-0 overflow-hidden">
        <motion.div
          ref={titleRef}
          animate={overflowDistance > 0 ? { x: [0, -overflowDistance, 0] } : {}}
          transition={
            overflowDistance > 0 
              ? { duration: Math.max(3, overflowDistance / 15), repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 } 
              : {}
          }
          className="text-sm font-medium whitespace-nowrap"
        >
          {tool.displayName}
        </motion.div>
      </div>

      <button
        onClick={handleFavoriteToggle}
        className={`shrink-0 transition-all p-1 rounded-md ${
          isFavorite 
            ? 'text-black dark:text-white' 
            : 'text-slate-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
        }`}
        aria-label="Toggle favorite"
      >
        {isFavorite ? (
          <FaHeart className="w-3.5 h-3.5" />
        ) : (
          <FaRegHeart className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
});

ToolListItem.displayName = 'ToolListItem';