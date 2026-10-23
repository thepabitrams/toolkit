import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
  ...rest
}: CardProps): React.JSX.Element => {
  return (
    <motion.div
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        bg-white dark:bg-gray-900 
        rounded-2xl 
        border border-slate-300 dark:border-gray-700
        focus:outline-none
        shadow-sm 
        dark:shadow-white/30
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.div>
  );
};