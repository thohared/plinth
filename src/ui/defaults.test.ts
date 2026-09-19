import { expect, it } from 'vitest';
import { hostDefaultAspect } from './defaults';

it('uses the host, including a landscape phone and desktop-style tablet viewport', () => {
  expect(hostDefaultAspect(400,400,850,true)).toBe('1:1');
  expect(hostDefaultAspect(850,850,400,true)).toBe('1:1');
  expect(hostDefaultAspect(1366,1366,1024,true)).toBe('4:5');
  expect(hostDefaultAspect(820,820,1180,true)).toBe('4:5');
  expect(hostDefaultAspect(1280,1920,1080,false)).toBe('16:9');
  expect(hostDefaultAspect(500,1920,1080,false)).toBe('1:1');
});
