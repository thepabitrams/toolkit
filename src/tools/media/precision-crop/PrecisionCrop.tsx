// src/tools/media/precision-crop/PrecisionCrop.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/uploaders';
import { FileCard } from '@/shared/components/file-card';
import { DimensionInput } from './DimensionInput';
import { Cropper } from './Cropper';
import { ExportPanel } from '@/shared/components/export-panel';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Card } from '@/core/components/ui';
import { spring, stagger } from '@/config/motion';
import type { Unit } from './DimensionInput';

const MASTER_BUCKET = 'original';
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

interface PrecisionCropProps {
  category: string;
  toolId: string;
}

export function PrecisionCrop({ toolId }: PrecisionCropProps): React.JSX.Element {
  const { 
    init,
    upload, 
    save, 
    selectAll, 
    deleteBucket, 
    moveToTool, 
    activeFileId, 
    setActiveFile
  } = useFileStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    init(MAXIMUM_TOOL_FILES);
  }, [init]);

  const originalFileReferences = selectAll(MASTER_BUCKET);
  const activeOriginalFileReference = 
    originalFileReferences.find((fileReference) => fileReference.id === activeFileId) || 
    originalFileReferences[0] || 
    null;

  const activeLockerBucketName = activeOriginalFileReference 
    ? activeOriginalFileReference.name.replace('image', 'locker') 
    : '';
    
  const activeProcessedFileReference = activeOriginalFileReference 
    ? selectAll(activeLockerBucketName)[0] || null 
    : null;

  useEffect(() => {
    if (!activeFileId && originalFileReferences.length > 0) {
      setActiveFile(originalFileReferences[0].id);
    }
  }, [activeFileId, originalFileReferences, setActiveFile]);

  const [cropConfiguration, setCropConfiguration] = useState({
    rawWidth: 1,
    rawHeight: 1,
    unit: 'px' as Unit,
    dpi: 96,
    widthPixels: 1,
    heightPixels: 1,
  });

  const handleFileUpload = useCallback(async (uploadedFiles: File[]): Promise<void> => {
    setIsProcessing(true);
    try {
      await upload(uploadedFiles, MASTER_BUCKET, MAXIMUM_TOOL_FILES, undefined, 'image');
    } catch (caughtError) {
      console.warn('Upload failed:', caughtError);
    } finally {
      setIsProcessing(false);
    }
  }, [upload]);

  const handleCropConfirm = useCallback(async (processedBlob: Blob, outputFileName: string): Promise<void> => {
    if (!activeOriginalFileReference) return;
    
    setIsProcessing(true);
    try {
      const croppedFile = new File([processedBlob], outputFileName, { type: processedBlob.type });
      await save([croppedFile], activeLockerBucketName, MAXIMUM_TOOL_FILES, activeOriginalFileReference.id, 0, 'process1');
    } catch (caughtError) {
      console.warn('Save failed:', caughtError);
    } finally {
      setIsProcessing(false);
    }
  }, [save, activeOriginalFileReference, activeLockerBucketName]);

  const handleClearWorkspace = useCallback(async (): Promise<void> => {
    await deleteBucket(MASTER_BUCKET);
    
    originalFileReferences.forEach((originalFileReference) => {
      const lockerBucketName = originalFileReference.name.replace('image', 'locker');
      deleteBucket(lockerBucketName);
    });
    
    setActiveFile(null);
  }, [deleteBucket, originalFileReferences, setActiveFile]);

  const handleToolSelection = useCallback(async (targetToolSlug: string): Promise<void> => {
    if (!targetToolSlug || !activeProcessedFileReference) return;
    await moveToTool(activeProcessedFileReference.name, targetToolSlug);
    window.location.href = `/${targetToolSlug}`;
  }, [moveToTool, activeProcessedFileReference]);

  const handleDimensionChange = (
    updatedWidthPixels: number,
    updatedHeightPixels: number,
    updatedRawWidth: number,
    updatedRawHeight: number,
    updatedUnit: Unit,
    updatedDpi: number
  ): void => {
    setCropConfiguration({
      rawWidth: updatedRawWidth,
      rawHeight: updatedRawHeight,
      unit: updatedUnit,
      dpi: updatedDpi,
      widthPixels: updatedWidthPixels,
      heightPixels: updatedHeightPixels,
    });
  };

  const aspectRatio = cropConfiguration.widthPixels / cropConfiguration.heightPixels;
  const hasActiveOriginalFileReference = !!activeOriginalFileReference;
  const hasProcessedFileReference = !!activeProcessedFileReference;

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      
      <div className="w-full">
        <GalleryUploader
          originalFileReferences={originalFileReferences}
          activeFileIdentifier={activeFileId}
          acceptedMimeTypes={IMAGE_CONFIG.accept}
          isUploading={isProcessing}
          handleFileUpload={handleFileUpload}
        />
      </div>

      {hasActiveOriginalFileReference && (
        <motion.div 
          variants={workspaceContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start"
        >
          <motion.div 
            variants={workspaceCardVariants}
            className="lg:col-span-4 w-full"
          >
            <Card className="w-full p-0">
              <DimensionInput
                initialWidth={cropConfiguration.rawWidth}
                initialHeight={cropConfiguration.rawHeight}
                onSizeChange={handleDimensionChange}
              />
            </Card>
          </motion.div>

          <motion.div 
            variants={workspaceCardVariants}
            className="lg:col-span-8 w-full"
          >
            <Card className="w-full p-0 overflow-hidden">
              <Cropper
                fileReference={activeOriginalFileReference}
                aspectRatio={aspectRatio}
                targetWidthPixels={cropConfiguration.widthPixels}
                targetHeightPixels={cropConfiguration.heightPixels}
                inputDpi={cropConfiguration.dpi}
                handleCropConfirm={handleCropConfirm}
              />
            </Card>
          </motion.div>
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
              <FileCard fileReference={activeProcessedFileReference} />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full p-0 overflow-hidden">
              <ExportPanel
                fileReference={activeProcessedFileReference}
                actionVariant="single"
                defaultFileName={`${cropConfiguration.rawWidth}x${cropConfiguration.rawHeight}`}
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