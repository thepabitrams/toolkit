// src/tools/media/image-filters/Controls.tsx
import React from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { Button, Stepper, IconButton } from '@/core/components/ui';
import type { FilterState, FilterKey } from './core/types';
import { FILTER_RANGES } from './core/constants';

interface ControlsProps {
  filterConfiguration: FilterState;
  onUpdateFilter: (key: FilterKey, value: number | boolean) => void;
  onResetFilters: () => void;
  hasConfigurationChanges: boolean;
  onApplyFilters: () => void;
  isExporting: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  filterConfiguration,
  onUpdateFilter,
  onResetFilters,
  hasConfigurationChanges,
  onApplyFilters,
  isExporting,
}): React.JSX.Element => {
  return (
    <div className="flex flex-col w-full gap-5 p-5 bg-transparent">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Stepper
          label="Brightness"
          value={filterConfiguration.brightness}
          min={FILTER_RANGES.brightness.min}
          max={FILTER_RANGES.brightness.max}
          step={1}
          onChange={(value) => onUpdateFilter('brightness', value)}
        />
        <Stepper
          label="Contrast"
          value={filterConfiguration.contrast}
          min={FILTER_RANGES.contrast.min}
          max={FILTER_RANGES.contrast.max}
          step={1}
          onChange={(value) => onUpdateFilter('contrast', value)}
        />
        <Stepper
          label="Saturation"
          value={filterConfiguration.saturation}
          min={FILTER_RANGES.saturation.min}
          max={FILTER_RANGES.saturation.max}
          step={1}
          onChange={(value) => onUpdateFilter('saturation', value)}
        />
        <Stepper
          label="Blur"
          value={filterConfiguration.blur}
          min={FILTER_RANGES.blur.min}
          max={FILTER_RANGES.blur.max}
          step={0.5}
          onChange={(value) => onUpdateFilter('blur', value)}
        />
        <Stepper
          label="Temperature"
          value={filterConfiguration.temperature}
          min={FILTER_RANGES.temperature.min}
          max={FILTER_RANGES.temperature.max}
          step={1}
          onChange={(value) => onUpdateFilter('temperature', value)}
        />
        <Stepper
          label="Sharpness"
          value={filterConfiguration.sharpness}
          min={FILTER_RANGES.sharpness.min}
          max={FILTER_RANGES.sharpness.max}
          step={1}
          onChange={(value) => onUpdateFilter('sharpness', value)}
        />
        <Stepper
          label="Highlights"
          value={filterConfiguration.highlights}
          min={FILTER_RANGES.highlights.min}
          max={FILTER_RANGES.highlights.max}
          step={1}
          onChange={(value) => onUpdateFilter('highlights', value)}
        />
        <Stepper
          label="Shadows"
          value={filterConfiguration.shadows}
          min={FILTER_RANGES.shadows.min}
          max={FILTER_RANGES.shadows.max}
          step={1}
          onChange={(value) => onUpdateFilter('shadows', value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {[
          { key: 'grayscale', label: 'Grayscale' },
          { key: 'sepia', label: 'Sepia' },
          { key: 'vintage', label: 'Vintage' },
          { key: 'noir', label: 'Noir' },
          { key: 'vignette', label: 'Vignette' },
          { key: 'hdr', label: 'HDR' },
        ].map((preset) => {
          const isActive = filterConfiguration[preset.key as keyof FilterState] as boolean;
          return (
            <button
              key={preset.key}
              onClick={() => onUpdateFilter(preset.key as FilterKey, !isActive)}
              className={`flex items-center justify-center px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0 ${
                isActive 
                  ? 'bg-[#E8F0FE] text-[#1967D2] border-transparent dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'bg-transparent text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
        <div className="flex items-center gap-1.5 cursor-pointer group" onClick={onResetFilters}>
          <IconButton
            variant="standard"
            size="sm"
            ariaLabel="Reset filters"
            disabled={!hasConfigurationChanges}
            className={!hasConfigurationChanges ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 group-hover:text-red-500 transition-colors'}
          >
            <FiRotateCcw className="w-4 h-4" />
          </IconButton>
          <span className={`text-xs ${hasConfigurationChanges ? 'text-gray-500 group-hover:text-red-500 transition-colors' : 'text-gray-300'}`}>
            Reset
          </span>
        </div>
        <Button onClick={onApplyFilters} disabled={isExporting} variant="primary" className="px-8 py-2 text-sm rounded-full shadow-sm">
          {isExporting ? 'Processing...' : 'Apply Filters'}
        </Button>
      </div>
    </div>
  );
};