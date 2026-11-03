// src/tools/personalisation/wallpaper/Wallpaper.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { useFileStore } from '@/shared/store/file-store';
import { FileCard } from '@/shared/components/file-card';
import { ExportPanel } from '@/shared/components/export-panel';
import { Card } from '@/core/components/ui';
import { spring, stagger } from '@/config/motion';
import { Preview } from './Preview';
import { Controls } from './Controls';
import { useGenerator } from './useGenerator';

const PROCESS_BUCKET = 'process';

const workspaceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: stagger.standard } },
};

const workspaceCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.standard },
};

interface WallpaperProps {
  category: string;
  toolId: string;
}

export function Wallpaper({ toolId }: WallpaperProps): React.JSX.Element {
  const { init, save, selectAll, deleteBucket, moveToTool } = useFileStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [imageWidth, setImageWidth] = useState(1920);
  const [imageHeight, setImageHeight] = useState(1080);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const { generateWallpaper } = useGenerator();

  useEffect(() => {
    init();
  }, [init]);

  const processedFiles = selectAll(PROCESS_BUCKET);
  const latestProcessedFile = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;
  const hasProcessedFile = !!latestProcessedFile;

  const handleGenerate = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    try {
      const generatedBlob = await generateWallpaper(selectedColor, imageWidth, imageHeight, exportFormat);
      const fileExtension = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
      const generatedFileName = `wallpaper_${imageWidth}x${imageHeight}.${fileExtension}`;
      const resultFile = new File([generatedBlob], generatedFileName, { type: generatedBlob.type });
      
      await save([resultFile], PROCESS_BUCKET, undefined, 0);
    } catch (error) {
      console.error('Failed to generate wallpaper:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedColor, imageWidth, imageHeight, exportFormat, generateWallpaper, save]);

  const handleClearWorkspace = useCallback(async (): Promise<void> => {
    await deleteBucket(PROCESS_BUCKET);
  }, [deleteBucket]);

  const handleToolSelection = useCallback(async (targetToolSlug: string): Promise<void> => {
    if (!targetToolSlug || !latestProcessedFile) return;
    await moveToTool(latestProcessedFile.name, targetToolSlug);
    window.location.href = `/${targetToolSlug}`;
  }, [moveToTool, latestProcessedFile]);

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      <motion.div 
        variants={workspaceContainerVariants} 
        initial="hidden" 
        animate="visible" 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start"
      >
        <motion.div variants={workspaceCardVariants} className="w-full">
          <Card className="w-full p-0 overflow-hidden">
            <Preview color={selectedColor} width={imageWidth} height={imageHeight} />
          </Card>
        </motion.div>

        <motion.div variants={workspaceCardVariants} className="w-full">
          <Card className="w-full p-0 overflow-hidden">
            <Controls
              color={selectedColor}
              onColorChange={setSelectedColor}
              width={imageWidth}
              height={imageHeight}
              onWidthChange={setImageWidth}
              onHeightChange={setImageHeight}
              fileType={exportFormat}
              onFileTypeChange={setExportFormat}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </Card>
        </motion.div>
      </motion.div>

      {hasProcessedFile && (
        <motion.div 
          variants={workspaceContainerVariants} 
          initial="hidden" 
          animate="visible" 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 items-start"
        >
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
                defaultFileName={`wallpaper_${imageWidth}x${imageHeight}`}
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