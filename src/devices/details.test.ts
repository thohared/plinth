import { describe, it, expect, vi } from 'vitest';
import { Mesh, InstancedMesh, Raycaster, Vector3, type BufferGeometry, type Material } from 'three';
import { buildDevice } from './build';
import { DEVICE_IDS, presetSpec } from './presets';

function counts(group: ReturnType<typeof buildDevice>['group']) {
  let draws = 0, vertices = 0;
  group.traverse(o => { if (o instanceof Mesh) { draws++; vertices += (o.geometry.index?.count ?? o.geometry.getAttribute('position').count) * (o instanceof InstancedMesh ? o.count : 1); } });
  return { draws, vertices };
}
describe('P-16 generic hardware', () => {
  it.each(DEVICE_IDS)('%s has class-appropriate hardware within its resource budget', id => {
    const spec = presetSpec(id), base = buildDevice(spec, id === 'browser', !['browser','card'].includes(id));
    const rig = buildDevice(spec, id === 'browser', !['browser','card'].includes(id), id);
    try {
      const a = counts(base.group), b = counts(rig.group);
      expect(b.draws - a.draws).toBeLessThanOrEqual(30);
      expect(b.vertices - a.vertices).toBeLessThanOrEqual(40_000);
      if (id === 'browser' || id === 'card') { expect(b).toEqual(a); expect(rig.group.getObjectByName('rear-hardware')).toBeUndefined(); }
      else {
        expect(rig.group.getObjectByName('rear-cover')).toBeInstanceOf(Mesh);
        if (id === 'laptop') for (const name of ['trackpad','webcam','charging-port','data-port','rubber-feet','ventilation']) expect(rig.group.getObjectByName(name), name).toBeDefined();
        else for (const name of ['camera-lenses','camera-flash','socket-cavity','power-button','speaker-openings','microphone']) expect(rig.group.getObjectByName(name), name).toBeDefined();
        // The opaque rear cover is the first surface from behind, not the screenshot.
        const cover = rig.group.getObjectByName('rear-cover')!;
        const center = cover.getWorldPosition(new Vector3());
        const normal = new Vector3(0,0,1).transformDirection(cover.matrixWorld);
        const hit = new Raycaster(center.clone().addScaledVector(normal,.5),normal.clone().negate()).intersectObject(rig.group,true)[0];
        expect(hit?.object.name).toBe('rear-cover');
      }
      expect(Math.abs(rig.bounds.min.y)).toBeLessThan(1e-7);
    } finally {base.dispose();rig.dispose();}
  });
  it('rebuilds hardware and disposes every owned geometry/material/instance once', () => {
    const rig = buildDevice(presetSpec('phone'),false,true,'phone');
    const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(), instances: InstancedMesh[] = [];
    rig.group.traverse(o => { if(o instanceof Mesh) { geometries.add(o.geometry); for(const m of Array.isArray(o.material)?o.material:[o.material]) materials.add(m); } if(o instanceof InstancedMesh) instances.push(o); });
    const g = [...geometries].map(v => vi.spyOn(v,'dispose')), m = [...materials].map(v => vi.spyOn(v,'dispose')), i = instances.map(v => vi.spyOn(v,'dispose'));
    const old = rig.group.getObjectByName('camera-module');
    rig.update({...rig.spec,w:.082,h:.16});
    expect(rig.group.getObjectByName('camera-module')).not.toBe(old);
    for(const spy of [...g,...i]) expect(spy).toHaveBeenCalledTimes(1);
    for(const spy of m) expect(spy).not.toHaveBeenCalled();
    rig.dispose();for(const spy of m) expect(spy).toHaveBeenCalledTimes(1);
  });
});
