import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      prefix,
      suffix,
      fullWidth = true,
      id,
      disabled = false,
      required = false,
      type = 'text',
      onDoubleClick,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.currentTarget.select();
      if (onDoubleClick) onDoubleClick(e);
    };

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-800
            ${error 
              ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20' 
              : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}
            ${className}
          `}
        >
          {prefix && <span className="shrink-0 text-gray-500 dark:text-gray-400 text-sm">{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
            onDoubleClick={handleDoubleClick}
            {...props}
          />
          {suffix && <span className="shrink-0 text-gray-500 dark:text-gray-400 text-sm">{suffix}</span>}
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="text-xs">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };