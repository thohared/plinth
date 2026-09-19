import type { OutputAspect } from '../output';

/** Startup hint only. Explicit settings and shared links always take precedence. */
export function hostDefaultAspect(width: number, screenWidth: number, screenHeight: number, touch: boolean): OutputAspect {
  const shortSide = Math.min(screenWidth, screenHeight);
  const size = touch && shortSide > 0 ? shortSide : width;
  if (size < 600) return '1:1';
  return touch || size < 900 ? '4:5' : '16:9';
}
