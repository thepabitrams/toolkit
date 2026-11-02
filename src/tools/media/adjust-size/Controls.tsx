// src/tools/media/adjust-size/Controls.tsx
import React from 'react';
import { Button } from '@/core/components/ui/Button';
import { Input } from '@/core/components/ui/Input';

interface ControlsProps {
  minSizeKB: number;
  maxSizeKB: number;
  onMinSizeChange: (value: number) => void;
  onMaxSizeChange: (value: number) => void;
  onProcess: () => void;
  isProcessing: boolean;
  hasActiveFile: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  minSizeKB,
  maxSizeKB,
  onMinSizeChange,
  onMaxSizeChange,
  onProcess,
  isProcessing,
  hasActiveFile,
}): React.JSX.Element => {
  const handleInputFocus = (focusEvent: React.FocusEvent<HTMLInputElement>): void => {
    focusEvent.target.select();
  };

  const isSizeRangeInvalid = minSizeKB >= maxSizeKB && minSizeKB > 0 && maxSizeKB > 0;

  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        Adjust File Size
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Min Size (KB)
          </label>
          <Input
            type="number"
            min="1"
            value={minSizeKB}
            onChange={(changeEvent) => onMinSizeChange(Number(changeEvent.target.value))}
            onFocus={handleInputFocus}
            fullWidth
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Max Size (KB)
          </label>
          <Input
            type="number"
            min="1"
            value={maxSizeKB}
            onChange={(changeEvent) => onMaxSizeChange(Number(changeEvent.target.value))}
            onFocus={handleInputFocus}
            fullWidth
          />
        </div>
      </div>

      {isSizeRangeInvalid && (
        <p className="text-xs text-red-500 dark:text-red-400 -mt-2">
          Min must be less than Max
        </p>
      )}

      <Button
        onClick={onProcess}
        disabled={!hasActiveFile || isProcessing || isSizeRangeInvalid}
        variant="primary"
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Adjust File Size'}
      </Button>
    </div>
  );
};