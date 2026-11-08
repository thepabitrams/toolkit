import { EPS_RENDER_DPI, EPS_RENDER_HEIGHT, EPS_RENDER_WIDTH } from './constants';
import { createImageDataFromRgbaBytes } from './image-data-utils';

export async function decodeEps(sourceBuffer: ArrayBuffer): Promise<ImageData> {
  const { createRenderer } = await import('pscat');
  const epsRenderer = await createRenderer();
  const renderedPage = await epsRenderer.render(new Uint8Array(sourceBuffer), {
    width: EPS_RENDER_WIDTH,
    height: EPS_RENDER_HEIGHT,
    dpi: EPS_RENDER_DPI,
  });
  return createImageDataFromRgbaBytes(
    renderedPage.data as unknown as ArrayLike<number>,
    renderedPage.width,
    renderedPage.height
  );
}