// src/shared/components/uploaders/gallery-uploader/GalleryThumbnail.tsx
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { MdClose } from 'react-icons/md';

interface GalleryThumbnailProperties {
  fileReference: FileReference;
  isActive: boolean;
  handleThumbnailClick: (fileIdentifier: string) => void;
  handleThumbnailDragStart: (fileIdentifier: string) => void;
  handleThumbnailDragEnd: () => void;
}

const DRAG_HOLD_DELAY_MILLISECONDS = 200;
const DRAG_MOVE_TOLERANCE_PIXELS = 8;
const THUMBNAIL_SIZE_PIXELS = 192;

const thumbnailUrlCache = new Map<string, Promise<string>>();

const createThumbnailUrl = async (imageBlob: Blob): Promise<string> => {
  try {
    const imageBitmap = await createImageBitmap(imageBlob, {
      resizeWidth: THUMBNAIL_SIZE_PIXELS,
      resizeQuality: 'medium',
    });
    const canvasElement = document.createElement('canvas');
    canvasElement.width = imageBitmap.width;
    canvasElement.height = imageBitmap.height;
    canvasElement.getContext('2d')?.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();

    const thumbnailBlob = await new Promise<Blob | null>((resolvePromise) =>
      canvasElement.toBlob(resolvePromise, 'image/jpeg', 0.82)
    );
    return URL.createObjectURL(thumbnailBlob ?? imageBlob);
  } catch {
    return URL.createObjectURL(imageBlob);
  }
};

const getOrCreateThumbnailUrl = (
  fileStorageKey: string,
  retrieveRawFileAction: (storageKey: string) => Promise<File | Blob | null | undefined>
): Promise<string | null> => {
  let cachedThumbnailUrlPromise = thumbnailUrlCache.get(fileStorageKey);
  if (!cachedThumbnailUrlPromise) {
    cachedThumbnailUrlPromise = (async () => {
      const rawFileBlob = await retrieveRawFileAction(fileStorageKey);
      if (!rawFileBlob) throw new Error('missing file');
      return createThumbnailUrl(rawFileBlob);
    })();
    thumbnailUrlCache.set(fileStorageKey, cachedThumbnailUrlPromise);
  }
  return cachedThumbnailUrlPromise.catch(() => {
    thumbnailUrlCache.delete(fileStorageKey);
    return null;
  });
};

export const GalleryThumbnail = memo(
  ({ 
    fileReference, 
    isActive, 
    handleThumbnailClick, 
    handleThumbnailDragStart, 
    handleThumbnailDragEnd 
  }: GalleryThumbnailProperties) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const retrieveRawFileAction = useFileStore((state) => state.getRawFile);
    const deleteFileAction = useFileStore((state) => state.deleteFile);

    const dragControls = useDragControls();
    const dragHoldTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialPointerPositionReference = useRef<{ xCoordinate: number; yCoordinate: number } | null>(null);
    const didDragReference = useRef(false);
    const touchScrollBlockerReference = useRef<((event: TouchEvent) => void) | null>(null);

    useEffect(() => {
      let isComponentMounted = true;
      getOrCreateThumbnailUrl(fileReference.storageKey, retrieveRawFileAction).then((generatedThumbnailUrl) => {
        if (isComponentMounted && generatedThumbnailUrl) setThumbnailUrl(generatedThumbnailUrl);
      });
      return () => {
        isComponentMounted = false;
      };
    }, [fileReference.storageKey, retrieveRawFileAction]);

    const clearDragHold = useCallback(() => {
      if (dragHoldTimeoutReference.current) {
        clearTimeout(dragHoldTimeoutReference.current);
        dragHoldTimeoutReference.current = null;
      }
      initialPointerPositionReference.current = null;
    }, []);

    const blockTouchScroll = useCallback(() => {
      if (touchScrollBlockerReference.current) return;
      const blocker = (touchEvent: TouchEvent) => {
        if (touchEvent.cancelable) touchEvent.preventDefault();
      };
      touchScrollBlockerReference.current = blocker;
      window.addEventListener('touchmove', blocker, { passive: false });
    }, []);

    const unblockTouchScroll = useCallback(() => {
      if (touchScrollBlockerReference.current) {
        window.removeEventListener('touchmove', touchScrollBlockerReference.current);
        touchScrollBlockerReference.current = null;
      }
    }, []);

    useEffect(
      () => () => {
        clearDragHold();
        unblockTouchScroll();
      },
      [clearDragHold, unblockTouchScroll]
    );

    const beginDrag = useCallback(
      (nativePointerEvent: PointerEvent) => {
        didDragReference.current = true;
        setIsDragging(true);
        handleThumbnailDragStart(fileReference.id);
        dragControls.start(nativePointerEvent);
      },
      [dragControls, fileReference.id, handleThumbnailDragStart]
    );

    const handlePointerDown = (pointerEvent: React.PointerEvent) => {
      if ((pointerEvent.target as HTMLElement).closest('button')) return;

      if (pointerEvent.pointerType === 'mouse') {
        if (pointerEvent.button !== 0) return;
        beginDrag(pointerEvent.nativeEvent);
        return;
      }

      initialPointerPositionReference.current = { xCoordinate: pointerEvent.clientX, yCoordinate: pointerEvent.clientY };
      const nativePointerEvent = pointerEvent.nativeEvent;
      
      dragHoldTimeoutReference.current = setTimeout(() => {
        dragHoldTimeoutReference.current = null;
        blockTouchScroll();
        navigator.vibrate?.(10);
        beginDrag(nativePointerEvent);
      }, DRAG_HOLD_DELAY_MILLISECONDS);
    };

    const handlePointerMove = (pointerEvent: React.PointerEvent) => {
      const initialPointerPosition = initialPointerPositionReference.current;
      if (!initialPointerPosition || !dragHoldTimeoutReference.current) return;
      
      const distanceMoved = Math.hypot(
        pointerEvent.clientX - initialPointerPosition.xCoordinate, 
        pointerEvent.clientY - initialPointerPosition.yCoordinate
      );

      if (distanceMoved > DRAG_MOVE_TOLERANCE_PIXELS) {
        clearDragHold();
      }
    };

    const handleDragEnd = () => {
      unblockTouchScroll();
      setIsDragging(false);
      handleThumbnailDragEnd();
      
      setTimeout(() => {
        didDragReference.current = false;
      }, 50);
    };

    const handleClick = () => {
      if (didDragReference.current) return;
      handleThumbnailClick(fileReference.id);
    };

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
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearDragHold}
        onPointerCancel={clearDragHold}
        onClick={handleClick}
        whileDrag={{ scale: 1.06, zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{ willChange: 'transform' }}
        className={`group relative h-24 w-24 min-w-24 shrink-0 cursor-grab select-none list-none rounded-xl [-webkit-touch-callout:none] active:cursor-grabbing ${
          isActive
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
            : 'ring-1 ring-slate-200 hover:ring-blue-300 dark:ring-gray-700 dark:hover:ring-blue-500/50'
        }`}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={fileReference.name}
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
          className={`absolute -right-2 -top-2 z-30 rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition-opacity duration-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800 ${
            isDragging ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <MdClose className="h-3.5 w-3.5" />
        </button>
      </Reorder.Item>
    );
  }
);

GalleryThumbnail.displayName = 'GalleryThumbnail';