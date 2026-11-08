import { SVG_RENDER_WIDTH } from './constants';
import { copyBytesToArrayBuffer } from './buffer-utils';
import { decodePngBuffer } from './jsquash-codecs';

import RESVG_WASM_URL from '/wasm/resvg/resvg_bg.wasm?url';

let resvgInitializationPromise: Promise<void> | null = null;

function initializeResvg(): Promise<void> {
  if (!resvgInitializationPromise) {
    resvgInitializationPromise = (async (): Promise<void> => {
      const response = await fetch(RESVG_WASM_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch resvg_bg.wasm');
      }
      const buffer = await response.arrayBuffer();
      const { initWasm } = await import('@resvg/resvg-wasm');
      await initWasm(buffer);
    })();
    
    resvgInitializationPromise.catch(() => {
      resvgInitializationPromise = null;
    });
  }
  return resvgInitializationPromise;
}

export async function decodeSvg(sourceBuffer: ArrayBuffer): Promise<ImageData> {
  const svgMarkup = new TextDecoder().decode(sourceBuffer);
  await initializeResvg();
  const { Resvg } = await import('@resvg/resvg-wasm');
  const svgRenderer = new Resvg(svgMarkup, {
    fitTo: { mode: 'width', value: SVG_RENDER_WIDTH },
  });
  const renderedPngBytes = svgRenderer.render().asPng();
  return decodePngBuffer(copyBytesToArrayBuffer(renderedPngBytes));
}