import { memo, useRef, useState, useEffect } from 'react';
import { useToolStore } from './toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import type { ToolConfig } from '@/config/tools';
import { Motion } from '@/core/motion/motion';
import { toolCardListMotion } from '@/core/motion/compositions/toolCardMotion';
import { marqueeSwing } from '@/core/motion/presets/marqueeSwing';
import { injectKeyframes } from '@/core/motion/core/injection/keyframes';

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

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const hasInjectedKeyframes = useRef(false);

  useEffect(() => {
    if (!hasInjectedKeyframes.current) {
      injectKeyframes(marqueeSwing.name, marqueeSwing.keyframes);
      hasInjectedKeyframes.current = true;
    }
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      setIsTitleOverflowing(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [tool.displayName]);

  const baseClasses = "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer select-none transition-all";
  const activeClasses = isTopActive 
    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-sm" 
    : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

  return (
    <Motion
      preset={toolCardListMotion}
      as="div"
      className={`${baseClasses} ${activeClasses} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      onClick={handleToolClick}
      onMouseEnter={() => onToolHover?.(tool.slug)}
    >
      <div className="flex-1 min-w-0 overflow-hidden">
        {isTitleOverflowing ? (
          <div
            className={`text-sm font-medium whitespace-nowrap inline-block ${isTopActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}
            style={{ animation: 'marquee-swing 4s ease-in-out infinite' }}
          >
            {tool.displayName}
          </div>
        ) : (
          <div
            ref={titleRef}
            className={`text-sm font-medium whitespace-nowrap ${isTopActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}
          >
            {tool.displayName}
          </div>
        )}
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
    </Motion>
  );
});

ToolListItem.displayName = 'ToolListItem';