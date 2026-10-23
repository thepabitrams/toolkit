import { useState, useCallback, useEffect } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/gallery-uploader';
import { FileCard } from '@/shared/components/file-card';
import { DimensionInput } from './DimensionInput';
import { Cropper } from './Cropper';
import { ExportPanel } from '@/shared/components/export-panel';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { Grid } from '@/core/components/ui/Grid';
import type { Unit } from './DimensionInput';

interface PrecisionCropProperties {
  category: string;
  toolId: string;
}

export function PrecisionCrop({ toolId }: PrecisionCropProperties): React.JSX.Element {
  const { 
    upload, 
    save, 
    selectAll, 
    deleteBucket, 
    moveToTool, 
    activeFileId, 
    setActiveFile
  } = useFileStore();
  
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const originalFiles = selectAll('original');
  const processedFiles = selectAll('process');

  const activeOriginalFile = originalFiles.find((f) => f.id === activeFileId) || originalFiles[0] || null;

  const latestProcessedFile = processedFiles.length > 0 
    ? processedFiles[processedFiles.length - 1] 
    : null;

  useEffect(() => {
    if (!activeFileId && originalFiles.length > 0) {
      setActiveFile(originalFiles[0].id);
    }
  }, [activeFileId, originalFiles, setActiveFile]);

  const [cropConfiguration, setCropConfiguration] = useState({
    rawWidth: 1,
    rawHeight: 1,
    unit: 'px' as Unit,
    dpi: 96,
    widthPixels: 1,
    heightPixels: 1,
  });

  const handleFileUpload = useCallback(async (selectedFiles: File[]) => {
    setIsProcessingImage(true);
    try {
      await upload(selectedFiles, 'original');
    } catch (error) {
      console.warn('Upload failed:', error);
    } finally {
      setIsProcessingImage(false);
    }
  }, [upload]);

  const handleCropConfirm = useCallback(async (croppedBlob: Blob, generatedFileName: string) => {
    if (!activeOriginalFile) return;
    
    setIsProcessingImage(true);
    try {
      const processedFileObject = new File([croppedBlob], generatedFileName, { type: croppedBlob.type });
      await save([processedFileObject], 'process', activeOriginalFile.id);
    } catch (error) {
      console.warn('Save failed:', error);
    } finally {
      setIsProcessingImage(false);
    }
  }, [save, activeOriginalFile]);

  const handleClearAll = async () => {
    await deleteBucket('original');
    await deleteBucket('process');
    setActiveFile(null);
  };

  const handleToolSelection = useCallback(
    async (targetToolSlug: string) => {
      if (!targetToolSlug || !latestProcessedFile) return;
      await moveToTool(latestProcessedFile.name, targetToolSlug);
      window.location.href = `/${targetToolSlug}`;
    },
    [moveToTool, latestProcessedFile]
  );

  const handleDimensionChange = (
    widthPixels: number,
    heightPixels: number,
    rawWidth: number,
    rawHeight: number,
    unit: Unit,
    dpi: number
  ) => {
    setCropConfiguration({
      rawWidth,
      rawHeight,
      unit,
      dpi,
      widthPixels,
      heightPixels,
    });
  };

  const calculatedAspectRatio = cropConfiguration.widthPixels / cropConfiguration.heightPixels;
  const hasOriginalFile = !!activeOriginalFile;
  const hasProcessedOutput = !!latestProcessedFile;

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      {/* GALLERY UPLOADER - OUTSIDE THE GRID */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <GalleryUploader
          files={originalFiles}
          activeFileId={activeFileId}
          acceptedMimeTypes={IMAGE_CONFIG.accept}
          isUploading={isProcessingImage}
          handleFileUpload={handleFileUpload}
        />
      </div>

      {/* TOOL CARDS GRID - RESTORED TO ORIGINAL LAYOUT */}
      <Grid minCardWidth={360} gap={16}>
        <Stagger delay={100}>
          
          {hasOriginalFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={0}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <DimensionInput
                initialWidth={cropConfiguration.rawWidth}
                initialHeight={cropConfiguration.rawHeight}
                onSizeChange={handleDimensionChange}
                minWidth={360}
                minHeight={240}
                padding={0}
              />
            </Motion>
          )}

          {hasOriginalFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <Cropper
                fileReference={activeOriginalFile}
                aspectRatio={calculatedAspectRatio}
                targetWidthPixels={cropConfiguration.widthPixels}
                targetHeightPixels={cropConfiguration.heightPixels}
                inputDpi={cropConfiguration.dpi}
                handleCropConfirm={handleCropConfirm}
                minWidth={360}
                minHeight={500}
                padding={0}
              />
            </Motion>
          )}

          {hasProcessedOutput && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={200}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <FileCard
                fileReference={latestProcessedFile}
                displayVariant="process"
                minWidth={360}
                minHeight={350}
                padding={0}
              />
            </Motion>
          )}

          {hasProcessedOutput && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={300}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <ExportPanel
                fileReference={latestProcessedFile}
                actionVariant="single"
                defaultFileName={`${cropConfiguration.rawWidth}x${cropConfiguration.rawHeight}`}
                handleClearFiles={handleClearAll}
                currentToolSlug={toolId}
                handleToolSelection={handleToolSelection}
                minWidth={360}
                minHeight={200}
                padding={0}
              />
            </Motion>
          )}

        </Stagger>
      </Grid>
    </div>
  );
}