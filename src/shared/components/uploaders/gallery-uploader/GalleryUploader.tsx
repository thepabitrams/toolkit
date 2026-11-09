import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, Reorder } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import type { FileReference } from '@/shared/store/file-store';
import { GalleryThumbnail } from './GalleryThumbnail';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui';
import { FiPlus, FiUploadCloud } from 'react-icons/fi';

interface GalleryUploaderProperties {
  originalFileReferences: FileReference[];
  activeFileIdentifier: string | null;
  acceptedMimeTypes: Record<string, string[]>;
  isUploading: boolean;
  handleFileUpload: (droppedFiles: File[]) => void;
}

export const GalleryUploader: React.FC<GalleryUploaderProperties> = ({
  originalFileReferences,
  activeFileIdentifier,
  acceptedMimeTypes,
  isUploading,
  handleFileUpload,
}) => {
  const setActiveFileAction = useFileStore((state) => state.setActiveFile);
  const reorderBucketAction = useFileStore((state) => state.reorderBucket);

  const [displayedFileReferences, setDisplayedFileReferences] =
    useState<FileReference[]>(originalFileReferences);
  const draggedFileIdentifierReference = useRef<string | null>(null);

  const displayedFileReferencesReference = useRef(displayedFileReferences);
  displayedFileReferencesReference.current = displayedFileReferences;

  const originalFileReferencesReference = useRef(originalFileReferences);
  originalFileReferencesReference.current = originalFileReferences;

  useEffect(() => {
    if (draggedFileIdentifierReference.current) return;
    setDisplayedFileReferences(originalFileReferences);
  }, [originalFileReferences]);

  const handleDropFiles = useCallback(
    (droppedFiles: File[]) => {
      if (droppedFiles.length > 0) {
        handleFileUpload(droppedFiles);
      }
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDropFiles,
    accept: acceptedMimeTypes,
    disabled: isUploading,
    multiple: true,
    noClick: true,
  });

  const {
    onClick: dropzoneOnClick,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    ...dropzoneRootProperties
  } = getRootProps();

  const handleReorder = useCallback((updatedFileOrder: FileReference[]) => {
    setDisplayedFileReferences(updatedFileOrder);
  }, []);

  const handleThumbnailDragStart = useCallback((fileIdentifier: string) => {
    draggedFileIdentifierReference.current = fileIdentifier;
  }, []);

  const handleThumbnailDragEnd = useCallback(() => {
    const draggedFileIdentifier = draggedFileIdentifierReference.current;
    draggedFileIdentifierReference.current = null;
    if (!draggedFileIdentifier) return;

    const originalFileIndex = originalFileReferencesReference.current.findIndex(
      (fileReference) => fileReference.id === draggedFileIdentifier
    );
    const targetFileIndex = displayedFileReferencesReference.current.findIndex(
      (fileReference) => fileReference.id === draggedFileIdentifier
    );

    if (originalFileIndex !== -1 && targetFileIndex !== -1 && originalFileIndex !== targetFileIndex) {
      reorderBucketAction('original', originalFileIndex, targetFileIndex);
    }
  }, [reorderBucketAction]);

  const handleThumbnailClick = useCallback(
    (fileIdentifier: string) => {
      setActiveFileAction(fileIdentifier);
    },
    [setActiveFileAction]
  );

  return (
    <div
      {...dropzoneRootProperties}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="w-full"
    >
      <Card
        className={`relative flex flex-col overflow-hidden transition-all duration-200 ${
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
          <h3 className="select-none text-sm font-semibold text-slate-700 dark:text-gray-300">
            {displayedFileReferences.length} {displayedFileReferences.length === 1 ? 'Image' : 'Images'}
          </h3>
          <Button
            onClick={() => open()}
            variant="primary"
            disabled={isUploading}
            className="flex h-auto items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
          >
            <FiPlus className="h-3.5 w-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Add Image'}</span>
          </Button>
        </div>

        <motion.div
          layoutScroll
          className="flex w-full select-none flex-nowrap items-center overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-4 [-webkit-touch-callout:none] [-webkit-user-select:none] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
        >
          {displayedFileReferences.length === 0 && (
            <div className="pointer-events-none flex w-full flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-gray-400">No images yet.</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                Click "Add Image" or drag & drop files here.
              </p>
            </div>
          )}

          <Reorder.Group
            axis="x"
            values={displayedFileReferences}
            onReorder={handleReorder}
            className="flex w-max select-none items-center gap-4"
          >
            {displayedFileReferences.map((fileReference) => (
              <GalleryThumbnail
                key={fileReference.id}
                fileReference={fileReference}
                isActive={activeFileIdentifier === fileReference.id}
                handleThumbnailClick={handleThumbnailClick}
                handleThumbnailDragStart={handleThumbnailDragStart}
                handleThumbnailDragEnd={handleThumbnailDragEnd}
              />
            ))}
          </Reorder.Group>

          {displayedFileReferences.length > 0 && (
            <div className="pointer-events-none h-24 w-8 shrink-0" />
          )}
        </motion.div>
      </Card>
    </div>
  );
};