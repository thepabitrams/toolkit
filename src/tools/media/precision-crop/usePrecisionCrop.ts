import { useState, useCallback } from "react";

const cropperZoomConfig = {
  maximumZoomLevel: 5,
  zoomIncrementStep: 0.1,
  minimumZoomLevel: 1,
};

interface UsePrecisionCropReturn {
  cropPosition: { x: number; y: number };
  zoomLevel: number;
  setCropPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleReset: () => void;
  isAtMinZoom: boolean;
  isAtMaxZoom: boolean;
}

export function usePrecisionCrop(): UsePrecisionCropReturn {
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(cropperZoomConfig.minimumZoomLevel);

  const handleZoomIn = useCallback((): void => {
    setZoomLevel((previousZoom) => Math.min(cropperZoomConfig.maximumZoomLevel, previousZoom + cropperZoomConfig.zoomIncrementStep));
  }, []);

  const handleZoomOut = useCallback((): void => {
    setZoomLevel((previousZoom) => Math.max(cropperZoomConfig.minimumZoomLevel, previousZoom - cropperZoomConfig.zoomIncrementStep));
  }, []);

  const handleReset = useCallback((): void => {
    setCropPosition({ x: 0, y: 0 });
    setZoomLevel(cropperZoomConfig.minimumZoomLevel);
  }, []);

  const isAtMinZoom = zoomLevel <= cropperZoomConfig.minimumZoomLevel;
  const isAtMaxZoom = zoomLevel >= cropperZoomConfig.maximumZoomLevel;

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