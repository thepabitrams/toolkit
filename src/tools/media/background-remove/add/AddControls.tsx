// src/tools/media/background-remove/add/AddControls.tsx
import React from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { Button, ColorPicker } from '@/core/components/ui';

interface AddControlsProps {
  backgroundColor: string | null;
  onColorChange: (color: string | null) => void;
  outputFormat: 'png' | 'jpeg' | 'webp';
  onFormatChange: (format: 'png' | 'jpeg' | 'webp') => void;
  onApply: () => void;
}

export const AddControls: React.FC<AddControlsProps> = ({
  backgroundColor, onColorChange, outputFormat, onFormatChange, onApply
}): React.JSX.Element => {
  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent">
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
            BG Color
          </label>
          <div className="flex items-center justify-between h-11 px-3 bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg transition-colors">
            <ColorPicker
              value={backgroundColor || '#ffffff'}
              onChange={(val) => onColorChange(val)}
              size="md"
            />
            <button
              onClick={() => onColorChange(null)}
              className="flex items-center justify-center w-7 h-7 rounded-md text-[#9AA0A6] hover:bg-[#E8EAED] hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-colors outline-none focus:outline-none"
              title="Make transparent"
            >
              <MdDeleteOutline className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
            Format
          </label>
          <select
            value={outputFormat}
            onChange={(e) => onFormatChange(e.target.value as 'png' | 'jpeg' | 'webp')}
            className="w-full h-11 px-2 text-sm bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white cursor-pointer transition-colors truncate"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      <Button onClick={onApply} variant="primary" className="w-full py-2.5 rounded-full mt-1">
        Apply Background
      </Button>
    </div>
  );
};