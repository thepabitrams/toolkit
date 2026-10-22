// src/tools/media/precision-crop/Controls.tsx
import React from "react";
import { FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/core/components/ui/Button";
import { IconButton } from "@/core/components/ui/IconButton";
import { Container } from "@/core/components/ui/Container";

interface CropControlsProperties {
  currentZoom: number;
  isAtMinZoom: boolean;
  isAtMaxZoom: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleReset: () => void;
  handleApplyCrop: () => void;
}

export const CropControls: React.FC<CropControlsProperties> = ({
  currentZoom,
  isAtMinZoom,
  isAtMaxZoom,
  handleZoomIn,
  handleZoomOut,
  handleReset,
  handleApplyCrop,
}) => {
  return (
    <Container className="px-4 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <IconButton
            onClick={handleZoomOut}
            disabled={isAtMinZoom}
            variant="standard"
            size="sm"
            ariaLabel="Zoom out"
            className={isAtMinZoom ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400'}
          >
            <FiZoomOut className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={handleZoomIn}
            disabled={isAtMaxZoom}
            variant="standard"
            size="sm"
            ariaLabel="Zoom in"
            className={isAtMaxZoom ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400'}
          >
            <FiZoomIn className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={handleReset}
            variant="standard"
            size="sm"
            ariaLabel="Reset crop"
            className="hover:text-red-600 dark:hover:text-red-400"
          >
            <FiRefreshCw className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {Math.round(currentZoom * 100)}%
          </span>
        </div>

        <Button
          onClick={handleApplyCrop}
          variant="primary"
          className="w-full"
        >
          Apply Crop
        </Button>
      </div>
    </Container>
  );
};