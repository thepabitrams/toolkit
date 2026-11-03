// src/tools/media/background-remove/remove/RemoveControls.tsx
import React from 'react';
import { motion } from 'motion/react';
import { FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/core/components/ui';
import { StatusMessage } from '../components/StatusMessage';
import '../style/animations.css';

interface RemoveControlsProps {
  status: 'idle' | 'loading' | 'processing' | 'ready' | 'error';
  errorMessage?: string | null;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onGenerate: () => void;
  onRetry: () => void;
  availableModels: { id: string; name: string }[];
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

export const RemoveControls: React.FC<RemoveControlsProps> = ({
  status, errorMessage, selectedModelId, onModelChange, onGenerate, onRetry, availableModels
}): React.JSX.Element => {
  const isBusy = status === 'loading' || status === 'processing';
  const isError = status === 'error';
  const isReady = status === 'ready';

  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent">
      <div className="flex flex-col gap-1.5">
        <label className="text-[#5F6368] dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
          AI Model
        </label>
        <select
          value={selectedModelId}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={isBusy}
          className="w-full h-11 px-3 text-sm bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white cursor-pointer transition-colors truncate disabled:opacity-50"
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
      </div>

      <div className="min-h-11 flex items-center px-1">
        <StatusMessage status={status} errorMessage={errorMessage} />
      </div>

      <Button
        onClick={isError ? onRetry : onGenerate}
        disabled={isBusy}
        variant="primary"
        className={`w-full h-12 rounded-full transition-all duration-300 flex items-center justify-center font-medium ${
          isBusy 
            ? 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#E8F0FE] dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30 shadow-none' 
            : ''
        }`}
      >
        {isBusy ? (
          <>
            <ChromeSpinner />
            <span className="relative flex items-center">
              {/* 👈 Use the imported class */}
              Processing<span className="br-loading-dots"></span>
            </span>
          </>
        ) : isError ? (
          <><FiRefreshCw className="w-4 h-4 mr-2" /> Retry</>
        ) : isReady ? (
          <><FiRefreshCw className="w-4 h-4 mr-2" /> Remove Again</>
        ) : (
          'Remove Background'
        )}
      </Button>
    </div>
  );
};