import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Reorder, motion } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { GalleryThumbnail } from './GalleryThumbnail';
import { Button } from '@/core/components/ui/Button';
import { FiPlus, FiUploadCloud } from 'react-icons/fi';

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
}): React.JSX.Element => {
  const { setActiveFile, reorderBucket } = useFileStore();
  
  const [items, setItems] = useState<FileReference[]>(files);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    setItems(files);
  }, [files]);

  const handleDropFiles = useCallback((droppedFiles: File[]): void => {
    handleFileUpload(droppedFiles);
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDropFiles,
    accept: acceptedMimeTypes,
    maxFiles: undefined,
    disabled: isUploading,
    noClick: true,
  });

  const handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    event.currentTarget.scrollLeft += event.deltaY;
  };

  const handleReorder = (newOrder: FileReference[]): void => {
    setItems(newOrder);
  };

  const handleDragEnd = (): void => {
    if (draggedItemId) {
      const oldIndex = files.findIndex((fileReference) => fileReference.id === draggedItemId);
      const newIndex = items.findIndex((fileReference) => fileReference.id === draggedItemId);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderBucket('original', oldIndex, newIndex);
      }
      setDraggedItemId(null);
    }
  };

  return (
    <section 
      {...getRootProps()}
      className={`
        relative bg-white/60 dark:bg-gray-900/60 border border-slate-200/80 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col overflow-hidden
        ${isDragActive ? 'ring-2 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl pointer-events-none">
          <FiUploadCloud className="w-10 h-10 text-blue-500 mb-2 animate-bounce" />
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Drop images here</p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100 dark:border-gray-800/50">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
          {items.length} {items.length === 1 ? 'Image' : 'Images'}
        </h3>
        
        <Button
          onClick={open}
          variant="primary"
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs h-auto rounded-lg"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Uploading...' : 'Add Image'}</span>
        </Button>
      </div>

      <motion.div
        layoutScroll
        onWheel={handleMouseWheel}
        className="w-full flex flex-nowrap items-center overflow-x-auto overflow-y-hidden py-4 px-4 scrollbar-hide"
      >
        {items.length === 0 && (
          <div className="w-full py-8 text-center flex flex-col items-center justify-center pointer-events-none">
            <p className="text-sm text-slate-500 dark:text-gray-400">No images yet.</p>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Click "Add Image" or drag & drop files here.</p>
          </div>
        )}

        <Reorder.Group 
          axis="x" 
          values={items} 
          onReorder={handleReorder}
          className="flex items-center gap-4 w-max" 
        >
          {items.map((fileReference, index) => (
            <GalleryThumbnail
              key={fileReference.id}
              file={fileReference}
              index={index}
              isActive={activeFileId === fileReference.id}
              onClick={() => setActiveFile(fileReference.id)}
              onDragStart={() => setDraggedItemId(fileReference.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Reorder.Group>

        {items.length > 0 && <div className="w-8 shrink-0 h-24 pointer-events-none" />}
      </motion.div>
    </section>
  );
};