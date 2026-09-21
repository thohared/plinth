/** Browser-only pose interaction adapter. The pose math remains in poses.ts. */
import { AZIMUTH_LIMIT, ELEVATION_MIN, ELEVATION_MAX } from './poses';
export interface PoseControllerTarget {
  advance(dt: number): boolean;
  orbit(deltaAzimuth: number, deltaElevation: number): void;
  freeRotate?(horizontal: number, vertical: number): boolean;
  getOrbit?(): { azimuth: number; elevation: number };
}

export interface PoseController {
  start(): void;
  dispose(): void;
}

const PIXELS_PER_RADIAN = 240;

/** Exponential approach inside the final 15 degrees, with no stored overshoot.
 * Integrating distance gives the same result for one drag or many small events. */
export function easedOrbitDelta(value: number, delta: number, min: number, max: number): number {
  if (delta === 0) return 0;
  const sign = Math.sign(delta), band = 15 * Math.PI / 180;
  const remaining = Math.max(0, sign > 0 ? max - value : value - min);
  const linear = Math.min(Math.abs(delta), Math.max(0, remaining - band));
  const near = remaining - linear;
  return sign * (linear + near * (1 - Math.exp(-(Math.abs(delta) - linear) / band)));
}

export function createPoseController(canvas: HTMLCanvasElement, target: PoseControllerTarget, redraw: () => void): PoseController {
  // Reserve gestures before pointerdown; capture alone cannot stop native scrolling.
  const touchAction = canvas.style.getPropertyValue('touch-action');
  const touchActionPriority = canvas.style.getPropertyPriority('touch-action');
  canvas.style.setProperty('touch-action', 'none');
  let pointer: number | null = null;
  let x = 0;
  let y = 0;
  let raf: number | null = null;
  let previousTimestamp: number | null = null;
  let disposed = false;

  const cancel = (): void => {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  };
  const tick = (timestamp: number): void => {
    raf = null;
    if (disposed || document.hidden) return;
    if (previousTimestamp === null) {
      previousTimestamp = timestamp;
      schedule();
      return;
    }
    const active = target.advance(Math.max(0, (timestamp - previousTimestamp) / 1000));
    previousTimestamp = timestamp;
    redraw();
    if (active) schedule();
  };
  const schedule = (): void => {
    if (!disposed && !document.hidden && raf === null) raf = requestAnimationFrame(tick);
  };
  const down = (event: PointerEvent): void => {
    if (pointer !== null) return;
    pointer = event.pointerId;
    x = event.clientX;
    y = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    x = event.clientX;
    y = event.clientY;
    if (dx === 0 && dy === 0) return;
    if (target.freeRotate?.(dx / PIXELS_PER_RADIAN, dy / PIXELS_PER_RADIAN)) { redraw(); return; }
    const orbit = target.getOrbit?.();
    const azimuth = dx / PIXELS_PER_RADIAN, elevation = -dy / PIXELS_PER_RADIAN;
    target.orbit(orbit ? easedOrbitDelta(orbit.azimuth, azimuth, -AZIMUTH_LIMIT, AZIMUTH_LIMIT) : azimuth,
      orbit ? easedOrbitDelta(orbit.elevation, elevation, ELEVATION_MIN, ELEVATION_MAX) : elevation);
    redraw();
  };
  const release = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    pointer = null;
  };
  const visibility = (): void => {
    previousTimestamp = null;
    if (document.hidden) cancel();
    else schedule();
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  document.addEventListener('visibilitychange', visibility);
  return {
    start() { previousTimestamp = null; schedule(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (touchAction) canvas.style.setProperty('touch-action', touchAction, touchActionPriority);
      else canvas.style.removeProperty('touch-action');
      cancel();
      if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
      pointer = null;
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', release);
      canvas.removeEventListener('pointercancel', release);
      canvas.removeEventListener('lostpointercapture', release);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}
