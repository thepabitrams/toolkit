import React, { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { MdClose } from 'react-icons/md';

interface GalleryThumbnailProperties {
  file: FileReference;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const GalleryThumbnail: React.FC<GalleryThumbnailProperties> = ({ 
  file, 
  isActive, 
  onClick, 
  onDragStart, 
  onDragEnd, 
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const { getRawFile, deleteFile } = useFileStore();
  
  const dragControls = useDragControls();

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadThumbnail = async () => {
      const rawFile = await getRawFile(file.storageKey);
      if (rawFile && isMounted) {
        objectUrl = URL.createObjectURL(rawFile);
        setThumbnailUrl(objectUrl);
      }
    };

    loadThumbnail();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file.storageKey, getRawFile]);

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    const userConfirmed = window.confirm(`Delete ${file.name}? This will also delete any processed images.`);
    if (userConfirmed) {
      deleteFile(file.bucket, file.name);
    }
  };

  return (
    <Reorder.Item
      value={file}
      dragListener={false} 
      dragControls={dragControls}
      layout // <--- 'layout' makes the other items slide out of the way smoothly
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        group relative w-24 h-24 min-w-24 shrink-0 rounded-xl cursor-pointer list-none
        ${isActive
          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#F8FAFC] dark:ring-offset-gray-950'
          : 'ring-1 ring-slate-200 dark:ring-gray-700 hover:ring-blue-300'
        }
      `}
    >
      <div
        onPointerDown={(e) => {
          e.preventDefault(); 
          dragControls.start(e);
        }}
        style={{ touchAction: 'none' }} 
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
      />

      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={file.name}
          className="w-full h-full object-cover rounded-xl bg-slate-100 dark:bg-gray-800 pointer-events-none"
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-gray-800 animate-pulse pointer-events-none" />
      )}

      {isActive && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none" />
      )}

      <button
        onClick={handleDelete}
        className="
          absolute -top-2 -right-2 z-30
          bg-white dark:bg-gray-800 text-slate-500 hover:text-red-500 
          border border-slate-200 dark:border-gray-700 shadow-md rounded-full p-1
          transition-all opacity-0 group-hover:opacity-100
        "
        aria-label="Remove image"
      >
        <MdClose className="w-3.5 h-3.5" />
      </button>
    </Reorder.Item>
  );
};