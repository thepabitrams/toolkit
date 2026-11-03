// src/tools/media/add-text/Controls.tsx
import React from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { Button, Stepper } from '@/core/components/ui';
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
  return (
    <div className="flex flex-col w-full gap-5 p-5 bg-transparent">
      
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <div className="flex-1 w-full">
          <Textarea
            value={textConfiguration.content}
            onChange={(changeEvent) => onTextChange(changeEvent.target.value)}
            placeholder="Type your text here..."
            rows={2}
            className="w-full"
          />
        </div>

        <div className="flex gap-2 shrink-0 sm:pt-1">
          <button
            onClick={onToggleBold}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border font-bold text-sm transition-colors outline-none focus:outline-none ${
              textConfiguration.fontWeight === 'bold'
                ? 'bg-[#E8F0FE] text-[#1967D2] border-transparent dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-transparent text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            B
          </button>
          <button
            onClick={onToggleItalic}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border italic text-sm transition-colors outline-none focus:outline-none ${
              textConfiguration.fontStyle === 'italic'
                ? 'bg-[#E8F0FE] text-[#1967D2] border-transparent dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-transparent text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'
            }`}
          >
            I
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stepper
          label="Size"
          value={textConfiguration.fontSize}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          step={1}
          onChange={onFontSizeChange}
        />
        <Stepper
          label="Opacity"
          value={Math.round(textConfiguration.opacity * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(value) => onOpacityChange(value / 100)}
        />
      </div>

      <hr className="border-gray-200 dark:border-gray-700 my-1" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-16">
            <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
              Font
            </label>
          </div>
          <div className="w-24">
            <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
              BG
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
              Family
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 flex items-center h-[44px]">
            <ColorPicker
              value={textConfiguration.color}
              onChange={onColorChange}
              size="md"
            />
          </div>
          
          <div className="w-24 flex items-center gap-2 h-[44px]">
            <ColorPicker
              value={textConfiguration.backgroundColor === 'transparent' ? '#ffffff' : textConfiguration.backgroundColor}
              onChange={onBackgroundColorChange}
              size="md"
            />
            <button
              onClick={() => onBackgroundColorChange('transparent')}
              className="flex items-center justify-center w-8 h-8 rounded-md text-[#9AA0A6] hover:bg-[#F1F3F4] hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors outline-none focus:outline-none"
              title="Clear background"
              aria-label="Clear background"
            >
              <MdDeleteOutline className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <select
              value={textConfiguration.fontFamily}
              onChange={(changeEvent: React.ChangeEvent<HTMLSelectElement>) => onFontFamilyChange(changeEvent.target.value)}
              className="w-full h-[44px] px-3 text-sm bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white cursor-pointer transition-colors truncate"
            >
              {AVAILABLE_FONTS.map((fontFamilyOption) => (
                <option key={fontFamilyOption} value={fontFamilyOption}>
                  {fontFamilyOption.split(',')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 my-1" />

      <div className="flex flex-col gap-1.5">
        <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
          Position
        </label>
        <div className="flex bg-[#F1F3F4] dark:bg-gray-800/80 p-1 rounded-lg h-[44px] border border-transparent w-full">
          {['top', 'bottom'].map((positionOption) => {
            const isActive = textConfiguration.position === positionOption;
            return (
              <button
                key={positionOption}
                onClick={() => onPositionChange(positionOption as 'top' | 'bottom')}
                className={`flex-1 text-sm font-medium rounded-md capitalize transition-colors outline-none focus:outline-none ${
                  isActive 
                    ? 'bg-white dark:bg-gray-700 text-[#1A73E8] dark:text-blue-400 shadow-sm' 
                    : 'text-[#5F6368] dark:text-gray-400 hover:text-[#202124] dark:hover:text-white'
                }`}
              >
                {positionOption}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
        <button
          onClick={onReset}
          disabled={!hasChanges}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors outline-none focus:outline-none ${
            hasChanges 
              ? 'text-[#5F6368] dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <FiRotateCcw className="w-4 h-4" />
          Reset
        </button>

        <Button
          variant="primary"
          onClick={onApply}
          disabled={isExporting || !textConfiguration.content.trim()}
          className="px-8 py-2 text-sm font-medium rounded-full shadow-sm"
        >
          {isExporting ? 'Processing...' : 'Apply Text'}
        </Button>
      </div>
      
    </div>
  );
};