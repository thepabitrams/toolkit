// src/tools/media/precision-crop/PrecisionCrop.tsx
import { useState, useCallback } from 'react';
import { useFileStore } from '@/shared/store/file-store';
import { syncCatalogToDatabase } from '@/shared/store/file-store/file-utils';
import { FileUpload } from '@/shared/components/file-upload';
import { FileCard } from '@/shared/components/file-card';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { DimensionInput } from './DimensionInput';
import { Cropper } from './Cropper';
import { ExportPanel } from '@/shared/components/export-panel';
import { Grid } from '@/core/components/ui/Grid';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import type { Unit } from './DimensionInput';
import type { FileReference } from '@/shared/store/file-store';

interface PrecisionCropProperties {
  category: string;
  toolId: string;
}

export function PrecisionCrop({ toolId }: PrecisionCropProperties): React.JSX.Element {
  const { 
    list: listToolFiles, 
    upload: uploadFiles, 
    save: saveProcessedFiles, 
    clear: clearToolFiles, 
    promote: promoteFile, 
    remove: removeFile 
  } = useFileStore();
  
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const originalFileList = listToolFiles('original');
  const activeOriginalFile = originalFileList.length > 0 ? originalFileList[0] : null;

  const processedFileList = listToolFiles('process');
  const latestProcessedFile = processedFileList.length > 0 ? processedFileList[processedFileList.length - 1] : null;

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
      await uploadFiles(selectedFiles);
    } catch (error) {
      console.warn('Upload failed:', error);
    } finally {
      setIsProcessingImage(false);
    }
  }, [uploadFiles]);

  const handleFileRemove = useCallback(async () => {
    if (activeOriginalFile) {
      await clearToolFiles();
    }
  }, [activeOriginalFile, clearToolFiles]);

  const handleCropConfirm = useCallback(async (croppedBlob: Blob, generatedFileName: string) => {
    setIsProcessingImage(true);
    try {
      const processedFileObject = new File([croppedBlob], generatedFileName, { type: croppedBlob.type });
      await saveProcessedFiles([processedFileObject]);
    } catch (error) {
      console.warn('Save failed:', error);
    } finally {
      setIsProcessingImage(false);
    }
  }, [saveProcessedFiles]);

  const handleToolSelection = useCallback(
    async (targetToolSlug: string, promotionVariant: 'single' | 'multiple') => {
      if (!targetToolSlug) {
        alert('Error: No tool selected.');
        return;
      }

      const currentProcessedList = listToolFiles('process');
      if (currentProcessedList.length === 0) {
        alert('No processed files to promote');
        return;
      }

      const latestFileName = currentProcessedList[currentProcessedList.length - 1]?.name;

      const currentState = useFileStore.getState();
      const targetToolOriginals = currentState.original.filter((ref: FileReference) => ref.toolId === targetToolSlug);

      if (targetToolOriginals.length > 0) {
        const userConfirmed = window.confirm(
          `The target tool already has ${targetToolOriginals.length} file(s).\n\n` +
          `• Click "OK" → REPLACE (delete old files, use new ones)\n` +
          `• Click "CANCEL" → Stay in current tool`
        );

        if (userConfirmed) {
          for (const fileReference of targetToolOriginals) {
            await removeFile(fileReference.name);
          }
          useFileStore.setState((previousState) => ({
            original: previousState.original.filter((ref: FileReference) => ref.toolId !== targetToolSlug),
          }));
          await syncCatalogToDatabase(
            useFileStore.getState().original,
            useFileStore.getState().process
          );
        } else {
          return;
        }
      }

      if (promotionVariant === 'single' && latestFileName) {
        await promoteFile(latestFileName, targetToolSlug);
      } else {
        await promoteFile(undefined, targetToolSlug);
      }

      window.location.href = `/${targetToolSlug}`;
    },
    [listToolFiles, promoteFile, removeFile]
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
      <Grid minCardWidth={360} gap={16}>
        <Stagger delay={100}>
          <Motion
            preset={zoomIn}
            as="div"
            className="col-span-1"
            delay={0}
            style={{ opacity: 0, transform: 'scale(0.5)' }}
          >
            <FileUpload
              fileReference={activeOriginalFile}
              uploadVariant="single"
              acceptedMimeTypes={IMAGE_CONFIG.accept}
              uploadLabel={IMAGE_CONFIG.label}
              fileExtensions={IMAGE_CONFIG.extensions}
              isUploading={isProcessingImage}
              handleFileUpload={handleFileUpload}
              handleFileRemove={handleFileRemove}
              minWidth={360}
              minHeight={400}
              padding={0}
            />
          </Motion>

          {hasOriginalFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
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
              delay={200}
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
              delay={300}
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
              delay={400}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <ExportPanel
                fileReference={latestProcessedFile}
                actionVariant="single"
                defaultFileName={`${cropConfiguration.rawWidth}x${cropConfiguration.rawHeight}`}
                handleClearFiles={clearToolFiles}
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