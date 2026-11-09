// src/shared/components/uploaders/gallery-uploader/useGalleryThumbnail.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDragControls } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';

const HOLD_DURATION_MILLISECONDS = 1000;
const MAX_MOVEMENT_TOLERANCE_PIXELS = 10;
const THUMBNAIL_SIZE_PIXELS = 192;

const pendingThumbnailUrlPromiseByStorageKey = new Map<string, Promise<string>>();
const resolvedThumbnailUrlByStorageKey = new Map<string, string>();

const preventDefaultEvent = (event: Event) => {
  event.preventDefault();
};

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

const invalidateThumbnailUrl = (fileStorageKey: string) => {
  const staleThumbnailUrl = resolvedThumbnailUrlByStorageKey.get(fileStorageKey);
  if (staleThumbnailUrl) {
    URL.revokeObjectURL(staleThumbnailUrl);
  }
  resolvedThumbnailUrlByStorageKey.delete(fileStorageKey);
  pendingThumbnailUrlPromiseByStorageKey.delete(fileStorageKey);
};

const getOrCreateThumbnailUrl = (
  fileStorageKey: string,
  retrieveRawFileAction: (storageKey: string) => Promise<File | Blob | null | undefined>
): Promise<string | null> => {
  let pendingThumbnailUrlPromise = pendingThumbnailUrlPromiseByStorageKey.get(fileStorageKey);

  if (!pendingThumbnailUrlPromise) {
    pendingThumbnailUrlPromise = (async () => {
      const retrievedFileBlob = await retrieveRawFileAction(fileStorageKey);
      if (!retrievedFileBlob) throw new Error('missing file');
      const createdThumbnailUrl = await createThumbnailUrl(retrievedFileBlob);
      resolvedThumbnailUrlByStorageKey.set(fileStorageKey, createdThumbnailUrl);
      return createdThumbnailUrl;
    })();
    pendingThumbnailUrlPromiseByStorageKey.set(fileStorageKey, pendingThumbnailUrlPromise);
  }

  return pendingThumbnailUrlPromise.catch(() => {
    pendingThumbnailUrlPromiseByStorageKey.delete(fileStorageKey);
    return null;
  });
};

interface UseGalleryThumbnailProperties {
  fileReference: FileReference;
  handleThumbnailDragEnd: () => void;
}

export function useGalleryThumbnail({
  fileReference,
  handleThumbnailDragEnd,
}: UseGalleryThumbnailProperties) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    () => resolvedThumbnailUrlByStorageKey.get(fileReference.storageKey) ?? null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const retrieveRawFileAction = useFileStore((state) => state.getRawFile);
  const dragControls = useDragControls();

  const isMountedReference = useRef(true);
  const animationFrameReference = useRef<number | null>(null);
  const holdTimerReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPositionReference = useRef<{ x: number; y: number } | null>(null);
  const startTimeReference = useRef<number>(0);
  const isDraggingReference = useRef(false);
  const touchScrollBlockerReference = useRef<((event: TouchEvent) => void) | null>(null);
  const isTextSelectionLockedReference = useRef(false);
  const windowPointerReleaseListenerReference = useRef<(() => void) | null>(null);

  const loadThumbnail = useCallback(() => {
    getOrCreateThumbnailUrl(fileReference.storageKey, retrieveRawFileAction).then(
      (generatedThumbnailUrl) => {
        if (isMountedReference.current && generatedThumbnailUrl) {
          setThumbnailUrl(generatedThumbnailUrl);
        }
      }
    );
  }, [fileReference.storageKey, retrieveRawFileAction]);

  useEffect(() => {
    isMountedReference.current = true;
    const cachedThumbnailUrl = resolvedThumbnailUrlByStorageKey.get(fileReference.storageKey);
    setThumbnailUrl(cachedThumbnailUrl ?? null);
    loadThumbnail();
    return () => {
      isMountedReference.current = false;
    };
  }, [fileReference.storageKey, loadThumbnail]);

  const handleImageError = useCallback(() => {
    invalidateThumbnailUrl(fileReference.storageKey);
    setThumbnailUrl(null);
    loadThumbnail();
  }, [fileReference.storageKey, loadThumbnail]);

  const unlockTextSelection = useCallback(() => {
    if (!isTextSelectionLockedReference.current) return;
    isTextSelectionLockedReference.current = false;

    document.removeEventListener('selectstart', preventDefaultEvent);
    document.removeEventListener('dragstart', preventDefaultEvent);

    if (windowPointerReleaseListenerReference.current) {
      window.removeEventListener('pointerup', windowPointerReleaseListenerReference.current);
      window.removeEventListener('pointercancel', windowPointerReleaseListenerReference.current);
      windowPointerReleaseListenerReference.current = null;
    }

    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('-webkit-user-select');
    window.getSelection()?.removeAllRanges();
  }, []);

  const lockTextSelection = useCallback(() => {
    if (isTextSelectionLockedReference.current) return;
    isTextSelectionLockedReference.current = true;

    document.addEventListener('selectstart', preventDefaultEvent);
    document.addEventListener('dragstart', preventDefaultEvent);

    const windowPointerReleaseListener = () => {
      unlockTextSelection();
    };
    windowPointerReleaseListenerReference.current = windowPointerReleaseListener;
    window.addEventListener('pointerup', windowPointerReleaseListener);
    window.addEventListener('pointercancel', windowPointerReleaseListener);

    document.body.style.setProperty('user-select', 'none');
    document.body.style.setProperty('-webkit-user-select', 'none');
    window.getSelection()?.removeAllRanges();
  }, [unlockTextSelection]);

  const blockTouchScroll = useCallback(() => {
    if (touchScrollBlockerReference.current) return;
    const touchScrollBlocker = (touchEvent: TouchEvent) => {
      if (touchEvent.cancelable) touchEvent.preventDefault();
    };
    touchScrollBlockerReference.current = touchScrollBlocker;
    window.addEventListener('touchmove', touchScrollBlocker, { passive: false });
  }, []);

  const unblockTouchScroll = useCallback(() => {
    if (touchScrollBlockerReference.current) {
      window.removeEventListener('touchmove', touchScrollBlockerReference.current);
      touchScrollBlockerReference.current = null;
    }
  }, []);

  const cancelHold = useCallback(() => {
    if (holdTimerReference.current) {
      clearTimeout(holdTimerReference.current);
      holdTimerReference.current = null;
    }
    if (animationFrameReference.current) {
      cancelAnimationFrame(animationFrameReference.current);
      animationFrameReference.current = null;
    }
    setHoldProgress(0);
    startPositionReference.current = null;
  }, []);

  useEffect(
    () => () => {
      cancelHold();
      unblockTouchScroll();
      unlockTextSelection();
    },
    [cancelHold, unblockTouchScroll, unlockTextSelection]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if ((event.target as HTMLElement).closest('button')) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      lockTextSelection();

      isDraggingReference.current = false;
      startPositionReference.current = { x: event.clientX, y: event.clientY };
      startTimeReference.current = performance.now();

      const nativePointerEvent = event.nativeEvent;

      const animateHoldProgress = (currentTime: number) => {
        const elapsedTime = currentTime - startTimeReference.current;
        const progressRatio = Math.min(elapsedTime / HOLD_DURATION_MILLISECONDS, 1);
        setHoldProgress(progressRatio * 100);

        if (progressRatio < 1) {
          animationFrameReference.current = requestAnimationFrame(animateHoldProgress);
        }
      };
      animationFrameReference.current = requestAnimationFrame(animateHoldProgress);

      holdTimerReference.current = setTimeout(() => {
        holdTimerReference.current = null;

        if (animationFrameReference.current) {
          cancelAnimationFrame(animationFrameReference.current);
          animationFrameReference.current = null;
        }

        setHoldProgress(0);
        setIsDragging(true);
        isDraggingReference.current = true;

        window.getSelection()?.removeAllRanges();
        blockTouchScroll();
        dragControls.start(nativePointerEvent);
      }, HOLD_DURATION_MILLISECONDS);
    },
    [dragControls, blockTouchScroll, lockTextSelection]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (isDraggingReference.current || !startPositionReference.current) return;

      const distanceMovedPixels = Math.hypot(
        event.clientX - startPositionReference.current.x,
        event.clientY - startPositionReference.current.y
      );

      if (distanceMovedPixels > MAX_MOVEMENT_TOLERANCE_PIXELS) {
        cancelHold();
        unlockTextSelection();
      }
    },
    [cancelHold, unlockTextSelection]
  );

  const finishPointerInteraction = useCallback(() => {
    cancelHold();
    if (isDraggingReference.current) {
      setIsDragging(false);
      isDraggingReference.current = false;
      unblockTouchScroll();
    }
    unlockTextSelection();
  }, [cancelHold, unblockTouchScroll, unlockTextSelection]);

  const handleDragEnd = useCallback(() => {
    unblockTouchScroll();
    unlockTextSelection();
    setIsDragging(false);
    isDraggingReference.current = false;
    handleThumbnailDragEnd();
  }, [unblockTouchScroll, unlockTextSelection, handleThumbnailDragEnd]);

  return {
    thumbnailUrl,
    isDragging,
    holdProgress,
    dragControls,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: finishPointerInteraction,
    handlePointerCancel: finishPointerInteraction,
    handleDragEnd,
    handleImageError,
  };
}