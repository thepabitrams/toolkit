// src/tools/media/background-remove/components/StatusMessage.tsx
import React, { useState, useEffect } from 'react';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface StatusMessageProps {
  status: 'idle' | 'loading' | 'processing' | 'ready' | 'error';
  errorMessage?: string | null;
  className?: string;
}

const PROCESSING_STEPS = [
  'Analyzing image pixels...',
  'Detecting foreground subject...',
  'Separating background layers...',
  'Refining edge details...',
  'Applying AI mask...',
  'Finalizing cutout...',
];

export const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  errorMessage,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setCurrentStepIndex((previousIndex) => (previousIndex + 1) % PROCESSING_STEPS.length);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setCurrentStepIndex(0);
    }
  }, [status]);

  if (status === 'idle') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 ${className}`}>
        <span>Ready to remove background</span>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
        <span>Downloading AI model (This may take a minute)...</span>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 w-full ${className}`}>
        <FiLoader className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
        <span className="animate-pulse transition-opacity duration-300">
          {PROCESSING_STEPS[currentStepIndex]}
        </span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-500 dark:text-red-400 ${className}`}>
        <FiAlertCircle className="w-4 h-4 shrink-0" />
        {errorMessage || 'Something went wrong'}
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}>
        <FiCheck className="w-4 h-4 shrink-0" />
        Background removed successfully
      </div>
    );
  }

  return null;
};