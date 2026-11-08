import { useState, useCallback, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { GalleryUploader } from '@/shared/components/uploaders';
import { FileCard } from '@/shared/components/file-card';
import { ExportPanel } from '@/shared/components/export-panel';
import { ConverterPanel, ConvertedFileCard } from './components';
import { useImageConverter, type OutputFormat } from './useImageConverter';
import { IMAGE_CONFIG } from '@/shared/entities/image';
import { Card } from '@/core/components/ui';
import { spring, stagger } from '@/config/motion';

const ORIGINAL_BUCKET = 'original';
const PROCESS_BUCKET = 'process';
const MAXIMUM_TOOL_FILES = 15;

const FORMAT_LABEL_BY_MIME: Record<OutputFormat, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
  'image/jxl': 'JXL',
  'image/bmp': 'BMP',
  'image/gif': 'GIF',
  'image/ico': 'ICO',
  'image/tga': 'TGA',
  'image/tiff': 'TIFF',
};

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

interface ImageConverterProps {
  category: string;
  toolId: string;
}

export function ImageConverter({ toolId }: ImageConverterProps): React.JSX.Element {
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

  const { conversionProgress, conversionError, convertFiles } = useImageConverter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('image/webp');
  const [outputQuality, setOutputQuality] = useState(80);
  const [convertedFormatByFileId, setConvertedFormatByFileId] = useState<
    Record<string, OutputFormat>
  >({});
  const [previewFileByFileId, setPreviewFileByFileId] = useState<Record<string, File>>({});

  useEffect(() => {
    init(MAXIMUM_TOOL_FILES);
  }, [init]);

  const originalFileReferences = selectAll(ORIGINAL_BUCKET);
  const processFileReferences = selectAll(PROCESS_BUCKET);

  const activeOriginalFileReference =
    originalFileReferences.find((fileReference) => fileReference.id === activeFileId) ||
    originalFileReferences[0] ||
    null;

  const activeConvertedFileReference = activeOriginalFileReference
    ? processFileReferences.find(
        (fileReference) => fileReference.parentId === activeOriginalFileReference.id
      ) ?? null
    : null;

  const activeConvertedFormat = activeOriginalFileReference
    ? convertedFormatByFileId[activeOriginalFileReference.id]
    : undefined;
  const activeFormatLabel = activeConvertedFormat
    ? FORMAT_LABEL_BY_MIME[activeConvertedFormat]
    : 'FILE';
  const activePreviewFile = activeOriginalFileReference
    ? previewFileByFileId[activeOriginalFileReference.id] ?? null
    : null;

  useEffect(() => {
    if (!activeFileId && originalFileReferences.length > 0) {
      setActiveFile(originalFileReferences[0].id);
    }
  }, [activeFileId, originalFileReferences, setActiveFile]);

  const replacePreviewFile = useCallback((fileId: string, previewFile: File | null): void => {
    setPreviewFileByFileId((previousFiles) => {
      if (previewFile) return { ...previousFiles, [fileId]: previewFile };
      const { [fileId]: ignoredFile, ...remainingFiles } = previousFiles;
      return remainingFiles;
    });
  }, []);

  const handleFileUpload = useCallback(
    async (uploadedFiles: File[]): Promise<void> => {
      setIsUploading(true);
      try {
        await upload(uploadedFiles, ORIGINAL_BUCKET, MAXIMUM_TOOL_FILES);
      } catch (caughtError) {
        console.warn('Upload failed:', caughtError);
      } finally {
        setIsUploading(false);
      }
    },
    [upload]
  );

  const handleConvert = useCallback(async (): Promise<void> => {
    if (!activeOriginalFileReference) return;

    let sourceFile: File | null = null;
    try {
      sourceFile = await getRawFile(activeOriginalFileReference.storageKey);
    } catch (caughtError) {
      console.warn('Failed to read source file:', caughtError);
      return;
    }
    if (!sourceFile) return;

    const conversionResults = await convertFiles([sourceFile], {
      outputFormat: selectedFormat,
      outputQuality,
    });
    if (conversionResults.length === 0) return;

    const { convertedFile, previewFile } = conversionResults[0];

    const existingProcessIndex = activeConvertedFileReference
      ? processFileReferences.findIndex(
          (fileReference) => fileReference.id === activeConvertedFileReference.id
        )
      : -1;

    try {
      await save(
        [convertedFile],
        PROCESS_BUCKET,
        MAXIMUM_TOOL_FILES,
        activeOriginalFileReference.id,
        existingProcessIndex >= 0 ? existingProcessIndex : undefined
      );
      replacePreviewFile(activeOriginalFileReference.id, previewFile);
      setConvertedFormatByFileId((previousFormats) => ({
        ...previousFormats,
        [activeOriginalFileReference.id]: selectedFormat,
      }));
    } catch (caughtError) {
      console.warn('Failed to save converted file:', caughtError);
    }
  }, [
    activeOriginalFileReference,
    activeConvertedFileReference,
    processFileReferences,
    convertFiles,
    getRawFile,
    replacePreviewFile,
    save,
    selectedFormat,
    outputQuality,
  ]);

  const handleClearWorkspace = useCallback(async (): Promise<void> => {
    await deleteBucket(ORIGINAL_BUCKET);
    await deleteBucket(PROCESS_BUCKET);
    setPreviewFileByFileId({});
    setConvertedFormatByFileId({});
    setActiveFile(null);
  }, [deleteBucket, setActiveFile]);

  const handleToolSelection = useCallback(
    async (targetToolSlug: string): Promise<void> => {
      if (!targetToolSlug || !activeConvertedFileReference) return;
      await moveToTool(activeConvertedFileReference.name, targetToolSlug);
      window.location.href = `/${targetToolSlug}`;
    },
    [moveToTool, activeConvertedFileReference]
  );

  const hasActiveOriginalFileReference = !!activeOriginalFileReference;
  const hasConvertedFileReference = !!activeConvertedFileReference;

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      <div className="w-full">
        <GalleryUploader
          originalFileReferences={originalFileReferences}
          activeFileIdentifier={activeFileId}
          acceptedMimeTypes={IMAGE_CONFIG.accept}
          isUploading={isUploading || conversionProgress.isConverting}
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
          <motion.div variants={workspaceCardVariants} className="lg:col-span-8 w-full">
            <Card className="w-full h-full p-0 overflow-hidden flex flex-col">
              <FileCard fileReference={activeOriginalFileReference} />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="lg:col-span-4 w-full">
            <Card className="w-full p-0">
              <ConverterPanel
                selectedFormat={selectedFormat}
                outputQuality={outputQuality}
                isConverting={conversionProgress.isConverting}
                progressPercent={conversionProgress.percent}
                conversionError={conversionError}
                onFormatChange={setSelectedFormat}
                onOutputQualityChange={setOutputQuality}
                onConvert={handleConvert}
              />
            </Card>
          </motion.div>
        </motion.div>
      )}

      {hasConvertedFileReference && (
        <motion.div
          variants={workspaceContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 items-start"
        >
          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full h-full p-0 overflow-hidden flex flex-col">
              <ConvertedFileCard
                fileReference={activeConvertedFileReference}
                previewFile={activePreviewFile}
                formatLabel={activeFormatLabel}
              />
            </Card>
          </motion.div>

          <motion.div variants={workspaceCardVariants} className="col-span-1 w-full">
            <Card className="w-full p-0 overflow-hidden">
              <ExportPanel
                fileReference={activeConvertedFileReference}
                actionVariant="single"
                defaultFileName={activeConvertedFileReference.name}
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