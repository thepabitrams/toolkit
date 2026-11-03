// src/tools/media/image-filters/Controls.tsx
import React from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { Button, Stepper } from '@/core/components/ui';
import { useMobile } from '@/core/hooks/useMobile';
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
  const isMobileViewport = useMobile(768);

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">
      
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Stepper label="Brightness" value={filterConfiguration.brightness} min={FILTER_RANGES.brightness.min} max={FILTER_RANGES.brightness.max} step={1} onChange={(value) => onUpdateFilter('brightness', value)} />
          <Stepper label="Contrast" value={filterConfiguration.contrast} min={FILTER_RANGES.contrast.min} max={FILTER_RANGES.contrast.max} step={1} onChange={(value) => onUpdateFilter('contrast', value)} />
          <Stepper label="Saturation" value={filterConfiguration.saturation} min={FILTER_RANGES.saturation.min} max={FILTER_RANGES.saturation.max} step={1} onChange={(value) => onUpdateFilter('saturation', value)} />
          <Stepper label="Blur" value={filterConfiguration.blur} min={FILTER_RANGES.blur.min} max={FILTER_RANGES.blur.max} step={0.5} onChange={(value) => onUpdateFilter('blur', value)} />
          <Stepper label="Temperature" value={filterConfiguration.temperature} min={FILTER_RANGES.temperature.min} max={FILTER_RANGES.temperature.max} step={1} onChange={(value) => onUpdateFilter('temperature', value)} />
          <Stepper label="Sharpness" value={filterConfiguration.sharpness} min={FILTER_RANGES.sharpness.min} max={FILTER_RANGES.sharpness.max} step={1} onChange={(value) => onUpdateFilter('sharpness', value)} />
          <Stepper label="Highlights" value={filterConfiguration.highlights} min={FILTER_RANGES.highlights.min} max={FILTER_RANGES.highlights.max} step={1} onChange={(value) => onUpdateFilter('highlights', value)} />
          <Stepper label="Shadows" value={filterConfiguration.shadows} min={FILTER_RANGES.shadows.min} max={FILTER_RANGES.shadows.max} step={1} onChange={(value) => onUpdateFilter('shadows', value)} />
          <Stepper label="Exposure" value={filterConfiguration.exposure} min={FILTER_RANGES.exposure.min} max={FILTER_RANGES.exposure.max} step={1} onChange={(value) => onUpdateFilter('exposure', value)} />
          <Stepper label="Hue" value={filterConfiguration.hue} min={FILTER_RANGES.hue.min} max={FILTER_RANGES.hue.max} step={1} onChange={(value) => onUpdateFilter('hue', value)} />
          <Stepper label="Posterize" value={filterConfiguration.posterize} min={FILTER_RANGES.posterize.min} max={FILTER_RANGES.posterize.max} step={1} onChange={(value) => onUpdateFilter('posterize', value)} />
          <Stepper label="Invert" value={filterConfiguration.invert} min={FILTER_RANGES.invert.min} max={FILTER_RANGES.invert.max} step={1} onChange={(value) => onUpdateFilter('invert', value)} />
        </div>
      </div>

      <div className={`shrink-0 overflow-y-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 p-3 sm:p-4 ${isMobileViewport ? 'h-22' : 'max-h-30'}`}>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'grayscale', label: 'Grayscale' },
            { key: 'sepia', label: 'Sepia' },
            { key: 'vintage', label: 'Vintage' },
            { key: 'noir', label: 'Noir' },
            { key: 'vignette', label: 'Vignette' },
            { key: 'hdr', label: 'HDR' },
            { key: 'clarendon', label: 'Clarendon' },
            { key: 'moon', label: 'Moon' },
            { key: 'cyberpunk', label: 'Cyberpunk' },
          ].map((preset) => {
            const isActive = filterConfiguration[preset.key as keyof FilterState] as boolean;
            return (
              <button
                key={preset.key}
                onClick={() => onUpdateFilter(preset.key as FilterKey, !isActive)}
                className={`flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors border outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0 ${
                  isActive 
                    ? 'bg-[#E8F0FE] text-[#1967D2] border-transparent dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-white dark:bg-transparent text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-10 gap-4">
        <button
          onClick={onResetFilters}
          disabled={!hasConfigurationChanges}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors outline-none focus:outline-none shrink-0 ${
            hasConfigurationChanges 
              ? 'text-[#5F6368] dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <FiRotateCcw className="w-4 h-4" />
          Reset
        </button>

        <Button 
          onClick={onApplyFilters} 
          disabled={isExporting} 
          variant="primary" 
          className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 text-sm rounded-full shadow-sm"
        >
          {isExporting ? 'Processing...' : 'Apply Filters'}
        </Button>
      </div>
      
    </div>
  );
};