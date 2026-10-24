import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { spring } from '@/config/motion';

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
      transition={spring.snappy}
      className={`
        bg-white dark:bg-[#171b22] 
        rounded-2xl 
        border border-[rgba(15,21,34,0.08)] dark:border-[rgba(255,255,255,0.08)]
        focus:outline-none
        transition-shadow duration-300
        
        shadow-[0_1px_2px_rgba(15,21,34,0.06),0_4px_12px_-4px_rgba(15,21,34,0.15),0_10px_24px_-8px_rgba(15,21,34,0.15)]
        hover:shadow-[0_2px_4px_rgba(15,21,34,0.06),0_6px_16px_-4px_rgba(15,21,34,0.20),0_16px_32px_-10px_rgba(15,21,34,0.20)]
        
        dark:shadow-[0_0_15px_rgba(186,230,253,0.10)]
        dark:hover:shadow-[0_0_25px_rgba(186,230,253,0.20)]
        
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