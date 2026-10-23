import React, { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/Button';
import { ActionButton } from '@/shared/components/action-button';
import { Input } from '@/core/components/ui/Input';
import { useExportPanel } from './useExportPanel';
import type { FileReference } from '@/shared/store/file-store';

interface ExportPanelProperties {
  fileReference: FileReference | null;
  actionVariant: 'single' | 'multiple';
  defaultFileName?: string;
  handleClearFiles: () => Promise<void>;
  currentToolSlug: string;
  handleToolSelection: (selectedToolSlug: string, variant: 'single' | 'multiple') => Promise<void>;
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
}): React.JSX.Element | null => {
  const [fileNameInput, setFileNameInput] = useState('');
  const { handleDownload, isDownloadingFile } = useExportPanel({ fileReference, variant: actionVariant });

  useEffect(() => {
    if (fileReference) {
      const nameWithoutExtension = fileReference.name.replace(/\.[^.]+$/, '');
      setFileNameInput(nameWithoutExtension);
    } else {
      setFileNameInput(defaultFileName);
    }
  }, [fileReference, defaultFileName]);

  const onDownloadClick = async () => {
    await handleDownload(fileNameInput);
    await handleClearFiles();
  };

  const fileExtensionForInput = fileReference ? getFileExtensionFromMimeType(fileReference.type) : '';

  if (!fileReference) return null;

  return (
    <div className="flex flex-col h-full w-full p-4">
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
          onClick={onDownloadClick}
          variant="primary"
          disabled={!fileReference || isDownloadingFile}
          className="flex-1 px-5 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloadingFile ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </div>
  );
};