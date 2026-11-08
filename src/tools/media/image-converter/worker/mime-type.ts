const MIME_TYPE_ALIASES: Readonly<Record<string, string>> = {
  'image/jpg': 'image/jpeg',
  'image/x-icon': 'image/ico',
  'image/tif': 'image/tiff',
};

export function normalizeMimeType(rawMimeType: string): string {
  const lowercasedMimeType = rawMimeType.toLowerCase();
  return MIME_TYPE_ALIASES[lowercasedMimeType] ?? lowercasedMimeType;
}