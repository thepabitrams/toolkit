import type { Variants } from 'motion/react';

export const drawerSlideVariants: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 200 } 
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: { type: 'spring', damping: 25, stiffness: 200 } 
  }
};

export const pageStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

export const cardSpringItem: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

export const buttonHoverTapEffect = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

// 🚨 ZOOM CONFIGURATION FOR THE CROPPER
export const cropperZoomConfig = {
  maximumZoomLevel: 5,
  zoomIncrementStep: 0.1,
  minimumZoomLevel: 1,
};