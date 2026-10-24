import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { spring } from '@/config/motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
}

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...remainingProps
}: ButtonProps): React.JSX.Element => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 hover:shadow-sm transition-all',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white shadow-sm hover:shadow-md transition-all',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={spring.snappy}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg select-none cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${className}
      `}
      {...remainingProps}
    >
      {children}
    </motion.button>
  );
};