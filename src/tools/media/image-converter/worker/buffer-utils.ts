export function copyBytesToArrayBuffer(sourceBytes: Uint8Array): ArrayBuffer {
  const standaloneBuffer = new ArrayBuffer(sourceBytes.byteLength);
  new Uint8Array(standaloneBuffer).set(sourceBytes);
  return standaloneBuffer;
}