interface ConvertedPreviewProps {
  previewUrl: string;
  fileName: string;
  formatLabel: string;
}

interface PreviewUnavailableProps {
  fileName: string;
  formatLabel: string;
}

export function ConvertedPreview({
  previewUrl,
  fileName,
  formatLabel,
}: ConvertedPreviewProps): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-[#1e242d]/50">
        <img
          src={previewUrl}
          alt={fileName}
          className="max-h-128 w-full object-contain"
        />
      </div>
      <div className="flex flex-col items-center gap-1 border-t border-gray-100 p-4 dark:border-gray-700/50">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{fileName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatLabel} preview. Download to get the original {formatLabel} file.
        </p>
      </div>
    </div>
  );
}

export function PreviewUnavailable({
  fileName,
  formatLabel,
}: PreviewUnavailableProps): React.JSX.Element {
  return (
    <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-1 bg-gray-50 p-6 text-center dark:bg-[#1e242d]/50">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{fileName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {formatLabel} file ready. Browsers cannot preview it, download it to open in an image app.
      </p>
    </div>
  );
}