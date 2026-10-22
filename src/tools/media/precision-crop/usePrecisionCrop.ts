// src/tools/media/precision-crop/usePrecisionCrop.ts
import { useState, useCallback } from "react";

const MAXIMUM_ZOOM_LEVEL = 5;
const ZOOM_INCREMENT_STEP = 0.1;

export function usePrecisionCrop() {
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((previousZoom) => Math.min(MAXIMUM_ZOOM_LEVEL, previousZoom + ZOOM_INCREMENT_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((previousZoom) => Math.max(1, previousZoom - ZOOM_INCREMENT_STEP));
  }, []);

  const handleReset = useCallback(() => {
    setCropPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  }, []);

  const isAtMinZoom = zoomLevel <= 1;
  const isAtMaxZoom = zoomLevel >= MAXIMUM_ZOOM_LEVEL;

  return {
    cropPosition,
    zoomLevel,
    setCropPosition,
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    isAtMinZoom,
    isAtMaxZoom,
  };
}