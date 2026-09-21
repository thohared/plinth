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
    const rig = buildDevice(spec, id === 'browser', !['browser','card'].includes(id), id, true);
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
    const rig = buildDevice(presetSpec('phone'),false,true,'phone',true);
    const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(), instances: InstancedMesh[] = [];
    rig.group.traverse(o => { if(o instanceof Mesh) { geometries.add(o.geometry); for(const m of Array.isArray(o.material)?o.material:[o.material]) materials.add(m); } if(o instanceof InstancedMesh) instances.push(o); });
    const g = [...geometries].map(v => vi.spyOn(v,'dispose')), m = [...materials].map(v => vi.spyOn(v,'dispose')), i = instances.map(v => vi.spyOn(v,'dispose'));
    const old = rig.group.getObjectByName('camera-module');
    rig.update({...rig.spec,w:.082,h:.16});
    expect(rig.group.getObjectByName('camera-module')).not.toBe(old);
    expect(rig.bounds.min.y).toBeCloseTo(0,7);
    for(const spy of [...g,...i]) expect(spy).toHaveBeenCalledTimes(1);
    for(const spy of m) expect(spy).not.toHaveBeenCalled();
    rig.dispose();for(const spy of m) expect(spy).toHaveBeenCalledTimes(1);
  });
});

it.each(DEVICE_IDS)('%s cached production geometry equals the direct extrusion byte-for-byte', id => {
  const spec=presetSpec(id); const warm=buildDevice(spec,id==='browser',true,id,true);warm.dispose();
  const a=buildDevice(spec,id==='browser',true,id),b=buildDevice(spec,id==='browser',true,id,true);
  try {
    for(const name of ['frame','backplate','screen-seat','screen','base','keys','trackpad','camera-island']) {
      const original=a.group.getObjectByName(name),copy=b.group.getObjectByName(name);
      if (!(original instanceof Mesh)) {expect(copy).toBeUndefined();continue;}
      expect(copy).toBeInstanceOf(Mesh);if(!(copy instanceof Mesh))throw new Error('Missing geometry');
      for(const attribute of ['position','normal','uv'])expect(copy.geometry.getAttribute(attribute).array).toEqual(original.geometry.getAttribute(attribute).array);
      expect(copy.geometry.index?.array).toEqual(original.geometry.index?.array);expect(copy.geometry.groups).toEqual(original.geometry.groups);
    }
  }finally{a.dispose();b.dispose();}
});
it('production template buffers remain independent of every rig and disposal', () => {
  const spec = {...presetSpec('phone'),w:.08123};
  const a=buildDevice(spec,false,true,'phone',true),b=buildDevice(spec,false,true,'phone',true);
  const normalA=a.frame.geometry.getAttribute('normal'),normalB=b.frame.geometry.getAttribute('normal');
  const expected=Float32Array.from(normalB.array);
  expect(normalA.array).not.toBe(normalB.array);expect(normalA.array).toEqual(normalB.array);
  normalA.array.fill(0);a.dispose();
  const c=buildDevice(spec,false,true,'phone',true);
  expect(normalB.array).toEqual(expected);expect(c.frame.geometry.getAttribute('normal').array).toEqual(expected);
  b.dispose();c.dispose();
});
