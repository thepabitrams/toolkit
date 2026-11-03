// src/tools/productivity/infinite-type/Controls.tsx
import React from 'react';
import { FiPlay, FiSquare, FiCopy } from 'react-icons/fi';
import { Button, Input, Card } from '@/core/components/ui';

interface TypingStatistics {
  charsPerMinute: number;
  accuracyPercentage: string;
  totalKeys: number;
  totalErrors: number;
  elapsedTime: string;
}

interface ControlsProps {
  characterPool: string;
  isSessionActive: boolean;
  onPoolChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  onCopyStats: () => void;
  statistics: TypingStatistics;
}

export const Controls: React.FC<ControlsProps> = ({
  characterPool,
  isSessionActive,
  onPoolChange,
  onStart,
  onStop,
  onCopyStats,
  statistics,
}): React.JSX.Element => {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-35">
            <label className="text-[#5F6368] dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5 block">
              Character Pool
            </label>
            <Input
              value={characterPool}
              onChange={(event) => onPoolChange(event.target.value)}
              disabled={isSessionActive}
              spellCheck={false}
              className="font-mono text-sm w-full h-11"
            />
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            {!isSessionActive ? (
              <Button onClick={onStart} variant="primary" className="h-11 px-6 rounded-full">
                <FiPlay className="mr-2" /> Start
              </Button>
            ) : (
              <Button onClick={onStop} variant="secondary" className="h-11 px-6 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                <FiSquare className="mr-2" /> Stop
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 pt-4 text-sm border-t border-gray-200 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400">
            CPM <strong className="text-gray-900 dark:text-white font-mono ml-1">{statistics.charsPerMinute}</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Acc <strong className="text-gray-900 dark:text-white font-mono ml-1">{statistics.accuracyPercentage}%</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Keys <strong className="text-gray-900 dark:text-white font-mono ml-1">{statistics.totalKeys}</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Errors <strong className="text-gray-900 dark:text-white font-mono ml-1">{statistics.totalErrors}</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Time <strong className="text-gray-900 dark:text-white font-mono ml-1">{statistics.elapsedTime}</strong>
          </span>
          <button
            onClick={onCopyStats}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors outline-none focus:outline-none"
            aria-label="Copy stats"
            type="button"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
};