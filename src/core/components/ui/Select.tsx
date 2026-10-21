// src/core/components/ui/Select.tsx
import React, { useEffect } from 'react';
import { Motion } from '@/core/motion/motion';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  selectOptions: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MotionSelect = Motion as React.ComponentType<
  React.SelectHTMLAttributes<HTMLSelectElement> & { preset?: any; as?: React.ElementType }
>;

export const Select: React.FC<SelectProps> = ({
  selectOptions,
  selectedValue,
  onValueChange,
  placeholder,
  className = '',
  ...remainingProps
}) => {

  useEffect(() => {
    const selectOpenStyleId = 'select-open-glow';
    if (!document.getElementById(selectOpenStyleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = selectOpenStyleId;
      styleElement.textContent = `
        select:open {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          outline: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <MotionSelect
      as="select"
      value={selectedValue}
      onChange={(changeEvent: React.ChangeEvent<HTMLSelectElement>) => onValueChange(changeEvent.target.value)}
      className={`
        px-2 py-1.5
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg
        text-sm text-gray-900 dark:text-gray-100
        truncate
        transition-colors duration-200 ease-out
        focus:outline-none
        ${className}
      `}
      {...remainingProps}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {selectOptions.map((optionItem) => (
        <option key={optionItem.value} value={optionItem.value}>
          {optionItem.label}
        </option>
      ))}
    </MotionSelect>
  );
};