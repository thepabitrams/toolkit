// src/shared/components/ExportPanel.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/Button';
import { ActionButton } from '@/shared/components/ActionButton';
import { useFileStore } from '@/shared/store/file-store';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import type { FileReference } from '@/shared/store/file-store';

interface ExportPanelProperties {
  fileReference: FileReference | null;
  actionVariant: 'single' | 'multiple';
  defaultFileName?: string;
  handleClearFiles: () => Promise<void>;
  currentToolSlug: string;
  handleToolSelection: (selectedToolSlug: string, variant: 'single' | 'multiple') => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeTypeExtensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'text/plain': 'txt',
    'application/json': 'json',
  };
  return mimeTypeExtensionMap[mimeType] || '';
}

export const ExportPanel: React.FC<ExportPanelProperties> = ({
  fileReference,
  actionVariant,
  defaultFileName = 'download',
  handleClearFiles,
  currentToolSlug,
  handleToolSelection,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [fileNameInput, setFileNameInput] = useState('');
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const { read } = useFileStore();

  useEffect(() => {
    if (fileReference) {
      const nameWithoutExtension = fileReference.name.replace(/\.[^.]+$/, '');
      setFileNameInput(nameWithoutExtension);
    } else {
      setFileNameInput(defaultFileName);
    }
  }, [fileReference, defaultFileName]);

  const handleFileDownload = async () => {
    if (!fileReference) return;

    setIsDownloadingFile(true);
    try {
      const downloadedBlob = await read(fileReference.name);
      if (!downloadedBlob) throw new Error('Failed to read file');

      const fileExtension = getFileExtensionFromMimeType(fileReference.type) || 'png';
      const completeFileName = fileNameInput ? `${fileNameInput}.${fileExtension}` : fileReference.name;

      const objectUrl = URL.createObjectURL(downloadedBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = completeFileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      await handleClearFiles();
    } catch (error) {
      console.warn('Download failed:', error);
    } finally {
      setIsDownloadingFile(false);
    }
  };

  const fileExtensionForInput = fileReference ? getFileExtensionFromMimeType(fileReference.type) : '';

  if (!fileReference) return null;

  return (
    <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
      <Container className="px-0 h-full">
        <Card className="p-4 flex flex-col h-full w-full">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Download
          </h3>

          <div className="mb-3">
            <Input
              type="text"
              value={fileNameInput}
              onChange={(changeEvent) => setFileNameInput(changeEvent.target.value)}
              placeholder="Enter file name..."
              disabled={isDownloadingFile}
              suffix={fileExtensionForInput ? `.${fileExtensionForInput}` : undefined}
              fullWidth
            />
          </div>

          <div className="border-t border-gray-200/60 dark:border-gray-700/60 my-2" />

          <div className="flex items-center justify-between gap-3 mt-auto pt-1">
            <ActionButton
              currentToolSlug={currentToolSlug}
              actionVariant={actionVariant}
              handleToolSelection={handleToolSelection}
              className="flex-1"
            />
            <Button
              onClick={handleFileDownload}
              variant="primary"
              disabled={!fileReference || isDownloadingFile}
              className="flex-1 px-5 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingFile ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};