// src/tools/media/image-converter/worker/eps-decoder.ts
import { EPS_RENDER_DPI, EPS_RENDER_HEIGHT, EPS_RENDER_WIDTH } from './constants';
import { createImageDataFromRgbaBytes } from './image-data-utils';

export async function decodeEps(sourceBuffer: ArrayBuffer): Promise<ImageData> {
  const { createRenderer } = await import('pscat');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('pscat.wasm')) {
      return originalFetch('/wasm/pscat.wasm', init);
    }
    return originalFetch(input, init);
  };

  try {
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
  } finally {
    globalThis.fetch = originalFetch;
  }
}