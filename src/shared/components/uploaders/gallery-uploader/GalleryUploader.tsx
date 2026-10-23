import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Reorder } from 'motion/react';
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
}) => {
  const { setActiveFile, reorderBucket } = useFileStore();
  const [items, setItems] = useState<FileReference[]>(files);
  const draggedItemIdReference = useRef<string | null>(null);

  useEffect(() => {
    setItems(files);
  }, [files]);

  const handleDropFiles = useCallback(
    (droppedFiles: File[]) => {
      handleFileUpload(droppedFiles);
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDropFiles,
    accept: acceptedMimeTypes,
    disabled: isUploading,
    noClick: true,
  });

  const handleMouseWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (draggedItemIdReference.current) return;
      event.currentTarget.scrollLeft += event.deltaY;
    },
    []
  );

  const handleReorder = useCallback((nextOrder: FileReference[]) => {
    setItems(nextOrder);
  }, []);

  const handleThumbnailDragStart = useCallback((id: string) => {
    draggedItemIdReference.current = id;
  }, []);

  const handleThumbnailDragEnd = useCallback(() => {
    const draggedId = draggedItemIdReference.current;
    if (!draggedId) return;

    const originalIndex = files.findIndex((file) => file.id === draggedId);
    const newIndex = items.findIndex((file) => file.id === draggedId);

    if (originalIndex !== -1 && newIndex !== -1 && originalIndex !== newIndex) {
      reorderBucket('original', originalIndex, newIndex);
    }
    
    draggedItemIdReference.current = null;
  }, [files, items, reorderBucket]);

  const handleThumbnailClick = useCallback(
    (id: string) => {
      setActiveFile(id);
    },
    [setActiveFile]
  );

  return (
    <section
      {...getRootProps()}
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 ${
        isDragActive ? 'bg-blue-50/20 ring-2 ring-blue-500/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <FiUploadCloud className="mb-2 h-10 w-10 animate-bounce text-blue-500" />
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Drop images here</p>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2 pt-4 dark:border-gray-800/50">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
          {items.length} {items.length === 1 ? 'Image' : 'Images'}
        </h3>
        <Button
          onClick={open}
          variant="primary"
          disabled={isUploading}
          className="flex h-auto items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
        >
          <FiPlus className="h-3.5 w-3.5" />
          <span>{isUploading ? 'Uploading...' : 'Add Image'}</span>
        </Button>
      </div>

      <div
        onWheel={handleMouseWheel}
        className="scrollbar-hide flex w-full flex-nowrap items-center overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 py-4"
      >
        {items.length === 0 && (
          <div className="pointer-events-none flex w-full flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-gray-400">No images yet.</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
              Click "Add Image" or drag & drop files here.
            </p>
          </div>
        )}

        <Reorder.Group
          axis="x"
          values={items}
          onReorder={handleReorder}
          className="flex w-max items-center gap-4"
          layoutScroll
        >
          {items.map((fileReference) => (
            <GalleryThumbnail
              key={fileReference.id}
              file={fileReference}
              isActive={activeFileId === fileReference.id}
              onClick={handleThumbnailClick}
              onDragStart={handleThumbnailDragStart}
              onDragEnd={handleThumbnailDragEnd}
            />
          ))}
        </Reorder.Group>

        {items.length > 0 && <div className="pointer-events-none h-24 w-8 shrink-0" />}
      </div>
    </section>
  );
};