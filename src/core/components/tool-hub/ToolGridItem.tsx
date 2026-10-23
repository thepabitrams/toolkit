import { memo, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useToolStore } from './toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import type { ToolConfig } from '@/config/tools';
import { Card } from '@/core/components/ui';

interface ToolGridItemProps {
  tool: ToolConfig;
  onToolSelect?: (toolSlug: string) => void;
  onToolHover?: (toolSlug: string) => void;
  isLoading?: boolean;
}

export const ToolGridItem = memo(function ToolGridItem({
  tool,
  onToolSelect,
  onToolHover,
  isLoading,
}: ToolGridItemProps) {
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

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    if (titleRef.current) {
      const maxScroll = titleRef.current.scrollWidth - titleRef.current.clientWidth;
      setOverflowDistance(maxScroll > 0 ? maxScroll : 0);
    }
  }, [tool.displayName]);

  return (
    <Card
      className={`
        w-full max-w-70 mx-auto 
        cursor-pointer select-none 
        overflow-hidden
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
      `}
      onClick={handleToolClick}
      onMouseEnter={() => onToolHover?.(tool.slug)}
    >
      <div className="relative p-6">
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label="Toggle favorite"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 w-4 h-4" />
          ) : (
            <FaRegHeart className="text-gray-400 group-hover:text-red-400 w-4 h-4 transition-colors" />
          )}
        </button>

        <div className="pr-8 overflow-hidden">
          <motion.div
            ref={titleRef}
            animate={overflowDistance > 0 ? { x: [0, -overflowDistance, 0] } : {}}
            transition={
              overflowDistance > 0 
                ? { duration: Math.max(3, overflowDistance / 15), repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 } 
                : {}
            }
            className="tool-title mb-1 whitespace-nowrap"
          >
            {tool.displayName}
          </motion.div>
        </div>

        <p className="tool-description line-clamp-2">
          {tool.displayDescription}
        </p>
      </div>
    </Card>
  );
});

ToolGridItem.displayName = 'ToolGridItem';