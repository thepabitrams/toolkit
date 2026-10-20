export type ExifValue = string | number | boolean | (string | number | boolean)[];
export type ExifTags = Record<string, ExifValue>;