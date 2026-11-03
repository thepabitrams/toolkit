// src/tools/media/background-remove/components/StatusMessage.tsx
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

interface StatusMessageProps {
  status: 'idle' | 'loading' | 'processing' | 'ready' | 'error';
  errorMessage?: string | null;
  className?: string;
}

const DOWNLOADING_MESSAGES = [
  'Initializing neural network...',
  'Downloading AI model weights...',
  'Preparing WebGPU/WASM runtime...',
  'Compiling tensor operations...',
  'Allocating memory buffers...',
  'Establishing local inference engine...',
  'Optimizing model execution graph...',
  'Verifying model integrity...',
  'Starting background worker...',
  'Almost ready to process...',
];

const PROCESSING_MESSAGES = [
  'Analyzing image pixels...',
  'Detecting foreground subject...',
  'Separating background layers...',
  'Calculating alpha channel...',
  'Refining edge details...',
  'Removing background artifacts...',
  'Applying AI mask...',
  'Enhancing cutout precision...',
  'Finalizing transparent layer...',
  'Generating final output...',
];

export const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  errorMessage,
  className = '',
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const activeMessages =
    status === 'loading'
      ? DOWNLOADING_MESSAGES
      : status === 'processing'
      ? PROCESSING_MESSAGES
      : [];

  useEffect(() => {
    setMessageIndex(0);
  }, [status]);

  useEffect(() => {
    if (activeMessages.length === 0) return;
    const messageInterval = setInterval(() => {
      setMessageIndex((previousIndex) => (previousIndex + 1) % activeMessages.length);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, [activeMessages.length]);

  if (status === 'idle') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 ${className}`}>
        <span>Ready to remove background</span>
      </div>
    );
  }

  if (status === 'loading' || status === 'processing') {
    return (
      <div className={`flex items-center text-sm w-full ${className}`}>
        <style>{`
          @keyframes text-shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          .shimmer-text {
            background: linear-gradient(90deg, #9CA3AF 0%, #111827 50%, #9CA3AF 100%);
            background-size: 200% auto;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            color: transparent !important;
            -webkit-text-fill-color: transparent !important;
            animation: text-shimmer 2s linear infinite;
            display: inline-block;
            font-weight: 500;
          }
          .dark .shimmer-text {
            background: linear-gradient(90deg, #6B7280 0%, #F9FAFB 50%, #6B7280 100%);
            background-size: 200% auto;
          }
        `}</style>
        <span className="shimmer-text">
          {activeMessages[messageIndex]}
        </span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-500 dark:text-red-400 font-medium ${className}`}>
        <FiAlertCircle className="w-4 h-4 shrink-0" />
        <span className="line-clamp-2 leading-snug">{errorMessage || 'Something went wrong'}</span>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className={`flex items-center gap-2 text-sm text-[#1A73E8] dark:text-blue-400 font-medium ${className}`}>
        <FiCheck className="w-4 h-4 shrink-0" />
        <span>Background removed successfully</span>
      </div>
    );
  }

  return null;
};