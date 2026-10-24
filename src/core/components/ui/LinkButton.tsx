import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { spring } from '@/config/motion1';

export type LinkButtonVariant = 'primary' | 'secondary' | 'ghost' | 'monochrome';

interface LinkButtonProps extends Omit<HTMLMotionProps<"a">, "ref"> {
  children: ReactNode;
  variant?: LinkButtonVariant;
  className?: string;
}

export const LinkButton = ({
  children,
  variant = 'primary',
  className = '',
  ...remainingProps
}: LinkButtonProps): React.JSX.Element => {
  const variantStyles: Record<LinkButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-sm transition-all',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 transition-all',
    monochrome: 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm transition-colors duration-200',
  };

  return (
    <motion.a
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      className={`
        group inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg select-none cursor-pointer
        ${variantStyles[variant]}
        ${className}
      `}
      {...remainingProps}
    >
      {children}
    </motion.a>
  );
};