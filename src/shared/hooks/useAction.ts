// src/shared/hooks/useAction.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { tools as allTools, type ToolConfig } from '@/config/tools';

interface UseActionOptions {
  toolId: string;
}

interface UseActionReturn {
  isActionMenuOpen: boolean;
  handleOpenActionMenu: () => void;
  handleCloseActionMenu: () => void;
  handleToggleActionMenu: () => void;
  dragOffsetY: number;
  isCurrentlyDragging: boolean;
  compatibilityFilter: { category: string; inputType: string } | undefined;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleMouseMove: (event: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
}

export const useAction = ({ toolId }: UseActionOptions): UseActionReturn => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [activeToolConfig, setActiveToolConfig] = useState<ToolConfig | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState(false);
  
  const initialPointerY = useRef<number | null>(null);
  const currentPointerY = useRef<number | null>(null);
  const pointerVelocity = useRef<number>(0);
  const lastPointerMoveTime = useRef<number>(0);

  useEffect(() => {
    if (toolId) {
      const matchingToolConfig = allTools.find((registeredTool) => registeredTool.slug === toolId);
      if (matchingToolConfig) {
        setActiveToolConfig(matchingToolConfig);
      } else {
        setActiveToolConfig(null);
      }
    }
  }, [toolId]);

  const handleOpenActionMenu = useCallback(() => {
    setIsActionMenuOpen(true);
    setDragOffsetY(0);
  }, []);

  const handleCloseActionMenu = useCallback(() => {
    setIsActionMenuOpen(false);
    setDragOffsetY(0);
    setIsCurrentlyDragging(false);
    initialPointerY.current = null;
    currentPointerY.current = null;
    pointerVelocity.current = 0;
  }, []);

  const handleToggleActionMenu = useCallback(() => {
    if (isActionMenuOpen) {
      handleCloseActionMenu();
    } else {
      handleOpenActionMenu();
    }
  }, [isActionMenuOpen, handleOpenActionMenu, handleCloseActionMenu]);

  const compatibilityFilter = activeToolConfig
    ? {
        category: activeToolConfig.category,
        inputType: 'single',
      }
    : undefined;

  const handleTouchStart = useCallback((touchEvent: React.TouchEvent) => {
    const primaryTouch = touchEvent.touches[0];
    initialPointerY.current = primaryTouch.clientY;
    currentPointerY.current = primaryTouch.clientY;
    setIsCurrentlyDragging(true);
    lastPointerMoveTime.current = Date.now();
    pointerVelocity.current = 0;
  }, []);

  const handleTouchMove = useCallback((touchEvent: React.TouchEvent) => {
    if (!isCurrentlyDragging || initialPointerY.current === null) return;
    
    const primaryTouch = touchEvent.touches[0];
    const deltaY = primaryTouch.clientY - initialPointerY.current;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastPointerMoveTime.current;
    
    if (timeDelta > 0) {
      pointerVelocity.current = (primaryTouch.clientY - (currentPointerY.current || initialPointerY.current)) / timeDelta;
    }
    
    currentPointerY.current = primaryTouch.clientY;
    lastPointerMoveTime.current = currentTime;
    
    if (deltaY > 0) {
      const dampenedDeltaY = deltaY * 0.6;
      setDragOffsetY(Math.min(dampenedDeltaY, 250));
    }
  }, [isCurrentlyDragging]);

  const handleTouchEnd = useCallback(() => {
    const dismissalThresholdY = 80;
    const velocityThreshold = 0.5;
    
    if (dragOffsetY > dismissalThresholdY || pointerVelocity.current > velocityThreshold) {
      handleCloseActionMenu();
    } else {
      setDragOffsetY(0);
    }
    
    setIsCurrentlyDragging(false);
    initialPointerY.current = null;
    currentPointerY.current = null;
    pointerVelocity.current = 0;
  }, [dragOffsetY, handleCloseActionMenu]);

  const handleMouseDown = useCallback((mouseEvent: React.MouseEvent) => {
    if (mouseEvent.button !== 0) return;
    initialPointerY.current = mouseEvent.clientY;
    currentPointerY.current = mouseEvent.clientY;
    setIsCurrentlyDragging(true);
    lastPointerMoveTime.current = Date.now();
    pointerVelocity.current = 0;
  }, []);

  const handleMouseMove = useCallback((mouseEvent: React.MouseEvent) => {
    if (!isCurrentlyDragging || initialPointerY.current === null) return;
    
    const deltaY = mouseEvent.clientY - initialPointerY.current;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastPointerMoveTime.current;
    
    if (timeDelta > 0) {
      pointerVelocity.current = (mouseEvent.clientY - (currentPointerY.current || initialPointerY.current)) / timeDelta;
    }
    
    currentPointerY.current = mouseEvent.clientY;
    lastPointerMoveTime.current = currentTime;
    
    if (deltaY > 0) {
      const dampenedDeltaY = deltaY * 0.6;
      setDragOffsetY(Math.min(dampenedDeltaY, 250));
    }
  }, [isCurrentlyDragging]);

  const handleMouseUp = useCallback(() => {
    const dismissalThresholdY = 80;
    const velocityThreshold = 0.5;
    
    if (dragOffsetY > dismissalThresholdY || pointerVelocity.current > velocityThreshold) {
      handleCloseActionMenu();
    } else {
      setDragOffsetY(0);
    }
    
    setIsCurrentlyDragging(false);
    initialPointerY.current = null;
    currentPointerY.current = null;
    pointerVelocity.current = 0;
  }, [dragOffsetY, handleCloseActionMenu]);

  const handleMouseLeave = useCallback(() => {
    if (isCurrentlyDragging) {
      if (dragOffsetY > 80) {
        handleCloseActionMenu();
      } else {
        setDragOffsetY(0);
      }
      setIsCurrentlyDragging(false);
      initialPointerY.current = null;
      currentPointerY.current = null;
      pointerVelocity.current = 0;
    }
  }, [isCurrentlyDragging, dragOffsetY, handleCloseActionMenu]);

  useEffect(() => {
    if (!isActionMenuOpen) {
      setDragOffsetY(0);
      setIsCurrentlyDragging(false);
    }
  }, [isActionMenuOpen]);

  return {
    isActionMenuOpen,
    handleOpenActionMenu,
    handleCloseActionMenu,
    handleToggleActionMenu,
    dragOffsetY,
    isCurrentlyDragging,
    compatibilityFilter,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};