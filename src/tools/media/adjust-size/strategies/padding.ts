// src/tools/media/adjust-size/strategies/padding.ts
export async function padding(
  sourceFile: File, 
  targetSizeKB: number
): Promise<Blob> {
  const targetSizeBytes = targetSizeKB * 1024;
  const sourceSizeBytes = sourceFile.size;

  if (sourceSizeBytes >= targetSizeBytes) return sourceFile;

  const sourceArrayBuffer = await sourceFile.arrayBuffer();
  const sourceBytesData = new Uint8Array(sourceArrayBuffer);
  const paddingBytesCount = targetSizeBytes - sourceSizeBytes;

  const isJpegFormat = sourceFile.type === 'image/jpeg' || sourceFile.type === 'image/jpg' || detectJpegFormat(sourceBytesData);
  const isPngFormat = sourceFile.type === 'image/png' || detectPngFormat(sourceBytesData);
  const isWebpFormat = sourceFile.type === 'image/webp' || detectWebpFormat(sourceBytesData);
  const isAvifFormat = sourceFile.type === 'image/avif' || detectAvifFormat(sourceBytesData);
  const isGifFormat = sourceFile.type === 'image/gif' || detectGifFormat(sourceBytesData);
  const isBmpFormat = sourceFile.type === 'image/bmp' || detectBmpFormat(sourceBytesData);

  if (isJpegFormat) return padJpegData(sourceBytesData, paddingBytesCount, sourceFile.type);
  if (isPngFormat) return padPngData(sourceBytesData, paddingBytesCount, sourceFile.type);
  if (isWebpFormat) return padWebpData(sourceBytesData, paddingBytesCount, sourceFile.type);
  if (isAvifFormat) return padAvifData(sourceBytesData, paddingBytesCount, sourceFile.type);
  if (isGifFormat) return padGifData(sourceBytesData, paddingBytesCount, sourceFile.type);
  if (isBmpFormat) return padBmpData(sourceBytesData, paddingBytesCount, sourceFile.type);

  return fallbackPadData(sourceBytesData, paddingBytesCount, sourceFile.type);
}

function detectJpegFormat(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0xFF && data[1] === 0xD8;
}

function detectPngFormat(data: Uint8Array): boolean {
  return data.length >= 8 &&
    data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47 &&
    data[4] === 0x0D && data[5] === 0x0A && data[6] === 0x1A && data[7] === 0x0A;
}

function detectWebpFormat(data: Uint8Array): boolean {
  return data.length >= 12 &&
    data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
    data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50;
}

function detectAvifFormat(data: Uint8Array): boolean {
  if (data.length < 12) return false;
  if (data[0] !== 0x00 || data[1] !== 0x00 || data[2] !== 0x00) return false;
  
  const boxSize = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
  if (boxSize < 8) return false;
  
  const boxType = String.fromCharCode(data[4], data[5], data[6], data[7]);
  return boxType === 'ftyp' && data[8] === 0x61 && data[9] === 0x76 && data[10] === 0x69 && data[11] === 0x66;
}

function detectGifFormat(data: Uint8Array): boolean {
  return data.length >= 6 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38;
}

function detectBmpFormat(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x42 && data[1] === 0x4D;
}

function padJpegData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  let endOfImageIndex = -1;
  
  for (let index = sourceData.length - 2; index >= 0; index--) {
    if (sourceData[index] === 0xFF && sourceData[index + 1] === 0xD9) {
      endOfImageIndex = index;
      break;
    }
  }
  
  const paddedBuffer = new Uint8Array(sourceData.length + paddingBytesCount);
  
  if (endOfImageIndex !== -1) {
    const endOfImageDataIndex = endOfImageIndex + 2;
    paddedBuffer.set(sourceData.subarray(0, endOfImageDataIndex), 0);
    
    for (let index = endOfImageDataIndex; index < endOfImageDataIndex + paddingBytesCount; index++) {
      paddedBuffer[index] = 0x00;
    }
  } else {
    paddedBuffer.set(sourceData, 0);
    
    for (let index = sourceData.length; index < paddedBuffer.length; index++) {
      paddedBuffer[index] = 0x00;
    }
  }
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function padPngData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  const iendChunkStart = sourceData.length - 12;
  const iendChunkData = sourceData.subarray(iendChunkStart);
  
  const keyword = 'Padding';
  const keywordBytes = new TextEncoder().encode(keyword);
  const nullByte = new Uint8Array([0x00]);
  const paddingBytes = new Uint8Array(paddingBytesCount);
  
  const chunkData = new Uint8Array([...keywordBytes, ...nullByte, ...paddingBytes]);
  const chunkLength = chunkData.length;
  const chunkType = new TextEncoder().encode('tEXt');
  const chunkCrc = calculateCrc32(chunkType, chunkData);
  
  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  const dataView = new DataView(chunk.buffer);
  
  dataView.setUint32(0, chunkLength, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);
  dataView.setUint32(8 + chunkData.length, chunkCrc, false);
  
  const paddedBuffer = new Uint8Array(iendChunkStart + chunk.length + 12);
  paddedBuffer.set(sourceData.subarray(0, iendChunkStart), 0);
  paddedBuffer.set(chunk, iendChunkStart);
  paddedBuffer.set(iendChunkData, iendChunkStart + chunk.length);
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function padWebpData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  const paddedBuffer = new Uint8Array(sourceData.length + paddingBytesCount);
  paddedBuffer.set(sourceData, 0);
  
  for (let index = sourceData.length; index < paddedBuffer.length; index++) {
    paddedBuffer[index] = 0x00;
  }
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function padAvifData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  const freeBoxSize = 8 + paddingBytesCount;
  const freeBox = new Uint8Array(freeBoxSize);
  const dataView = new DataView(freeBox.buffer);
  
  dataView.setUint32(0, freeBoxSize, false);
  freeBox[4] = 0x66;
  freeBox[5] = 0x72;
  freeBox[6] = 0x65;
  freeBox[7] = 0x65;
  
  const paddedBuffer = new Uint8Array(sourceData.length + freeBoxSize);
  paddedBuffer.set(sourceData, 0);
  paddedBuffer.set(freeBox, sourceData.length);
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function padGifData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  let trailerIndex = -1;
  
  for (let index = sourceData.length - 1; index >= 0; index--) {
    if (sourceData[index] === 0x3B) {
      trailerIndex = index;
      break;
    }
  }
  
  const paddedBuffer = new Uint8Array(sourceData.length + paddingBytesCount);
  
  if (trailerIndex !== -1) {
    paddedBuffer.set(sourceData.subarray(0, trailerIndex + 1), 0);
    
    for (let index = trailerIndex + 1; index < trailerIndex + 1 + paddingBytesCount; index++) {
      paddedBuffer[index] = 0x00;
    }
  } else {
    paddedBuffer.set(sourceData, 0);
    
    for (let index = sourceData.length; index < paddedBuffer.length; index++) {
      paddedBuffer[index] = 0x00;
    }
  }
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function padBmpData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  const paddedBuffer = new Uint8Array(sourceData.length + paddingBytesCount);
  paddedBuffer.set(sourceData, 0);
  
  for (let index = sourceData.length; index < paddedBuffer.length; index++) {
    paddedBuffer[index] = 0x00;
  }
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function fallbackPadData(sourceData: Uint8Array, paddingBytesCount: number, mimeType: string): Blob {
  const paddedBuffer = new Uint8Array(sourceData.length + paddingBytesCount);
  paddedBuffer.set(sourceData, 0);
  
  for (let index = sourceData.length; index < paddedBuffer.length; index++) {
    paddedBuffer[index] = 0x00;
  }
  
  return new Blob([paddedBuffer], { type: mimeType });
}

function calculateCrc32(typeBytes: Uint8Array, chunkData: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  const crcTable = generateCrcTable();
  
  for (const byte of typeBytes) {
    crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }
  
  for (const byte of chunkData) {
    crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }
  
  return crc ^ 0xFFFFFFFF;
}

function generateCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value;
  }
  
  return table;
}