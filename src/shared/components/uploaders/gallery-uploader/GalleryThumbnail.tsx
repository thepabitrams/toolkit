import React, { memo } from 'react';
import { Reorder, motion } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { MdClose } from 'react-icons/md';
import { useGalleryThumbnail } from './useGalleryThumbnail';

interface GalleryThumbnailProperties {
  fileReference: FileReference;
  isActive: boolean;
  handleThumbnailClick: (fileIdentifier: string) => void;
  handleThumbnailDragStart: (fileIdentifier: string) => void;
  handleThumbnailDragEnd: () => void;
}

const PROGRESS_CIRCLE_RADIUS = 24;
const PROGRESS_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_CIRCLE_RADIUS;

export const GalleryThumbnail = memo(
  ({
    fileReference,
    isActive,
    handleThumbnailClick,
    handleThumbnailDragStart,
    handleThumbnailDragEnd,
  }: GalleryThumbnailProperties) => {
    const deleteFileAction = useFileStore((state) => state.deleteFile);

    const {
      thumbnailUrl,
      isDragging,
      holdProgress,
      dragControls,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
      handleDragEnd,
      handleImageError,
    } = useGalleryThumbnail({
      fileReference,
      handleThumbnailDragEnd,
    });

    const handleDeleteClick = (mouseEvent: React.MouseEvent) => {
      mouseEvent.stopPropagation();
      if (window.confirm(`Delete ${fileReference.name}? This will also delete any processed images.`)) {
        deleteFileAction(fileReference.bucket, fileReference.name);
      }
    };

    return (
      <Reorder.Item
        value={fileReference}
        dragListener={false}
        dragControls={dragControls}
        layout="position"
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => handleThumbnailDragStart(fileReference.id)}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        whileDrag={{
          scale: 1.05,
          rotate: [0, -3, 3, -3, 3, 0],
          zIndex: 50,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`group relative h-24 w-24 min-w-24 shrink-0 cursor-grab select-none list-none rounded-xl [-webkit-touch-callout:none] [-webkit-user-select:none] active:cursor-grabbing ${
          isDragging ? 'shadow-[0_10px_25px_rgba(0,0,0,0.25)]' : ''
        } ${
          isActive && !isDragging
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
            : 'ring-1 ring-slate-200 hover:ring-blue-300 dark:ring-gray-700 dark:hover:ring-blue-500/50'
        }`}
      >
        <div
          className={`h-full w-full select-none overflow-hidden rounded-xl ${
            isDragging ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          onClick={() => handleThumbnailClick(fileReference.id)}
        >
          {thumbnailUrl ? (
            <img
              key={thumbnailUrl}
              src={thumbnailUrl}
              alt={fileReference.name}
              draggable={false}
              decoding="sync"
              onError={handleImageError}
              className="pointer-events-none block h-full w-full select-none rounded-xl bg-slate-100 object-cover dark:bg-gray-800"
            />
          ) : (
            <div className="pointer-events-none h-full w-full animate-pulse rounded-xl bg-slate-100 dark:bg-gray-800" />
          )}
        </div>

        {isActive && !isDragging && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-blue-500/10" />
        )}

        {holdProgress > 0 && !isDragging && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-black/30">
            <svg className="h-14 w-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={PROGRESS_CIRCLE_RADIUS}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="28"
                cy="28"
                r={PROGRESS_CIRCLE_RADIUS}
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={PROGRESS_CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={
                  PROGRESS_CIRCLE_CIRCUMFERENCE - (holdProgress / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE
                }
              />
            </svg>
          </div>
        )}

        <button
          onClick={handleDeleteClick}
          aria-label="Remove image"
          className="absolute -right-2 -top-2 z-30 rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition-colors duration-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800"
        >
          <MdClose className="h-3.5 w-3.5" />
        </button>
      </Reorder.Item>
    );
  }
);

GalleryThumbnail.displayName = 'GalleryThumbnail';