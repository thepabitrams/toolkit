import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fullWidth?: boolean;
}

const inputStyles = {
  wrapper: 'flex flex-col gap-1.5 w-full',
  container: (error?: boolean, className?: string) => {
    const classList = [
      'flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5',
      'transition-all duration-200 ease-out',
      'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      error
        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20'
        : 'border-gray-300 dark:border-gray-600',
      className
    ];
    return classList.filter(Boolean).join(' ');
  },
  field: (className?: string) => {
    const classList = [
      'w-full bg-transparent outline-none text-base text-gray-900 dark:text-white',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500',
      'min-w-0',
      'selection:bg-blue-500/30 dark:selection:bg-blue-400/30',
      className
    ];
    return classList.filter(Boolean).join(' ');
  },
};

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
      <div className={`${inputStyles.wrapper} ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className={inputStyles.container(!!error, className)}>
          {prefix && (
            <span className="shrink-0 text-gray-500 dark:text-gray-400 text-sm">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className={inputStyles.field()}
            onDoubleClick={handleDoubleClick}
            {...props}
          />
          {suffix && (
            <span className="shrink-0 text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}
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