import React, { type ReactNode, type HTMLAttributes } from 'react';
import { Motion } from '@/core/motion/motion';
import { cardMotion } from '@/core/motion/compositions/cardMotion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
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
}: CardProps) => {
  return (
    <Motion
      preset={hover ? cardMotion : undefined}
      as="div"
      className={`
        bg-white dark:bg-gray-900 
        rounded-2xl 
        border border-gray-200/50 dark:border-gray-800/50
        focus:outline-none
        ${className}
      `}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Motion>
  );
};