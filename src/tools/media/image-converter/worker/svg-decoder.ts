import { SVG_RENDER_WIDTH } from './constants';
import { copyBytesToArrayBuffer } from './buffer-utils';
import { decodePngBuffer } from './jsquash-codecs';

let resvgInitializationPromise: Promise<void> | null = null;

function initializeResvg(): Promise<void> {
  if (!resvgInitializationPromise) {
    resvgInitializationPromise = (async (): Promise<void> => {
      const resvgWasmUrl = new URL('@resvg/resvg-wasm/index_bg.wasm', import.meta.url).href;
      const { initWasm } = await import('@resvg/resvg-wasm');
      await initWasm(fetch(resvgWasmUrl));
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