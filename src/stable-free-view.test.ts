import { it, expect, vi } from 'vitest';
import { Vector3 } from 'three';
import { createStage, geometryWorldBounds } from './scene';
import { DEVICE_IDS } from './devices/presets';
import { createSettingsStore } from './settings';
import { decodeHash, encodeHash, snapshotState, decodeV1 } from './state/codec';

it.each(DEVICE_IDS)('%s keeps a fixed rotation center distance through full turns, resize and export', id => {
  const stage = createStage(id, 'soft-studio', 1);
  try {
    const pivot = stage.getRig().group.parent!;
    // Independent center from actual world mesh bounds in the initial unrotated pose.
    const localCenter = pivot.worldToLocal(geometryWorldBounds(stage.getRig().group).getCenter(new Vector3()));
    for (const aspect of [9/16, 4/5, 1, 16/9, 3]) {
      stage.setAspect(aspect);
      for (const [dx,dy] of [[Math.PI/12,0],[0,Math.PI/12],[Math.PI/15,Math.PI/20]]) {
        const distances: number[] = [];
        stage.rotate(dx!,dy!);
        const orientation = stage.camera.quaternion.clone();
        for (let step=0; step<24; step++) {
          stage.rotate(dx!,dy!);
          const center = pivot.localToWorld(localCenter.clone());
          distances.push(stage.camera.position.distanceTo(center));
          expect(1-Math.abs(stage.camera.quaternion.dot(orientation))).toBeLessThan(1e-12);
          expect(stage.getFloorMinY()).toBeCloseTo(0,10);
          const b = stage.getWorldBounds();
          for (const x of [b.min.x,b.max.x]) for (const y of [b.min.y,b.max.y]) for (const z of [b.min.z,b.max.z]) {
            const p = new Vector3(x,y,z).project(stage.camera);
            expect(Math.abs(p.x)).toBeLessThanOrEqual(.9);
            expect(Math.abs(p.y)).toBeLessThanOrEqual(.9);
            expect(Math.abs(p.z)).toBeLessThan(1);
          }
        }
        expect(Math.max(...distances)/Math.min(...distances)).toBeCloseTo(1,10);
      }
      const before = stage.camera.toJSON();
      stage.withOutputCamera(aspect, () => expect(stage.camera.toJSON()).toEqual(before));
      expect(() => stage.withOutputCamera(1.3, () => { throw Error('capture'); })).toThrow('capture');
      expect(stage.camera.toJSON()).toEqual(before);
    }
    stage.setPose('hero',true);
    const clean = createStage(id,'soft-studio',3);
    expect(stage.camera.position).toEqual(clean.camera.position);
    expect(stage.snapshot().custom.framing).toBeUndefined();
    clean.dispose();
  } finally { stage.dispose(); }
});

it('persists framing through v1 reload, orbit, geometry/padding edits and rejects malformed fields atomically', () => {
  const stage = createStage('laptop','soft-studio',.8);
  const studio = {getToneMapping: () => 'agx', prepareSettings: vi.fn(() => ({commit() {},dispose() {}}))};
  const store = createSettingsStore(stage,studio as never,{immediate:true,msaa:false});
  try {
    stage.rotate(.7,1.3);
    stage.orbit(.1,.1);
    store.apply({spec:{...store.get().spec,hingeAngle:2.1},outputPad:.12});
    const before = stage.camera.toJSON();
    const saved = decodeHash(encodeHash(snapshotState(store.get(),false)));
    expect(saved.view).toMatchObject({pose:null,framing:'rotation'});
    store.reset(); store.hydrate(saved);
    expect(stage.camera.toJSON()).toEqual(before);
    const current = store.get();
    for (const framing of [null,false,'auto',1]) {
      expect(() => store.hydrate({...saved,view:{...saved.view,framing}} as never)).toThrow();
      expect(store.get()).toEqual(current);
    }
    expect(() => decodeV1({...saved,view:{...saved.view,extra:true}})).toThrow();
    const {framing:_, ...legacy} = saved.view as Exclude<typeof saved.view,{pose:string}>;
    expect(decodeV1({...saved,view:legacy}).view).toEqual(legacy);
  } finally {store.dispose();stage.dispose();}
});
