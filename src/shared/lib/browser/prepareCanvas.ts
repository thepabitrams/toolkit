export function prepareCanvas(canvas: HTMLCanvasElement, supportsAlpha: boolean): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { alpha: supportsAlpha });
  if (!ctx) throw new Error('Failed to get 2D context');
  
  if (!supportsAlpha) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return ctx;
}