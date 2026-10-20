import React, { type ElementType, type HTMLAttributes } from 'react';
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
  preset?: MotionPreset | undefined;
  as?: ElementType;
  duration?: number;
  easing?: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function getMotion(
  preset: MotionPreset | undefined,
  options?: {
    duration?: number;
    easing?: string;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
  }
): { className: string; style: React.CSSProperties } {
  if (!preset) {
    return { className: options?.className || '', style: options?.style || {} };
  }

  if (typeof preset === 'object' && preset !== null && 'name' in preset && 'keyframes' in preset) {
    const p = preset as Preset;
    injectKeyframes(p.name, p.keyframes);
    const duration = options?.duration ?? p.duration ?? 200;
    const easing = options?.easing ?? p.easing ?? 'ease';
    
    let style: React.CSSProperties = { 
      ...(options?.style || {}),
      animationName: p.name, 
      animationDuration: `${duration}ms`, 
      animationTimingFunction: easing, 
      animationFillMode: 'both' 
    };
    
    if (options?.delay !== undefined) {
      style = { ...style, animationDelay: `${options.delay}ms` };
    }
    
    return { className: options?.className || '', style };
  }

  if (typeof preset === 'function') {
    const result = preset();
    return {
      className: (result.className || '') + (options?.className ? ` ${options.className}` : ''),
      style: { ...(result.style || {}), ...(options?.style || {}) },
    };
  }

  if (typeof preset === 'string') {
    return { className: preset + (options?.className ? ` ${options.className}` : ''), style: options?.style ?? {} };
  }

  if (typeof preset === 'object' && preset !== null && 'className' in preset) {
    const result = preset as { className: string; style?: Record<string, any> };
    return {
      className: (result.className || '') + (options?.className ? ` ${options.className}` : ''),
      style: { ...(result.style || {}), ...(options?.style || {}) },
    };
  }

  return { className: options?.className || '', style: options?.style || {} };
}

export function Motion({
  preset,
  as: Component = 'div',
  duration,
  easing,
  delay,
  className = '',
  style = {},
  children,
  ...props
}: MotionProps & HTMLAttributes<HTMLElement> & { [key: string]: any }) {
  const result = getMotion(preset, { duration, easing, delay, className, style });
  const Tag = Component as ElementType;

  return (
    <Tag className={result.className} style={result.style} {...props}>
      {children}
    </Tag>
  );
}