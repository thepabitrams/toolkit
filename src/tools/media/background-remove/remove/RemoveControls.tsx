// src/tools/media/background-remove/remove/RemoveControls.tsx
import React from 'react';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/core/components/ui';
import { StatusMessage } from '../components/StatusMessage';

interface RemoveControlsProps {
  status: 'idle' | 'loading' | 'processing' | 'ready' | 'error';
  progress: number;
  errorMessage?: string | null;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onGenerate: () => void;
  onRetry: () => void;
  availableModels: { id: string; name: string }[];
}

export const RemoveControls: React.FC<RemoveControlsProps> = ({
  status, progress, errorMessage, selectedModelId, onModelChange, onGenerate, onRetry, availableModels
}): React.JSX.Element => {
  const isBusy = status === 'loading' || status === 'processing';
  const isError = status === 'error';

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
          className="w-full h-11 px-3 text-sm bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white cursor-pointer transition-colors truncate"
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
      </div>

      <div className="min-h-11 flex items-center px-1">
        <StatusMessage status={status} progress={progress} errorMessage={errorMessage} />
      </div>

      <Button
        onClick={isError ? onRetry : onGenerate}
        disabled={isBusy}
        variant="primary"
        className="w-full py-2.5 rounded-full"
      >
        {isBusy ? (
          <><FiLoader className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
        ) : isError ? (
          <><FiRefreshCw className="w-4 h-4 mr-2" /> Retry</>
        ) : (
          'Remove Background'
        )}
      </Button>
    </div>
  );
};