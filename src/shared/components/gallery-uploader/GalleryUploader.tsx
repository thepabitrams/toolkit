import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { GalleryThumbnail } from './GalleryThumbnail';
import { IconButton } from '@/core/components/ui/IconButton';
import { FiPlus } from 'react-icons/fi';

interface GalleryUploaderProperties {
  files: FileReference[];
  activeFileId: string | null;
  acceptedMimeTypes: Record<string, string[]>;
  isUploading: boolean;
  handleFileUpload: (files: File[]) => void;
}

export const GalleryUploader: React.FC<GalleryUploaderProperties> = ({
  files,
  activeFileId,
  acceptedMimeTypes,
  isUploading,
  handleFileUpload,
}) => {
  const { setActiveFile, reorderBucket } = useFileStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);

  const HITBOX_PERCENTAGE = 0.25; 
  const MAX_SPEED_PERCENTAGE = 0.5; 
  const MAX_SPEED_PX_PER_SEC = 900; 
  const DAMPENING_DURATION_MS = 400; 

  const onDropFiles = useCallback((droppedFiles: File[]) => {
    handleFileUpload(droppedFiles);
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onDropFiles,
    accept: acceptedMimeTypes,
    maxFiles: undefined,
    disabled: isUploading,
    noClick: true,
  });

  useEffect(() => {
    if (draggedIndex === null) return;

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault(); 
      mouseXRef.current = e.clientX;
    };

    const handleWindowDropOrEnd = () => {
      setTimeout(() => setDraggedIndex(null), 50);
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDropOrEnd);
    window.addEventListener('dragend', handleWindowDropOrEnd);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDropOrEnd);
      window.removeEventListener('dragend', handleWindowDropOrEnd);
    };
  }, [draggedIndex]);

  const autoScroll = useCallback(() => {
    if (!scrollContainerRef.current || draggedIndex === null) return;

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = mouseXRef.current;
    
    const hitboxSize = rect.width * HITBOX_PERCENTAGE;
    const maxSpeedZone = hitboxSize * MAX_SPEED_PERCENTAGE;
    const rampDistance = hitboxSize - maxSpeedZone;

    let scrollSpeed = 0;
    const dragDuration = Date.now() - dragStartTimeRef.current;
    const dampeningFactor = Math.min(1, dragDuration / DAMPENING_DURATION_MS);

    if (mouseX > rect.right - hitboxSize) {
      const distanceToEdge = rect.right - mouseX;
      const intensity = Math.min(1, Math.max(0, (hitboxSize - distanceToEdge) / rampDistance));
      const easedIntensity = Math.pow(intensity, 2);
      const baseSpeed = easedIntensity * MAX_SPEED_PX_PER_SEC;
      scrollSpeed = (baseSpeed * dampeningFactor) / 60;
    } 
    else if (mouseX < rect.left + hitboxSize) {
      const distanceToEdge = mouseX - rect.left;
      const intensity = Math.min(1, Math.max(0, (hitboxSize - distanceToEdge) / rampDistance));
      const easedIntensity = Math.pow(intensity, 2);
      const baseSpeed = easedIntensity * MAX_SPEED_PX_PER_SEC;
      scrollSpeed = -(baseSpeed * dampeningFactor) / 60;
    }

    if (scrollSpeed !== 0) {
      container.scrollLeft += scrollSpeed;
    }

    animationFrameRef.current = requestAnimationFrame(autoScroll);
  }, [draggedIndex]);

  useEffect(() => {
    if (draggedIndex !== null) {
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [draggedIndex, autoScroll]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    mouseXRef.current = e.clientX;
    dragStartTimeRef.current = Date.now(); 
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    await reorderBucket('original', draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return (
    <section className="bg-white/60 dark:bg-gray-900/60 border border-slate-200/80 dark:border-gray-800 rounded-2xl shadow-sm">
      <div
        {...getRootProps()}
        ref={scrollContainerRef}
        onDragOver={handleDragOver}
        className={`
          flex flex-nowrap items-center gap-4 overflow-x-auto overflow-y-hidden py-4 px-6 scrollbar-hide transition-colors
          ${isDragActive ? 'bg-blue-50/50 dark:bg-blue-900/10 rounded-xl' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <IconButton
          onClick={open}
          variant="standard"
          ariaLabel="Add Image"
          className="
            group w-24 h-24 min-w-24 min-h-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 dark:border-gray-600 
            hover:border-blue-400 bg-slate-50/50 dark:bg-gray-800/50 
            relative transition-all cursor-pointer p-0!
            active:scale-95
          "
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 flex items-center justify-center group-hover:border-blue-200 shrink-0">
              <FiPlus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
            </div>
            <span className="text-[11px] leading-tight font-medium text-slate-500 dark:text-gray-400 group-hover:text-blue-600 mt-2 text-center w-full px-1">
              {isUploading ? 'Uploading...' : 'Add Image'}
            </span>
          </div>
        </IconButton>

        {files.map((file, index) => (
          <GalleryThumbnail
            key={file.id}
            file={file}
            index={index}
            isActive={activeFileId === file.id}
            onClick={() => setActiveFile(file.id)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={() => setDraggedIndex(null)}
          />
        ))}

        <div className="w-12 shrink-0 h-24 pointer-events-none" />
      </div>
    </section>
  );
};