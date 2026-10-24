import React, { useRef } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  showLabel?: boolean;
}

const colorPickerStyles = {
  sizes: {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  },
  base: (size: 'sm' | 'md' | 'lg' = 'sm', className?: string) => {
    const classList = [
      colorPickerStyles.sizes[size],
      'p-0 border-0 rounded-lg cursor-pointer bg-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'flex-shrink-0',
      className
    ];
    return classList.filter(Boolean).join(' ');
  },
  label: 'text-xs font-medium text-gray-600 dark:text-gray-400',
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'sm',
  className = '',
  label,
  showLabel = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {showLabel && label && (
        <label className={colorPickerStyles.label}>{label}</label>
      )}
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={colorPickerStyles.base(size)}
      />
    </div>
  );
};

export default ColorPicker;