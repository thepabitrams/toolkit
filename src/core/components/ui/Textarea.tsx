import React, { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  className?: string;
}

const textareaStyles = {
  container: (error?: boolean, className?: string) => {
    const classList = [
      'flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5',
      'transition-all duration-200 ease-out',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      error
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
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
  resize: 'resize-none min-h-[48px]',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 2, error, ...rest }, ref) => {
    const combined = `
      ${textareaStyles.container(error, className)}
      ${textareaStyles.field()}
      ${textareaStyles.resize}
    `;
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={combined}
        {...rest}
      />
    );
  }
);

Textarea.displayName = 'Textarea';