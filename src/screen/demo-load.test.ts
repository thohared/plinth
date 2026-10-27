import { afterEach, expect, it, vi } from 'vitest';
const fake = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('./load', () => ({ loadImage: fake.load }));
import { loadDemoImages, type DemoImage } from './demo';

function pending() {
  let resolve!: (image: DemoImage) => void; let reject!: (error: Error) => void;
  const promise = new Promise<DemoImage>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const image = () => ({ bitmap: { close: vi.fn() }, meta: {} }) as unknown as DemoImage;
afterEach(() => fake.load.mockReset());

it('starts both images without a waterfall and transfers ownership only after both finish', async () => {
  const portrait = pending(), landscape = pending();
  fake.load.mockReturnValueOnce(portrait.promise).mockReturnValueOnce(landscape.promise);
  const loaded = loadDemoImages('https://local.invalid/', 8192);
  expect(fake.load.mock.calls).toEqual([['https://local.invalid/demo.png', 8192], ['https://local.invalid/demo-landscape.png', 8192]]);
  const p = image(), l = image(); landscape.resolve(l); portrait.resolve(p);
  expect(await loaded).toEqual({ portrait: p, landscape: l });
  expect(p.bitmap.close).not.toHaveBeenCalled(); expect(l.bitmap.close).not.toHaveBeenCalled();
});

it.each([0, 1])('cleans a successful late decode when image %i fails first', async failed => {
  const requests = [pending(), pending()];
  fake.load.mockReturnValueOnce(requests[0]!.promise).mockReturnValueOnce(requests[1]!.promise);
  const loaded = loadDemoImages('https://local.invalid/', 8192);
  const rejection = expect(loaded).rejects.toThrow('Decode failed');
  requests[failed]!.reject(new Error('Decode failed'));
  await Promise.resolve(); const successful = image(); requests[1 - failed]!.resolve(successful);
  await rejection; expect(successful.bitmap.close).toHaveBeenCalledTimes(1);
});

it('handles two failed requests without an unobserved rejection', async () => {
  fake.load.mockRejectedValueOnce(new Error('First failed')).mockRejectedValueOnce(new Error('Second failed'));
  await expect(loadDemoImages('https://local.invalid/', 8192)).rejects.toThrow('First failed');
});
