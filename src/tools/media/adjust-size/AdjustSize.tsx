// src/tools/media/adjust-size/AdjustSize.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/uploaders';
import { FileCard } from '@/shared/components/file-card';
import { ExportPanel } from '@/shared/components/export-panel';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Card } from '@/core/components/ui';
import { spring, stagger } from '@/config/motion';
import { Controls } from './Controls';
import { useAdjustSize } from './useAdjustSize';

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

interface AdjustSizeProps {
  category: string;
  toolId: string;
}

export function AdjustSize({ toolId }: AdjustSizeProps): React.JSX.Element {
  const {
    init,
    upload,
    save,
    selectAll,
    deleteBucket,
    moveToTool,
    getRawFile,
    activeFileId,
    setActiveFile,
  } = useFileStore();

  const [isUploading, setIsUploading] = useState(false);
  const [minSizeKB, setMinSizeKB] = useState(50);
  const [maxSizeKB, setMaxSizeKB] = useState(200);
  const { processImage, isProcessing: isCompressing } = useAdjustSize();

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

  const handleProcessImage = useCallback(async (): Promise<void> => {
    if (!activeOriginalFileReference) return;
    if (minSizeKB >= maxSizeKB) return;

    setIsUploading(true);
    try {
      const sourceRawFile = await getRawFile(activeOriginalFileReference.storageKey);
      if (!sourceRawFile) throw new Error('Failed to read file from storage');

      const processingResult = await processImage(sourceRawFile, minSizeKB, maxSizeKB);
      if (!processingResult?.processedBlob) throw new Error('Processing failed: No blob returned');

      if (!processingResult.isWithinRange && processingResult.error) {
        console.warn(processingResult.error);
      }

      const finalExtension = processingResult.outputMimeType.split('/')[1] || 'png';
      const generatedFileObject = new File(
        [processingResult.processedBlob],
        `adjusted-${minSizeKB}-${maxSizeKB}KB.${finalExtension}`,
        { type: processingResult.outputMimeType }
      );

      await save([generatedFileObject], PROCESS_BUCKET, MAXIMUM_TOOL_FILES, activeOriginalFileReference.id, 0);
    } catch (caughtError) {
      console.error('Processing failed:', caughtError);
    } finally {
      setIsUploading(false);
    }
  }, [activeOriginalFileReference, minSizeKB, maxSizeKB, processImage, save, getRawFile]);

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
          <Card className="w-full p-0">
            <Controls
              minSizeKB={minSizeKB}
              maxSizeKB={maxSizeKB}
              onMinSizeChange={setMinSizeKB}
              onMaxSizeChange={setMaxSizeKB}
              onProcess={handleProcessImage}
              isProcessing={isCompressing || isUploading}
              hasActiveFile={hasActiveOriginalFileReference}
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
          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full h-full p-0 overflow-hidden flex flex-col">
              <FileCard fileReference={latestProcessedFileReference} />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full p-0 overflow-hidden">
              <ExportPanel
                fileReference={latestProcessedFileReference}
                actionVariant="single"
                defaultFileName={`adjusted-${minSizeKB}-${maxSizeKB}KB`}
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