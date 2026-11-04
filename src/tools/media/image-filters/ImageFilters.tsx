// src/tools/media/image-filters/ImageFilters.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/uploaders';
import { FileCard } from '@/shared/components/file-card';
import { ExportPanel } from '@/shared/components/export-panel';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Card } from '@/core/components/ui';
import { spring, stagger } from '@/config/motion';
import { Editor } from './Editor';

const MASTER_BUCKET = 'original';
const PROCESS_BUCKET = 'process';
const MAXIMUM_TOOL_FILES = 15;

const workspaceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger.standard },
  },
};

const workspaceCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.standard,
  },
};

interface ImageFiltersProps {
  category: string;
  toolId: string;
}

export function ImageFilters({ toolId }: ImageFiltersProps): React.JSX.Element {
  const {
    init,
    upload,
    save,
    selectAll,
    deleteBucket,
    moveToTool,
    activeFileId,
    setActiveFile,
  } = useFileStore();

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    init(MAXIMUM_TOOL_FILES);
  }, [init]);

  const originalFileReferences = selectAll(MASTER_BUCKET);
  const activeOriginalFileReference =
    originalFileReferences.find((fileReference) => fileReference.id === activeFileId) || 
    originalFileReferences[0] || 
    null;

  const processedFileReferences = selectAll(PROCESS_BUCKET);
  const latestProcessedFileReference =
    processedFileReferences.length > 0 ? processedFileReferences[processedFileReferences.length - 1] : null;

  useEffect(() => {
    if (!activeFileId && originalFileReferences.length > 0) {
      setActiveFile(originalFileReferences[0].id);
    }
  }, [activeFileId, originalFileReferences, setActiveFile]);

  const handleFileUpload = useCallback(
    async (droppedFiles: File[]): Promise<void> => {
      if (droppedFiles.length === 0) return;
      
      setIsUploading(true);
      try {
        await upload(droppedFiles, MASTER_BUCKET, MAXIMUM_TOOL_FILES, undefined, 'image');
      } catch (caughtError) {
        console.warn('Upload failed:', caughtError);
      } finally {
        setIsUploading(false);
      }
    },
    [upload]
  );

  const handleProcessImage = useCallback(
    async (processedBlob: Blob): Promise<void> => {
      if (!activeOriginalFileReference) return;
      
      setIsUploading(true);
      try {
        const fileExtension = processedBlob.type.split('/')[1] || 'png';
        const resultFile = new File(
          [processedBlob],
          `filtered.${fileExtension}`,
          { type: processedBlob.type }
        );
        await save([resultFile], PROCESS_BUCKET, MAXIMUM_TOOL_FILES, activeOriginalFileReference.id, 0);
      } catch (caughtError) {
        console.warn('Save failed:', caughtError);
      } finally {
        setIsUploading(false);
      }
    },
    [activeOriginalFileReference, save]
  );

  const handleClearWorkspace = useCallback(async (): Promise<void> => {
    await deleteBucket(MASTER_BUCKET);
    await deleteBucket(PROCESS_BUCKET);
    setActiveFile(null);
  }, [deleteBucket, setActiveFile]);

  const handleToolSelection = useCallback(
    async (targetToolSlug: string): Promise<void> => {
      if (!targetToolSlug || !latestProcessedFileReference) return;
      await moveToTool(latestProcessedFileReference.name, targetToolSlug);
      window.location.href = `/${targetToolSlug}`;
    },
    [moveToTool, latestProcessedFileReference]
  );

  const hasActiveOriginalFileReference = !!activeOriginalFileReference;
  const hasProcessedFileReference = !!latestProcessedFileReference;

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      <div className="w-full">
        <GalleryUploader
          originalFileReferences={originalFileReferences}
          activeFileIdentifier={activeFileId}
          acceptedMimeTypes={IMAGE_CONFIG.accept}
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
        />
      </div>

      {hasActiveOriginalFileReference && (
        <motion.div
          variants={workspaceCardVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <Card className="w-full p-0 overflow-hidden">
            <Editor
              fileReference={activeOriginalFileReference}
              onProcessImage={handleProcessImage}
            />
          </Card>
        </motion.div>
      )}

      {hasProcessedFileReference && (
        <motion.div
          variants={workspaceContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 items-start"
        >
          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full h-full">
            <Card className="w-full h-full p-0 overflow-hidden flex flex-col">
              <FileCard fileReference={latestProcessedFileReference} />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full h-full">
            <Card className="w-full h-full p-0 overflow-hidden">
              <ExportPanel
                fileReference={latestProcessedFileReference}
                actionVariant="single"
                defaultFileName="filtered"
                handleClearFiles={handleClearWorkspace}
                currentToolSlug={toolId}
                handleToolSelection={handleToolSelection}
              />
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}