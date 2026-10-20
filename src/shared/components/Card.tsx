import React, { type ReactNode, type HTMLAttributes } from 'react';

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
    <div
      className={`
        bg-white dark:bg-gray-900 
        rounded-2xl 
        border border-gray-200/50 dark:border-gray-800/50
        focus:outline-none
        ${hover ? 'transition-all duration-200 hover:border-blue-500 hover:shadow-md cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};