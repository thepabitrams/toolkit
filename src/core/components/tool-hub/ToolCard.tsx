// src/core/components/tool-hub/ToolCard.tsx

import { memo, useRef, useState, useEffect } from 'react';
import { useToolStore } from '@/core/components/tool-hub/toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import type { ToolConfig } from '@/config/tools';
import { Motion } from '@/core/motion/motion';
import { toolCardGridMotion, toolCardListMotion } from '@/core/motion/compositions/toolCardMotion';
import { marqueeSwing } from '@/core/motion/presets/marqueeSwing';
import { injectKeyframes } from '@/core/motion/core/injection/keyframes';

interface ToolCardProps {
  tool: ToolConfig;
  variant?: 'grid' | 'list';
  onToolSelect?: (toolSlug: string) => void;
  onToolHover?: (toolSlug: string) => void;
  isLoading?: boolean;
}

export const ToolCard = memo(function ToolCard({
  tool,
  variant = 'grid',
  onToolSelect,
  onToolHover,
  isLoading,
}: ToolCardProps) {
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

  if (variant === 'list') {
    return (
      <Motion
        preset={toolCardListMotion}
        as="div"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer select-none transition-opacity ${
          isLoading ? 'opacity-50 cursor-wait' : ''
        }`}
        onClick={handleToolClick}
        onMouseEnter={() => onToolHover?.(tool.slug)}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          {isTitleOverflowing ? (
            <div
              className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap inline-block"
              style={{
                animation: 'marquee-swing 4s ease-in-out infinite',
              }}
            >
              {tool.displayName}
            </div>
          ) : (
            <div
              ref={titleRef}
              className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap"
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
  }

  return (
    <Motion
      preset={toolCardGridMotion}
      as="div"
      className={`
        w-full max-w-70 mx-auto 
        cursor-pointer select-none
        bg-white dark:bg-gray-900
        rounded-2xl 
        border border-gray-200/50 dark:border-gray-800/50
        overflow-hidden
        transition-opacity
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
          {isTitleOverflowing ? (
            <div
              className="tool-title mb-1 whitespace-nowrap inline-block"
              style={{
                animation: 'marquee-swing 4s ease-in-out infinite',
              }}
            >
              {tool.displayName}
            </div>
          ) : (
            <h3 ref={titleRef} className="tool-title mb-1 whitespace-nowrap">
              {tool.displayName}
            </h3>
          )}
        </div>

        <p className="tool-description line-clamp-2">
          {tool.displayDescription}
        </p>
      </div>
    </Motion>
  );
});

ToolCard.displayName = 'ToolCard';