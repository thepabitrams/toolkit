import React from "react";
import { FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/core/components/ui/Button";
import { IconButton } from "@/core/components/ui/IconButton";

interface CropControlsProps {
  currentZoom: number;
  isAtMinZoom: boolean;
  isAtMaxZoom: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleReset: () => void;
  handleApplyCrop: () => void;
}

export const CropControls: React.FC<CropControlsProps> = ({
  currentZoom,
  isAtMinZoom,
  isAtMaxZoom,
  handleZoomIn,
  handleZoomOut,
  handleReset,
  handleApplyCrop,
}): React.JSX.Element => {
  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-transparent border-t border-slate-200 dark:border-gray-800">
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

        <span className="w-px h-6 bg-slate-300 dark:bg-gray-700 mx-1" />

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
        <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
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
  );
};