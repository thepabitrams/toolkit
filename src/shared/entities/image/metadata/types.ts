// src/entities/image/metadata/types.ts
export type ExifTagValue = string | number | boolean | (string | number | boolean)[];
export type ExifTags = Record<string, ExifTagValue>;