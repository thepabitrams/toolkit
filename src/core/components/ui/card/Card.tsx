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
        bg-white dark:bg-[#171b22] 
        rounded-2xl 
        border border-[rgba(15,21,34,0.08)] dark:border-[rgba(255,255,255,0.08)]
        focus:outline-none
        transition-shadow duration-300
        
        /* LIGHT MODE SHADOW - Tightened */
        shadow-[0_1px_2px_rgba(15,21,34,0.06),0_4px_12px_-4px_rgba(15,21,34,0.15),0_10px_24px_-8px_rgba(15,21,34,0.15)]
        hover:shadow-[0_2px_4px_rgba(15,21,34,0.06),0_6px_16px_-4px_rgba(15,21,34,0.20),0_16px_32px_-10px_rgba(15,21,34,0.20)]
        
        /* DARK MODE SHADOW - Tightened */
        dark:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_2px_8px_-2px_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(255,255,255,0.12),0_0_24px_-6px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.10)]
        dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_4px_12px_-2px_rgba(255,255,255,0.12),0_12px_32px_-8px_rgba(255,255,255,0.16),0_0_32px_-6px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]
        
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