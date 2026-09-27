import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { createStage } from '../scene';

// Project actual screen geometry through the production camera. This does not
// assert the implementation's direction constant or substitute a test camera.
function edges(stage: ReturnType<typeof createStage>) {
  stage.scene.updateMatrixWorld(true);
  stage.camera.updateMatrixWorld(true);
  const { screen, screenSize: { w, h } } = stage.getRig();
  const project = (x: number, y: number) => screen.localToWorld(new Vector3(x, y, 0)).project(stage.camera);
  return [project(-w/2, h/2), project(w/2, h/2), project(-w/2, -h/2), project(w/2, -h/2)];
}

function symmetric(stage: ReturnType<typeof createStage>) {
  const [tl, tr, bl, br] = edges(stage);
  expect(Math.abs((tl!.y-bl!.y)-(tr!.y-br!.y))).toBeLessThan(1e-10);
  expect(Math.abs(tl!.y-tr!.y)).toBeLessThan(1e-10);
  expect(Math.abs(bl!.y-br!.y)).toBeLessThan(1e-10);
  expect(tr!.x).toBeGreaterThan(tl!.x);
  expect(tl!.y).toBeGreaterThan(bl!.y);
  for (const p of [tl!, tr!, bl!, br!]) {
    expect(Math.abs(p.x)).toBeLessThanOrEqual(0.9);
    expect(Math.abs(p.y)).toBeLessThanOrEqual(0.9);
    expect(Math.abs(p.z)).toBeLessThan(1);
  }
}

describe('P-17 Browser Hero perspective', () => {
  it('has equal sides at startup, resize, after a transition and during export framing', () => {
    const stage = createStage('browser', 'soft-studio', 1.6);
    try {
      symmetric(stage);
      for (const aspect of [1, 4/5, 16/9, 9/16, 3]) {
        stage.setAspect(aspect);
        symmetric(stage);
        stage.setPose('lean', true);
        stage.setPose('hero');
        stage.advancePose(0.75);
        symmetric(stage);
        stage.withOutputCamera(1.6, () => symmetric(stage));
        symmetric(stage);
      }
      stage.orbit(0.2, 0);
      const [tl, tr, bl, br] = edges(stage);
      expect(Math.abs((tl!.y-bl!.y)-(tr!.y-br!.y))).toBeGreaterThan(0.001);
      expect(stage.getPose()).toBeNull();
      stage.setPose('hero', true);
      symmetric(stage);
    } finally { stage.dispose(); }
  });
});
