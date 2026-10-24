// src/config/motion.ts

import type { Variants, Transition } from 'motion/react';

// Types

export interface MotionDurationTokens {
  readonly instant: number;
  readonly fast: number;
  readonly standard: number;
  readonly slow: number;
  readonly deliberate: number;
}

export interface MotionEasingTokens {
  readonly standard: [number, number, number, number];
  readonly emphasized: [number, number, number, number];
  readonly decelerate: [number, number, number, number];
  readonly accelerate: [number, number, number, number];
  readonly springy: [number, number, number, number];
}

export interface MotionSpringTokens {
  readonly gentle: Transition;
  readonly standard: Transition;
  readonly snappy: Transition;
  readonly bouncy: Transition;
  readonly fluid: Transition;
}

export interface MotionStaggerTokens {
  readonly fast: number;
  readonly standard: number;
  readonly relaxed: number;
  readonly slow: number;
}

// Primitives

export const duration: MotionDurationTokens = {
  instant: 0.1,
  fast: 0.18,
  standard: 0.25,
  slow: 0.4,
  deliberate: 0.6,
} as const;

export const easing: MotionEasingTokens = {
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.2, 0, 0, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  springy: [0.34, 1.56, 0.64, 1],
};

export const spring: MotionSpringTokens = {
  gentle: { type: 'spring', stiffness: 200, damping: 25 },
  standard: { type: 'spring', stiffness: 300, damping: 24 },
  snappy: { type: 'spring', stiffness: 400, damping: 17 },
  bouncy: { type: 'spring', stiffness: 500, damping: 15 },
  fluid: { type: 'spring', stiffness: 200, damping: 25 },
};

export const stagger: MotionStaggerTokens = {
  fast: 0.04,
  standard: 0.08,
  relaxed: 0.12,
  slow: 0.18,
} as const;

// Semantic Presets — Visibility

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.standard, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

export const fadeOut: Variants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

// Semantic Presets — Directional Slide

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.standard, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.standard, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.standard, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.standard, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

// Semantic Presets — Scale

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.standard,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

export const scaleOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

// Semantic Presets — Zoom

export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

export const zoomOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 1.15,
    transition: { duration: duration.fast, ease: easing.accelerate },
  },
};

// Semantic Presets — Attention

export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export const shimmer: Variants = {
  idle: { backgroundPosition: '-200% 0' },
  shimmer: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.6, ease: 'linear', repeat: Infinity },
  },
};

export const marqueeSwing: Variants = {
  idle: { rotate: 0 },
  swing: {
    rotate: [-2, 2, -2],
    transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
  },
};