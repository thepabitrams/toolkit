// src/tools/media/image-converter/components/ConverterPanel.tsx
import { motion } from 'motion/react';
import { Button } from '@/core/components/ui/Button';
import { Spinner } from '@/core/components/ui/Spinner';
import { spring } from '@/config/motion';
import type { OutputFormat } from '../useImageConverter';

interface OutputFormatOption {
  value: OutputFormat;
  label: string;
  supportsQuality: boolean;
}

const SUPPORTED_OUTPUT_FORMATS: OutputFormatOption[] = [
  { value: 'image/jpeg', label: 'JPG', supportsQuality: true },
  { value: 'image/png', label: 'PNG', supportsQuality: false },
  { value: 'image/webp', label: 'WebP', supportsQuality: true },
  { value: 'image/avif', label: 'AVIF', supportsQuality: true },
  { value: 'image/jxl', label: 'JXL', supportsQuality: true },
  { value: 'image/bmp', label: 'BMP', supportsQuality: false },
  { value: 'image/gif', label: 'GIF', supportsQuality: false },
  { value: 'image/ico', label: 'ICO', supportsQuality: false },
  { value: 'image/tga', label: 'TGA', supportsQuality: false },
  { value: 'image/tiff', label: 'TIFF', supportsQuality: false },
];

interface ConverterPanelProps {
  selectedFormat: OutputFormat;
  outputQuality: number;
  isConverting: boolean;
  progressPercent: number;
  conversionError: string | null;
  onFormatChange: (format: OutputFormat) => void;
  onOutputQualityChange: (outputQuality: number) => void;
  onConvert: () => void;
}

export const ConverterPanel: React.FC<ConverterPanelProps> = ({
  selectedFormat,
  outputQuality,
  isConverting,
  conversionError,
  onFormatChange,
  onOutputQualityChange,
  onConvert,
}): React.JSX.Element => {
  const activeFormatOption =
    SUPPORTED_OUTPUT_FORMATS.find((option) => option.value === selectedFormat) ??
    SUPPORTED_OUTPUT_FORMATS[0];

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Output Format
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {SUPPORTED_OUTPUT_FORMATS.map((formatOption) => (
            <motion.button
              key={formatOption.value}
              onClick={() => onFormatChange(formatOption.value)}
              whileTap={{ scale: 0.96 }}
              transition={spring.snappy}
              className={`
                px-2 py-1.5 text-xs font-medium rounded-lg
                transition-colors duration-200
                ${
                  selectedFormat === formatOption.value
                    ? 'bg-blue-500 text-white shadow-sm ring-1 ring-blue-600/50'
                    : 'bg-gray-100 dark:bg-[#1e242d]/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1e242d] border border-transparent dark:border-gray-700/50'
                }
              `}
            >
              {formatOption.label}
            </motion.button>
          ))}
        </div>
      </div>

      {activeFormatOption.supportsQuality && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Quality
            </label>
            <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
              {outputQuality}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={outputQuality}
            onChange={(event) => onOutputQualityChange(parseInt(event.target.value, 10))}
            className="w-full accent-blue-500"
          />
        </div>
      )}

      {conversionError && (
        <p className="text-xs text-red-500 text-center">{conversionError}</p>
      )}

      <div className="mt-auto">
        <Button
          onClick={onConvert}
          variant="primary"
          className={`w-full h-12 rounded-full transition-all duration-300 flex items-center justify-center font-medium ${
            isConverting 
              ? 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#E8F0FE] dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30 shadow-none' 
              : ''
          }`}
          disabled={isConverting}
        >
          {isConverting ? (
            <>
              <Spinner className="w-5 h-5 mr-2.5" />
              <span className="relative flex items-center">
                Converting<span className="br-loading-dots"></span>
              </span>
            </>
          ) : (
            'Convert'
          )}
        </Button>
      </div>
    </div>
  );
};