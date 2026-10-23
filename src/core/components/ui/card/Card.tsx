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
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        bg-white dark:bg-gray-900 
        rounded-2xl 
        border border-gray-200/50 dark:border-gray-800/50
        focus:outline-none
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