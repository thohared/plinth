import { Mesh, Texture } from 'three';
import { afterEach, expect, it, vi } from 'vitest';

const fake = vi.hoisted(() => ({ generators: [] as Array<{ dispose: ReturnType<typeof vi.fn> }>,
  targets: [] as Array<{ texture: Texture; dispose: ReturnType<typeof vi.fn> }>,
  released: [] as Array<ReturnType<typeof vi.fn>>, calls: 0, failAt: 0 }));
vi.mock('three', async importOriginal => ({ ...await importOriginal<typeof import('three')>(),
  PMREMGenerator: class {
    dispose = vi.fn();
    constructor() { fake.generators.push(this); }
    fromScene(scene: import('three').Scene) {
      scene.traverse(object => {
        if (!(object instanceof Mesh)) return;
        const material = object.material as import('three').MeshBasicMaterial;
        for (const resource of [object.geometry, material, material.map]) if (resource) {
          const disposed = vi.fn(); resource.addEventListener('dispose', disposed); fake.released.push(disposed);
        }
      });
      if (++fake.calls === fake.failAt) throw new Error('Environment failed');
      const target = { texture: new Texture(), dispose: vi.fn() }; fake.targets.push(target); return target;
    }
  },
}));
import { generateEnvironments } from './environment';
import { SCENE_IDS, SCENE_PRESETS } from './presets';

afterEach(() => { fake.generators.length = 0; fake.targets.length = 0; fake.released.length = 0; fake.calls = 0; fake.failAt = 0; });

it('prepares four independent environments with one temporary generator and transfers only the outputs', () => {
  const maps = generateEnvironments({} as never, SCENE_IDS.map(id => SCENE_PRESETS[id]));
  expect(maps).toHaveLength(4); expect(new Set(maps.map(map => map.texture)).size).toBe(4);
  expect(fake.generators).toHaveLength(1); expect(fake.generators[0]!.dispose).toHaveBeenCalledTimes(1);
  expect(fake.released).toHaveLength(20);
  for (const dispose of fake.released) expect(dispose).toHaveBeenCalledTimes(1);
  for (const target of fake.targets) expect(target.dispose).not.toHaveBeenCalled();
  maps[0]!.dispose(); expect(fake.targets[0]!.dispose).toHaveBeenCalledTimes(1);
  for (const target of fake.targets.slice(1)) expect(target.dispose).not.toHaveBeenCalled();
  for (const map of maps.slice(1)) map.dispose();
});

it('releases earlier outputs, the failed scene and generator if a later environment fails', () => {
  fake.failAt = 3;
  expect(() => generateEnvironments({} as never, SCENE_IDS.map(id => SCENE_PRESETS[id]))).toThrow('Environment failed');
  expect(fake.targets).toHaveLength(2); expect(fake.released).toHaveLength(15);
  for (const target of fake.targets) expect(target.dispose).toHaveBeenCalledTimes(1);
  for (const dispose of fake.released) expect(dispose).toHaveBeenCalledTimes(1);
  expect(fake.generators[0]!.dispose).toHaveBeenCalledTimes(1);
});
