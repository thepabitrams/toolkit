// src/tools/media/add-text/Controls.tsx
import React, { useRef, useCallback, useEffect } from 'react';
import { FiMinus, FiPlus, FiRotateCcw } from 'react-icons/fi';
import { Button } from '@/core/components/ui/Button';
import { IconButton } from '@/core/components/ui/IconButton';
import { Textarea } from '@/core/components/ui/Textarea';
import { ColorPicker } from '@/core/components/ui/ColorPicker';
import type { TextConfiguration } from './useAddText';

interface ControlsProps {
  textConfiguration: TextConfiguration;
  onTextChange: (content: string) => void;
  onFontSizeChange: (sizeOrUpdater: number | ((previousSize: number) => number)) => void;
  onColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onOpacityChange: (opacityOrUpdater: number | ((prevOpacity: number) => number)) => void;
  onFontFamilyChange: (font: string) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onPositionChange: (position: 'top' | 'bottom') => void;
  onReset: () => void;
  hasChanges: boolean;
  onApply: () => void;
  isExporting: boolean;
}

const AVAILABLE_FONTS = [
  'Arial, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Impact, sans-serif',
  'Courier New, monospace',
  'Helvetica, sans-serif',
  'Comic Sans MS, cursive',
];

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 5000;

export const Controls: React.FC<ControlsProps> = ({
  textConfiguration,
  onTextChange,
  onFontSizeChange,
  onColorChange,
  onBackgroundColorChange,
  onOpacityChange,
  onFontFamilyChange,
  onToggleBold,
  onToggleItalic,
  onPositionChange,
  onReset,
  hasChanges,
  onApply,
  isExporting,
}): React.JSX.Element => {
  const sizeHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const opacityHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacityHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAllHolds = useCallback(() => {
    if (sizeHoldTimeoutRef.current) clearTimeout(sizeHoldTimeoutRef.current);
    if (sizeHoldIntervalRef.current) clearInterval(sizeHoldIntervalRef.current);
    if (opacityHoldTimeoutRef.current) clearTimeout(opacityHoldTimeoutRef.current);
    if (opacityHoldIntervalRef.current) clearInterval(opacityHoldIntervalRef.current);
  }, []);

  const startSizeHold = useCallback((direction: 'increment' | 'decrement') => {
    onFontSizeChange((previousSize) => 
      direction === 'increment' 
        ? Math.min(MAX_FONT_SIZE, previousSize + 4) 
        : Math.max(MIN_FONT_SIZE, previousSize - 4)
    );

    sizeHoldTimeoutRef.current = setTimeout(() => {
      let currentStep = 4;
      sizeHoldIntervalRef.current = setInterval(() => {
        currentStep = Math.min(currentStep + 2, 50);
        onFontSizeChange((previousSize) => 
          direction === 'increment' 
            ? Math.min(MAX_FONT_SIZE, previousSize + currentStep) 
            : Math.max(MIN_FONT_SIZE, previousSize - currentStep)
        );
      }, 50);
    }, 400);
  }, [onFontSizeChange]);

  const startOpacityHold = useCallback((direction: 'increment' | 'decrement') => {
    onOpacityChange((prev) => direction === 'increment' ? Math.min(1, prev + 0.05) : Math.max(0, prev - 0.05));

    opacityHoldTimeoutRef.current = setTimeout(() => {
      opacityHoldIntervalRef.current = setInterval(() => {
        onOpacityChange((prev) => direction === 'increment' ? Math.min(1, prev + 0.05) : Math.max(0, prev - 0.05));
      }, 40);
    }, 400);
  }, [onOpacityChange]);

  useEffect(() => {
    return () => stopAllHolds();
  }, [stopAllHolds]);

  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent">
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Textarea
            value={textConfiguration.content}
            onChange={(changeEvent) => onTextChange(changeEvent.target.value)}
            placeholder="Type your text here..."
            rows={2}
            className="flex-1 min-w-20 min-h-12"
          />

          <div className="flex gap-1 pt-1 shrink-0">
            <IconButton
              variant={textConfiguration.fontWeight === 'bold' ? 'filled' : 'standard'}
              size="sm"
              onClick={onToggleBold}
              ariaLabel="Toggle bold"
              className="px-2 py-1 min-w-8"
            >
              <span className="font-bold text-sm">B</span>
            </IconButton>
            <IconButton
              variant={textConfiguration.fontStyle === 'italic' ? 'filled' : 'standard'}
              size="sm"
              onClick={onToggleItalic}
              ariaLabel="Toggle italic"
              className="px-2 py-1 min-w-8"
            >
              <span className="italic text-sm">I</span>
            </IconButton>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1 shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Size
            </label>
            <IconButton
              onMouseDown={() => startSizeHold('decrement')}
              onMouseUp={stopAllHolds}
              onMouseLeave={stopAllHolds}
              onTouchStart={() => startSizeHold('decrement')}
              onTouchEnd={stopAllHolds}
              size="xs"
              variant="standard"
              ariaLabel="Decrease size"
            >
              <FiMinus />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-7 text-center">
              {textConfiguration.fontSize}
            </span>
            <IconButton
              onMouseDown={() => startSizeHold('increment')}
              onMouseUp={stopAllHolds}
              onMouseLeave={stopAllHolds}
              onTouchStart={() => startSizeHold('increment')}
              onTouchEnd={stopAllHolds}
              size="xs"
              variant="standard"
              ariaLabel="Increase size"
            >
              <FiPlus />
            </IconButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Font
            </label>
            <ColorPicker
              value={textConfiguration.color}
              onChange={onColorChange}
              size="sm"
            />
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 shrink-0" />

          <div className="flex items-center gap-1 shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              BG
            </label>
            <ColorPicker
              value={textConfiguration.backgroundColor === 'transparent' ? '#ffffff' : textConfiguration.backgroundColor}
              onChange={onBackgroundColorChange}
              size="sm"
            />
            <Button
              variant={textConfiguration.backgroundColor !== 'transparent' ? 'primary' : 'secondary'}
              onClick={() => onBackgroundColorChange('transparent')}
              className="h-7 px-2 text-xs font-medium rounded-lg"
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1 shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Opacity
            </label>
            <IconButton
              onMouseDown={() => startOpacityHold('decrement')}
              onMouseUp={stopAllHolds}
              onMouseLeave={stopAllHolds}
              onTouchStart={() => startOpacityHold('decrement')}
              onTouchEnd={stopAllHolds}
              size="xs"
              variant="standard"
              ariaLabel="Decrease opacity"
            >
              <FiMinus />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-9 text-center">
              {Math.round(textConfiguration.opacity * 100)}%
            </span>
            <IconButton
              onMouseDown={() => startOpacityHold('increment')}
              onMouseUp={stopAllHolds}
              onMouseLeave={stopAllHolds}
              onTouchStart={() => startOpacityHold('increment')}
              onTouchEnd={stopAllHolds}
              size="xs"
              variant="standard"
              ariaLabel="Increase opacity"
            >
              <FiPlus />
            </IconButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 shrink-0" />

          <div className="flex items-center gap-1.5 flex-1 min-w-25 max-w-45">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Family
            </label>
            <select
              value={textConfiguration.fontFamily}
              onChange={(changeEvent: React.ChangeEvent<HTMLSelectElement>) => onFontFamilyChange(changeEvent.target.value)}
              className="flex-1 min-w-15 px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              {AVAILABLE_FONTS.map((fontFamilyOption) => (
                <option key={fontFamilyOption} value={fontFamilyOption}>
                  {fontFamilyOption.split(',')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Position
          </label>
          <div className="flex gap-1 flex-1 min-w-25">
            {['top', 'bottom'].map((positionOption) => (
              <Button
                key={positionOption}
                variant={textConfiguration.position === positionOption ? 'primary' : 'secondary'}
                onClick={() => onPositionChange(positionOption as 'top' | 'bottom')}
                className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg capitalize"
              >
                {positionOption}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <IconButton
              onClick={onReset}
              disabled={!hasChanges}
              variant="standard"
              size="sm"
              ariaLabel="Reset text settings"
            >
              <FiRotateCcw />
            </IconButton>
            <span className="text-xs text-gray-400">Reset</span>
          </div>

          <Button
            variant="primary"
            onClick={onApply}
            disabled={isExporting || !textConfiguration.content.trim()}
            className="px-6 py-1.5 text-sm font-medium rounded-lg"
          >
            Apply Text
          </Button>
        </div>
      </div>
    </div>
  );
};