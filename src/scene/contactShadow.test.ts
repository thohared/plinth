import { Color, MeshBasicMaterial, Scene, Texture } from 'three';
import { describe, expect, it } from 'vitest';
import { ContactShadow } from './contactShadow';

type FakeRenderer = {
  target: unknown; alpha: number; calls: string[]; throwDepth: boolean;
  getRenderTarget(): unknown; setRenderTarget(value: unknown): void; getClearAlpha(): number;
  setClearAlpha(value: number): void; clear(): void; render(): void;
};
function fakeRenderer(): FakeRenderer {
  return {
    target: { previous: true }, alpha: 0.37, calls: [], throwDepth: false,
    getRenderTarget() { return this.target; }, setRenderTarget(value) { this.target = value; this.calls.push('target'); },
    getClearAlpha() { return this.alpha; }, setClearAlpha(value) { this.alpha = value; this.calls.push('alpha'); },
    clear() { this.calls.push('clear'); },
    render() { this.calls.push('render'); if (this.throwDepth) throw new Error('depth failed'); },
  };
}

describe('T-P5 contact shadow state restoration', () => {
  it('restores every temporary state after a depth failure and the next capture can run', () => {
    const shadow = new ContactShadow();
    const scene = new Scene();
    const background = new Color('#123456');
    const environment = new Texture();
    const override = new MeshBasicMaterial();
    scene.background = background; scene.environment = environment; scene.overrideMaterial = override;
    shadow.plane.visible = false;
    const renderer = fakeRenderer(); renderer.throwDepth = true;
    expect(() => shadow.render(renderer as never, scene)).toThrow('depth failed');
    expect(scene.background).toBe(background); expect(scene.environment).toBe(environment);
    expect(scene.overrideMaterial).toBe(override); expect(shadow.plane.visible).toBe(false);
    expect(renderer.target).toEqual({ previous: true }); expect(renderer.alpha).toBe(0.37);
    renderer.throwDepth = false;
    const internals = shadow as unknown as { blur: (r: FakeRenderer, texels: number) => void };
    internals.blur = () => undefined;
    expect(() => shadow.render(renderer as never, scene)).not.toThrow();
  });

  it('restores the same state after a blur failure', () => {
    const shadow = new ContactShadow();
    const scene = new Scene();
    const background = new Color('#abcdef');
    scene.background = background;
    const renderer = fakeRenderer();
    const internals = shadow as unknown as { blur: (r: FakeRenderer, texels: number) => void };
    internals.blur = () => { throw new Error('blur failed'); };
    expect(() => shadow.render(renderer as never, scene)).toThrow('blur failed');
    expect(scene.background).toBe(background);
    expect(scene.overrideMaterial).toBeNull();
    expect(shadow.plane.visible).toBe(true);
    expect(renderer.target).toEqual({ previous: true }); expect(renderer.alpha).toBe(0.37);
  });
});

it('T-P9e minimum depth softens the upright footprint without changing wider lean/top shadows', async () => {
  const { createStage } = await import('../scene');
  const stage = createStage('phone', 'soft-studio', 1.6); const shadow = new ContactShadow();
  try {
    for (const pose of ['front', 'lean', 'top'] as const) {
      stage.setPose(pose, true); const bounds = stage.getWorldBounds();
      shadow.fit(bounds); const previous = shadow.plane.scale.clone();
      shadow.fit(bounds, (bounds.max.x - bounds.min.x) * .55);
      expect(shadow.plane.scale.x).toBe(previous.x);
      expect(shadow.group.position.x).toBeCloseTo((bounds.min.x + bounds.max.x) / 2, 12);
      expect(shadow.group.position.z).toBeCloseTo((bounds.min.z + bounds.max.z) / 2, 12);
      if (pose === 'front') expect(Math.abs(shadow.plane.scale.y)).toBeGreaterThan(Math.abs(previous.y) * 2);
      else expect(shadow.plane.scale.y).toBe(previous.y);
    }
  } finally { shadow.dispose(); stage.dispose(); }
});
