import React, { memo, useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { MdClose } from 'react-icons/md';

interface GalleryThumbnailProperties {
  file: FileReference;
  isActive: boolean;
  onClick: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export const GalleryThumbnail = memo(
  ({ file, isActive, onClick, onDragStart, onDragEnd }: GalleryThumbnailProperties) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { getRawFile, deleteFile } = useFileStore();
    const dragControls = useDragControls();

    useEffect(() => {
      let isComponentMounted = true;
      let objectUrlInstance: string | null = null;

      const loadThumbnail = async () => {
        const rawFile = await getRawFile(file.storageKey);
        if (rawFile && isComponentMounted) {
          objectUrlInstance = URL.createObjectURL(rawFile);
          setThumbnailUrl(objectUrlInstance);
        }
      };

      loadThumbnail();

      return () => {
        isComponentMounted = false;
        if (objectUrlInstance) {
          URL.revokeObjectURL(objectUrlInstance);
        }
      };
    }, [file.storageKey, getRawFile]);

    const handlePointerDown = (event: React.PointerEvent) => {
      setIsDragging(true);
      onDragStart(file.id);
      dragControls.start(event);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      onDragEnd();
    };

    const handleDeleteClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (window.confirm(`Delete ${file.name}? This will also delete any processed images.`)) {
        deleteFile(file.bucket, file.name);
      }
    };

    return (
      <Reorder.Item
        value={file}
        dragListener={false}
        dragControls={dragControls}
        layout="position"
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        onClick={() => onClick(file.id)}
        style={{ willChange: 'transform' }}
        className={`group relative h-24 w-24 min-w-24 shrink-0 cursor-pointer list-none rounded-xl outline-offset-2 ${
          isActive
            ? 'outline outline-2 outline-blue-500'
            : 'outline outline-1 outline-slate-200 hover:outline-blue-300 dark:outline-gray-700'
        }`}
      >
        <div
          onPointerDown={handlePointerDown}
          style={{ touchAction: 'none' }}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        />

        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={file.name}
            draggable={false}
            decoding="async"
            className="pointer-events-none h-full w-full rounded-xl bg-slate-100 object-cover dark:bg-gray-800"
          />
        ) : (
          <div className="pointer-events-none h-full w-full animate-pulse rounded-xl bg-slate-100 dark:bg-gray-800" />
        )}

        {isActive && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-blue-500/10" />
        )}

        <button
          onClick={handleDeleteClick}
          aria-label="Remove image"
          className={`absolute -right-2 -top-2 z-30 rounded-full border border-slate-200 bg-white p-1 text-slate-500 transition-all duration-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800 ${
            isDragging
              ? 'pointer-events-none opacity-0'
              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
          }`}
        >
          <MdClose className="h-3.5 w-3.5" />
        </button>
      </Reorder.Item>
    );
  }
);

GalleryThumbnail.displayName = 'GalleryThumbnail';