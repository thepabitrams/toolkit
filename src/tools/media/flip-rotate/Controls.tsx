// src/tools/media/flip-rotate/Controls.tsx
import React from 'react';
import { FiRotateCcw, FiRotateCw, FiRefreshCw } from 'react-icons/fi';
import { TfiArrowsHorizontal, TfiArrowsVertical } from 'react-icons/tfi';
import { IconButton } from '@/core/components/ui/IconButton';

interface ControlsProps {
  normalizedRotationAngle: number;
  isFlippedHorizontal: boolean;
  isFlippedVertical: boolean;
  onRotateCounterClockwise: () => void;
  onRotateClockwise: () => void;
  onToggleFlipHorizontal: () => void;
  onToggleFlipVertical: () => void;
  onResetTransformations: () => void;
  hasConfigurationChanges: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  normalizedRotationAngle,
  isFlippedHorizontal,
  isFlippedVertical,
  onRotateCounterClockwise,
  onRotateClockwise,
  onToggleFlipHorizontal,
  onToggleFlipVertical,
  onResetTransformations,
  hasConfigurationChanges,
}): React.JSX.Element => {
  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent">
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <IconButton
            onClick={onRotateCounterClockwise}
            variant="standard"
            size="md"
            ariaLabel="Rotate 90 degrees counter-clockwise"
          >
            <FiRotateCcw className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={onRotateClockwise}
            variant="standard"
            size="md"
            ariaLabel="Rotate 90 degrees clockwise"
          >
            <FiRotateCw className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={onToggleFlipHorizontal}
            variant={isFlippedHorizontal ? 'filled' : 'standard'}
            size="md"
            ariaLabel="Flip horizontal"
          >
            <TfiArrowsHorizontal className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={onToggleFlipVertical}
            variant={isFlippedVertical ? 'filled' : 'standard'}
            size="md"
            ariaLabel="Flip vertical"
          >
            <TfiArrowsVertical className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={onResetTransformations}
            variant="standard"
            size="md"
            ariaLabel="Reset transformations"
            disabled={!hasConfigurationChanges}
          >
            <FiRefreshCw className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Rotation: {normalizedRotationAngle}°
            {isFlippedHorizontal && ' · Flipped H'}
            {isFlippedVertical && ' · Flipped V'}
          </span>
        </div>
      </div>
    </div>
  );
};