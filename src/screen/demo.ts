import type { DeviceId } from '../devices/presets';
import type { FitMode } from './types';
import { loadImage } from './load';

export type DemoImage = Awaited<ReturnType<typeof loadImage>>;
export interface DemoImages { portrait: DemoImage; landscape: DemoImage }
// Every default demo shows the full screenshot, including below browser chrome.
export const demoFit = (_device: DeviceId): FitMode => 'contain';

/** Stage takes ownership only once both local images have decoded. */
export async function loadDemoImages(base: string, cap: number): Promise<DemoImages> {
  const results = await Promise.allSettled(['demo.png', 'demo-landscape.png'].map(
    path => loadImage(new URL(path, base).href, cap),
  ));
  const failed = results.find(result => result.status === 'rejected');
  if (failed) {
    for (const result of results) if (result.status === 'fulfilled') result.value.bitmap.close();
    throw failed.reason;
  }
  const [portrait, landscape] = results as [PromiseFulfilledResult<DemoImage>, PromiseFulfilledResult<DemoImage>];
  return { portrait: portrait.value, landscape: landscape.value };
}
