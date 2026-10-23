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

  const baseClasses = "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer select-none transition-all";
  const activeClasses = isTopActive 
    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-sm" 
    : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

  return (
    <div
      className={`${baseClasses} ${activeClasses} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
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
          className={`text-sm font-medium whitespace-nowrap ${isTopActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}
        >
          {tool.displayName}
        </motion.div>
      </div>
      <button
        onClick={handleFavoriteToggle}
        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
        aria-label="Toggle favorite"
      >
        {isFavorite ? (
          <FaHeart className="text-red-500 w-3.5 h-3.5" />
        ) : (
          <FaRegHeart className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
});

ToolListItem.displayName = 'ToolListItem';