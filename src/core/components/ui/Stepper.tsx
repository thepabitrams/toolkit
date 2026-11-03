// src/core/components/ui/Stepper.tsx
import React, { useRef, useCallback, useEffect } from 'react';

export interface StepperProperties {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export const Stepper: React.FC<StepperProperties> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}): React.JSX.Element => {
  const holdTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalReference = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestValueReference = useRef(value);

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  useEffect(() => {
    latestValueReference.current = value;
  }, [value]);

  const stopContinuousStep = useCallback(() => {
    if (holdTimeoutReference.current) clearTimeout(holdTimeoutReference.current);
    if (holdIntervalReference.current) clearInterval(holdIntervalReference.current);
    holdTimeoutReference.current = null;
    holdIntervalReference.current = null;
  }, []);

  const executeStep = useCallback((direction: 1 | -1) => {
    const nextValue = latestValueReference.current + (direction * step);
    const clampedValue = Math.max(min, Math.min(max, nextValue));
    latestValueReference.current = clampedValue;
    onChange(clampedValue);
  }, [min, max, step, onChange]);

  const startContinuousStep = useCallback((direction: 1 | -1) => {
    executeStep(direction);

    holdTimeoutReference.current = setTimeout(() => {
      holdIntervalReference.current = setInterval(() => {
        executeStep(direction);
      }, 50);
    }, 400);
  }, [executeStep]);

  const handleManualInput = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const parsedValue = parseFloat(changeEvent.target.value);
    if (!isNaN(parsedValue)) {
      const clampedValue = Math.max(min, Math.min(max, parsedValue));
      latestValueReference.current = clampedValue;
      onChange(clampedValue);
    }
  };

  useEffect(() => {
    return () => stopContinuousStep();
  }, [stopContinuousStep]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[#5F6368] dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
        {label}
      </label>
      
      <div className="flex items-center bg-[#F1F3F4] dark:bg-gray-800/80 rounded-lg p-1 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 transition-colors focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:border-[#1A73E8] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#1A73E8] dark:focus-within:ring-blue-500">
        <button
          onPointerDown={() => startContinuousStep(-1)}
          onPointerUp={stopContinuousStep}
          onPointerLeave={stopContinuousStep}
          onPointerCancel={stopContinuousStep}
          disabled={isAtMin}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-md transition-colors ${
            isAtMin 
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-transparent' 
              : 'text-[#5F6368] dark:text-gray-400 hover:bg-[#E8EAED] dark:hover:bg-gray-700 active:bg-[#DADCE0] dark:active:bg-gray-600'
          }`}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        
        <input
          type="number"
          value={value}
          onChange={handleManualInput}
          className="flex-1 w-full min-w-0 bg-transparent text-center text-[#202124] dark:text-white text-sm font-medium outline-none m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label={label}
        />
        
        <button
          onPointerDown={() => startContinuousStep(1)}
          onPointerUp={stopContinuousStep}
          onPointerLeave={stopContinuousStep}
          onPointerCancel={stopContinuousStep}
          disabled={isAtMax}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-md transition-colors ${
            isAtMax 
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-transparent' 
              : 'text-[#5F6368] dark:text-gray-400 hover:bg-[#E8EAED] dark:hover:bg-gray-700 active:bg-[#DADCE0] dark:active:bg-gray-600'
          }`}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
};