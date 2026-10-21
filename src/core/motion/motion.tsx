// src/core/motion/motion.tsx
import React from 'react';
import { injectKeyframes } from './core/injection/keyframes';

interface Preset {
  name: string;
  keyframes: string;
  duration: number;
  easing: string;
}

type MotionPreset =
  | Preset
  | (() => { className: string; style?: Record<string, any> })
  | string
  | { className: string; style?: Record<string, any> };

interface MotionProps {
  preset: MotionPreset;
  as?: React.ElementType;
  duration?: number;
  easing?: string;
  delay?: number;
  className?: string;
  style?: Record<string, any>;
  children?: React.ReactNode;
  show?: boolean;
}

export function getMotion(
  preset: MotionPreset,
  options?: {
    duration?: number;
    easing?: string;
    delay?: number;
    className?: string;
    style?: Record<string, any>;
  }
): { className: string; style: Record<string, any> } {
  if (typeof preset === 'object' && preset !== null && 'name' in preset && 'keyframes' in preset) {
    const p = preset as Preset;
    injectKeyframes(p.name, p.keyframes);

    const duration = options?.duration ?? p.duration ?? 200;
    const easing = options?.easing ?? p.easing ?? 'ease';

    let style = { ...(options?.style || {}) };
    
    style = {
      ...style,
      animationName: p.name,
      animationDuration: `${duration}ms`,
      animationTimingFunction: easing,
      animationFillMode: 'both',
    };

    if (options?.delay !== undefined) {
      style = {
        ...style,
        animationDelay: `${options.delay}ms`,
      };
    }

    let className = options?.className || '';

    return {
      className,
      style,
    };
  }

  if (typeof preset === 'function') {
    const result = preset();
    const mergedStyle = { ...(result.style || {}), ...(options?.style || {}) };
    return {
      className: (result.className || '') + (options?.className ? ` ${options.className}` : ''),
      style: mergedStyle,
    };
  }

  if (typeof preset === 'string') {
    return {
      className: preset + (options?.className ? ` ${options.className}` : ''),
      style: options?.style ?? {},
    };
  }

  if (typeof preset === 'object' && preset !== null && 'className' in preset) {
    const result = preset as { className: string; style?: Record<string, any> };
    const mergedStyle = { ...(result.style || {}), ...(options?.style || {}) };
    return {
      className: (result.className || '') + (options?.className ? ` ${options.className}` : ''),
      style: mergedStyle,
    };
  }

  return {
    className: options?.className || '',
    style: options?.style || {},
  };
}

// ✅ UPDATED: Wrapped in React.forwardRef to accept 'ref' props
export const Motion = React.forwardRef<
  HTMLElement,
  MotionProps & React.HTMLAttributes<HTMLElement>
>(({
  preset,
  as: Component = 'div',
  duration,
  easing,
  delay,
  className = '',
  style = {},
  children,
  show,
  ...props
}, ref) => {
  const result = getMotion(preset, { duration, easing, delay, className, style });

  // Cast to React.ElementType to prevent TS errors when passing the ref
  const Tag = Component as React.ElementType;

  return (
    <Tag ref={ref} className={result.className} style={result.style} {...props}>
      {children}
    </Tag>
  );
});

Motion.displayName = 'Motion';