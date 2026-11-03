// src/tools/media/background-remove/BackgroundRemove.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/uploaders';
import { FileCard } from '@/shared/components/file-card';
import { ExportPanel } from '@/shared/components/export-panel';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Card } from '@/core/components/ui';
import { spring, stagger } from '@/config/motion';
import { RemoveEditor } from './remove';
import { AddEditor } from './add';

const MASTER_BUCKET = 'original';
const CUTOUT_BUCKET = 'cutout';
const PROCESS_BUCKET = 'process';

const workspaceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: stagger.standard } },
};

const workspaceCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.standard },
};

interface BackgroundRemoveProps {
  category: string;
  toolId: string;
}

export function BackgroundRemove({ toolId }: BackgroundRemoveProps): React.JSX.Element {
  const { init, upload, selectAll, deleteBucket, moveToTool, activeFileId, setActiveFile } = useFileStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { init(); }, [init]);

  const originalFiles = selectAll(MASTER_BUCKET);
  const activeOriginalFile = originalFiles.find((file) => file.id === activeFileId) || originalFiles[0] || null;

  const cutoutFiles = selectAll(CUTOUT_BUCKET);
  const latestCutoutFile = cutoutFiles.length > 0 ? cutoutFiles[cutoutFiles.length - 1] : null;

  const processedFiles = selectAll(PROCESS_BUCKET);
  const latestProcessedFile = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;

  useEffect(() => {
    if (!activeFileId && originalFiles.length > 0) setActiveFile(originalFiles[0].id);
  }, [activeFileId, originalFiles, setActiveFile]);

  const handleFileUpload = useCallback(async (droppedFiles: File[]): Promise<void> => {
    if (droppedFiles.length === 0) return;
    setIsUploading(true);
    try {
      await upload([droppedFiles[0]], MASTER_BUCKET, undefined, 'image');
      await deleteBucket(CUTOUT_BUCKET);
      await deleteBucket(PROCESS_BUCKET);
    } catch (error) {
      console.warn('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [upload, deleteBucket]);

  const handleClearWorkspace = useCallback(async (): Promise<void> => {
    await deleteBucket(MASTER_BUCKET);
    await deleteBucket(CUTOUT_BUCKET);
    await deleteBucket(PROCESS_BUCKET);
    setActiveFile(null);
  }, [deleteBucket, setActiveFile]);

  const handleToolSelection = useCallback(async (targetToolSlug: string): Promise<void> => {
    if (!targetToolSlug || !latestProcessedFile) return;
    await moveToTool(latestProcessedFile.name, targetToolSlug);
    window.location.href = `/${targetToolSlug}`;
  }, [moveToTool, latestProcessedFile]);

  const hasActiveFile = !!activeOriginalFile;
  const hasCutoutFile = !!latestCutoutFile;
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
        <motion.div variants={workspaceContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          <motion.div variants={workspaceCardVariants} className="w-full">
            <Card className="w-full p-0 overflow-hidden">
              <RemoveEditor fileReference={activeOriginalFile} />
            </Card>
          </motion.div>

          {hasCutoutFile && (
            <motion.div variants={workspaceCardVariants} className="w-full">
              <Card className="w-full p-0 overflow-hidden">
                <AddEditor cutoutFileReference={latestCutoutFile} />
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {hasProcessedFile && (
        <motion.div variants={workspaceContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 items-start">
          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full p-0 overflow-hidden flex flex-col">
              <FileCard fileReference={latestProcessedFile} />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full p-0 overflow-hidden">
              <ExportPanel
                fileReference={latestProcessedFile}
                actionVariant="single"
                defaultFileName="background-removed"
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