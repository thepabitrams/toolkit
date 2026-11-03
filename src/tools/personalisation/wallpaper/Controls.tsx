// src/tools/personalisation/wallpaper/Controls.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ColorPicker, Input, Button } from '@/core/components/ui';

const DIMENSION_OPTIONS = [
  { value: '1920x1080', label: 'Desktop HD (1920×1080)' },
  { value: '1080x1920', label: 'Mobile Story (1080×1920)' },
  { value: '2048x2732', label: 'iPad Pro (2048×2732)' },
  { value: '1080x1080', label: 'Square (1080×1080)' },
  { value: 'custom', label: 'Custom' },
];

const FILE_TYPE_OPTIONS = [
  { value: 'png', label: 'PNG (Lossless)' },
  { value: 'jpeg', label: 'JPG (Smaller)' },
  { value: 'webp', label: 'WEBP (Modern)' },
];

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#FF7F00', 
  '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
];

interface ControlsProps {
  color: string;
  onColorChange: (colorValue: string) => void;
  width: number;
  height: number;
  onWidthChange: (widthValue: number) => void;
  onHeightChange: (heightValue: number) => void;
  fileType: 'png' | 'jpeg' | 'webp';
  onFileTypeChange: (typeValue: 'png' | 'jpeg' | 'webp') => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ChromeSpinner: React.FC = () => (
  <motion.svg
    viewBox="0 0 50 50"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    className="w-5 h-5 mr-2.5"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
  >
    <circle cx="25" cy="25" r="20" opacity="0.2" strokeWidth="4" />
    <motion.circle
      cx="25"
      cy="25"
      r="20"
      strokeWidth="4"
      animate={{
        strokeDasharray: ['1, 150', '90, 150', '90, 150'],
        strokeDashoffset: [0, -35, -124],
      }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
    />
  </motion.svg>
);

export const Controls: React.FC<ControlsProps> = ({
  color, onColorChange, width, height, onWidthChange, onHeightChange,
  fileType, onFileTypeChange, onGenerate, isGenerating
}): React.JSX.Element => {
  const findPreset = (currentWidth: number, currentHeight: number) => {
    const matchedOption = DIMENSION_OPTIONS.find(
      (option) => option.value !== 'custom' && option.value === `${currentWidth}x${currentHeight}`
    );
    return matchedOption ? matchedOption.value : 'custom';
  };

  const [selectedPreset, setSelectedPreset] = useState(findPreset(width, height));

  useEffect(() => {
    setSelectedPreset(findPreset(width, height));
  }, [width, height]);

  const handleDimensionChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    if (presetValue === 'custom') return;
    const [newWidth, newHeight] = presetValue.split('x').map(Number);
    if (newWidth && newHeight) {
      onWidthChange(newWidth);
      onHeightChange(newHeight);
    }
  };

  const isCustom = selectedPreset === 'custom';

  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent">
      <style>{`
        @keyframes typing-dots {
          0%, 100% { content: ""; }
          20% { content: "."; }
          40% { content: ".."; }
          60% { content: "..."; }
        }
        .loading-dots::after {
          content: "...";
          display: inline-block;
          width: 16px;
          text-align: left;
          animation: typing-dots 1.5s steps(1, end) infinite;
        }
      `}</style>

      <div className="flex flex-col gap-1.5">
        <label className="text-[#5F6368] dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
          Wallpaper Color
        </label>
        <div className="flex items-center gap-3">
          <ColorPicker value={color} onChange={onColorChange} size="md" />
          <Input
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 h-11"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {PRESET_COLORS.map((hexValue) => (
            <button
              key={hexValue}
              className={`w-8 h-8 rounded-full border-2 transition-all outline-none focus:outline-none ${
                color === hexValue
                  ? 'border-[#1A73E8] scale-110 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:scale-110'
              }`}
              style={{ backgroundColor: hexValue }}
              onClick={() => onColorChange(hexValue)}
              aria-label={`Select color ${hexValue}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[#5F6368] dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
          Dimensions
        </label>
        <select
          value={selectedPreset}
          onChange={(e) => handleDimensionChange(e.target.value)}
          className="w-full h-11 px-3 text-sm bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white cursor-pointer transition-colors truncate"
        >
          {DIMENSION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {isCustom && (
          <div className="flex gap-3 mt-1">
            <div className="flex-1">
              <label className="text-[11px] text-gray-500 dark:text-gray-400">Width</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => onWidthChange(Number(e.target.value))}
                min={1}
                className="w-full h-11"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-gray-500 dark:text-gray-400">Height</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => onHeightChange(Number(e.target.value))}
                min={1}
                className="w-full h-11"
              />
            </div>
          </div>
        )}
        <div className="text-xs text-[#5F6368] dark:text-gray-400 text-right mt-0.5">
          {width} × {height} px
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[#5F6368] dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
          Export Format
        </label>
        <select
          value={fileType}
          onChange={(e) => onFileTypeChange(e.target.value as 'png' | 'jpeg' | 'webp')}
          className="w-full h-11 px-3 text-sm bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white cursor-pointer transition-colors truncate"
        >
          {FILE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        variant="primary"
        className={`w-full h-12 rounded-full transition-all duration-300 flex items-center justify-center font-medium mt-2 ${
          isGenerating 
            ? 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#E8F0FE] dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30 shadow-none' 
            : ''
        }`}
      >
        {isGenerating ? (
          <>
            <ChromeSpinner />
            <span className="relative flex items-center">
              Generating<span className="loading-dots"></span>
            </span>
          </>
        ) : (
          'Generate Wallpaper'
        )}
      </Button>
    </div>
  );
};