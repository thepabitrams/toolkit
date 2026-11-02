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
    init();
  }, [init]);

  const originalFiles = selectAll(MASTER_BUCKET);
  const activeOriginalFile =
    originalFiles.find((file) => file.id === activeFileId) || originalFiles[0] || null;

  const processedFiles = selectAll(PROCESS_BUCKET);
  const latestProcessedFile =
    processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;

  useEffect(() => {
    if (!activeFileId && originalFiles.length > 0) {
      setActiveFile(originalFiles[0].id);
    }
  }, [activeFileId, originalFiles, setActiveFile]);

  const handleFileUpload = useCallback(
    async (droppedFiles: File[]): Promise<void> => {
      if (droppedFiles.length === 0) return;
      
      setIsUploading(true);
      try {
        await upload([droppedFiles[0]], MASTER_BUCKET, undefined, 'image');
      } catch (error) {
        console.warn('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [upload]
  );

  const handleProcessImage = useCallback(async (): Promise<void> => {
    if (!activeOriginalFile) return;
    if (minSizeKB >= maxSizeKB) return;

    setIsUploading(true);
    try {
      const sourceFile = await getRawFile(activeOriginalFile.storageKey);
      if (!sourceFile) throw new Error('Failed to read file from storage');

      const result = await processImage(sourceFile, minSizeKB, maxSizeKB);
      if (!result?.processedBlob) throw new Error('Processing failed: No blob returned');

      if (!result.isWithinRange && result.error) {
        console.warn(result.error);
      }

      const finalExtension = result.outputMimeType.split('/')[1] || 'png';
      const resultFile = new File(
        [result.processedBlob],
        `adjusted-${minSizeKB}-${maxSizeKB}KB.${finalExtension}`,
        { type: result.outputMimeType }
      );

      await save([resultFile], PROCESS_BUCKET, undefined, 0);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [activeOriginalFile, minSizeKB, maxSizeKB, processImage, save, getRawFile]);

  const handleClearWorkspace = useCallback(async (): Promise<void> => {
    await deleteBucket(MASTER_BUCKET);
    await deleteBucket(PROCESS_BUCKET);
    setActiveFile(null);
  }, [deleteBucket, setActiveFile]);

  const handleToolSelection = useCallback(
    async (targetToolSlug: string): Promise<void> => {
      if (!targetToolSlug || !latestProcessedFile) return;
      await moveToTool(latestProcessedFile.name, targetToolSlug);
      window.location.href = `/${targetToolSlug}`;
    },
    [moveToTool, latestProcessedFile]
  );

  const hasActiveFile = !!activeOriginalFile;
  const hasProcessedFile = !!latestProcessedFile;

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      <div className="w-full">
        <GalleryUploader
          files={originalFiles}
          activeFileId={activeFileId}
          acceptedMimeTypes={IMAGE_CONFIG.accept}
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
        />
      </div>

      {hasActiveFile && (
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
              hasActiveFile={hasActiveFile}
            />
          </Card>
        </motion.div>
      )}

      {hasProcessedFile && (
        <motion.div
          variants={workspaceContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 items-start"
        >
          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full h-full p-0 overflow-hidden flex flex-col">
              <FileCard fileReference={latestProcessedFile} displayVariant="process" />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full p-0 overflow-hidden">
              <ExportPanel
                fileReference={latestProcessedFile}
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