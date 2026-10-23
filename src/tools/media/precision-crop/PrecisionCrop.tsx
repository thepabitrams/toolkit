import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/uploaders';
import { FileCard } from '@/shared/components/file-card';
import { DimensionInput } from './DimensionInput';
import { Cropper } from './Cropper';
import { ExportPanel } from '@/shared/components/export-panel';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Card } from '@/core/components/ui';
import { pageStaggerContainer, cardSpringItem } from '@/config/motion';
import type { Unit } from './DimensionInput';

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

  const MASTER_BUCKET = 'original';

  useEffect(() => {
    init();
  }, [init]);

  const originals = selectAll(MASTER_BUCKET);
  const activeOriginal = originals.find((file) => file.id === activeFileId) || originals[0] || null;

  const activeLocker = activeOriginal ? activeOriginal.name.replace('image', 'locker') : '';
  const activeProcessed = activeOriginal ? selectAll(activeLocker)[0] || null : null;

  useEffect(() => {
    if (!activeFileId && originals.length > 0) {
      setActiveFile(originals[0].id);
    }
  }, [activeFileId, originals, setActiveFile]);

  const [cropConfig, setCropConfig] = useState({
    rawWidth: 1,
    rawHeight: 1,
    unit: 'px' as Unit,
    dpi: 96,
    widthPixels: 1,
    heightPixels: 1,
  });

  const onFileUpload = useCallback(async (files: File[]): Promise<void> => {
    setIsProcessing(true);
    try {
      await upload(files, MASTER_BUCKET, undefined, 'image');
    } catch (error) {
      console.warn('Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [upload]);

  const onCropConfirm = useCallback(async (blob: Blob, fileName: string): Promise<void> => {
    if (!activeOriginal) return;
    
    setIsProcessing(true);
    try {
      const file = new File([blob], fileName, { type: blob.type });
      await save([file], activeLocker, activeOriginal.id, 0, 'process1');
    } catch (error) {
      console.warn('Save failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [save, activeOriginal, activeLocker]);

  const onClearAll = useCallback(async (): Promise<void> => {
    await deleteBucket(MASTER_BUCKET);
    
    originals.forEach((original) => {
      const lockerName = original.name.replace('image', 'locker');
      deleteBucket(lockerName);
    });
    
    setActiveFile(null);
  }, [deleteBucket, originals, setActiveFile]);

  const onToolSelect = useCallback(async (targetSlug: string): Promise<void> => {
    if (!targetSlug || !activeProcessed) return;
    await moveToTool(activeProcessed.name, targetSlug);
    window.location.href = `/${targetSlug}`;
  }, [moveToTool, activeProcessed]);

  const onDimensionChange = (
    widthPixels: number,
    heightPixels: number,
    rawWidth: number,
    rawHeight: number,
    unit: Unit,
    dpi: number
  ): void => {
    setCropConfig({
      rawWidth,
      rawHeight,
      unit,
      dpi,
      widthPixels,
      heightPixels,
    });
  };

  const aspectRatio = cropConfig.widthPixels / cropConfig.heightPixels;
  const hasOriginal = !!activeOriginal;
  const hasProcessed = !!activeProcessed;

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      
      <div className="-mx-4 sm:mx-0">
        <GalleryUploader
          files={originals}
          activeFileId={activeFileId}
          acceptedMimeTypes={IMAGE_CONFIG.accept}
          isUploading={isProcessing}
          handleFileUpload={onFileUpload}
        />
      </div>

      {hasOriginal && (
        <motion.div 
          variants={pageStaggerContainer}
          initial="hidden"
          animate="visible"
          className="-mx-4 sm:mx-0 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start"
        >
          {/* 🚨 FIXED: Removed sticky and the extra wrapper div */}
          <motion.div 
            variants={cardSpringItem}
            className="lg:col-span-4 w-full"
          >
            <Card className="w-full p-0 border-slate-200/80 dark:border-gray-800 rounded-none sm:rounded-3xl shadow-sm bg-white dark:bg-gray-900">
              <DimensionInput
                initialWidth={cropConfig.rawWidth}
                initialHeight={cropConfig.rawHeight}
                onSizeChange={onDimensionChange}
              />
            </Card>
          </motion.div>

          <motion.div 
            variants={cardSpringItem}
            className="lg:col-span-8 w-full"
          >
            <Card className="w-full p-0 border-slate-200/80 dark:border-gray-800 rounded-none sm:rounded-3xl shadow-sm bg-white dark:bg-gray-900">
              <Cropper
                fileReference={activeOriginal}
                aspectRatio={aspectRatio}
                targetWidthPixels={cropConfig.widthPixels}
                targetHeightPixels={cropConfig.heightPixels}
                inputDpi={cropConfig.dpi}
                handleCropConfirm={onCropConfirm}
              />
            </Card>
          </motion.div>
        </motion.div>
      )}

      {hasProcessed && (
        <motion.div 
          variants={pageStaggerContainer}
          initial="hidden"
          animate="visible"
          className="-mx-4 sm:mx-0 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 items-start"
        >
          <motion.div variants={cardSpringItem} className="col-span-1 w-full">
            <Card className="w-full h-full p-0 border-slate-200/80 dark:border-gray-800 rounded-none sm:rounded-3xl shadow-sm bg-white dark:bg-gray-900 flex flex-col">
              <FileCard
                fileReference={activeProcessed}
                displayVariant="process"
              />
            </Card>
          </motion.div>

          <motion.div variants={cardSpringItem} className="col-span-1 w-full">
            <Card className="w-full p-0 border-slate-200/80 dark:border-gray-800 rounded-none sm:rounded-3xl shadow-sm bg-white dark:bg-gray-900">
              <ExportPanel
                fileReference={activeProcessed}
                actionVariant="single"
                defaultFileName={`${cropConfig.rawWidth}x${cropConfig.rawHeight}`}
                handleClearFiles={onClearAll}
                currentToolSlug={toolId}
                handleToolSelection={onToolSelect}
              />
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}