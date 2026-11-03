// src/tools/personalisation/wallpaper/Preview.tsx
import React, { useRef, useEffect } from 'react';

interface PreviewProps {
  color: string;
  width: number;
  height: number;
}

export const Preview: React.FC<PreviewProps> = ({ color, width, height }): React.JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const previewCanvas = canvasRef.current;
    if (!previewCanvas) return;

    const rawContext = previewCanvas.getContext('2d');
    if (!rawContext) return;
    const canvasContext: CanvasRenderingContext2D = rawContext;

    const parentRect = previewCanvas.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    const containerWidth = parentRect.width;
    const containerHeight = parentRect.height;
    const aspectRatio = width / height;
    
    let drawWidth = containerWidth;
    let drawHeight = containerWidth / aspectRatio;

    if (drawHeight > containerHeight) {
      drawHeight = containerHeight;
      drawWidth = containerHeight * aspectRatio;
    }

    previewCanvas.width = containerWidth;
    previewCanvas.height = containerHeight;

    canvasContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    const xPosition = (previewCanvas.width - drawWidth) / 2;
    const yPosition = (previewCanvas.height - drawHeight) / 2;

    canvasContext.fillStyle = color;
    canvasContext.fillRect(xPosition, yPosition, drawWidth, drawHeight);
  }, [color, width, height]);

  return (
    <div className="w-full flex flex-col bg-transparent">
      <div className="relative w-full h-80 bg-slate-200/60 dark:bg-black/50 rounded-t-xl flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full object-contain" />
      </div>
    </div>
  );
};