import { it, expect } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { rotateInView } from './camera/poses';
import { createStage, geometryWorldBounds } from './scene';
import { DEVICE_IDS } from './devices/presets';

it('full turns and opposite drags preserve a unit orientation without an angle limit', () => {
  const direction = new Vector3(0,0,1), start = new Quaternion();
  const half = rotateInView(start,direction,Math.PI,0);
  expect(new Vector3(0,0,1).applyQuaternion(half).z).toBeCloseTo(-1,12);
  const complete = rotateInView(half,direction,Math.PI,0);
  expect(complete.angleTo(start)).toBeCloseTo(0,12);
  const mixed = rotateInView(start,direction,.9,1.7);
  expect(rotateInView(mixed,direction,-.9,-1.7).angleTo(start)).toBeCloseTo(0,7);
  expect(mixed.length()).toBeCloseTo(1,12);
  expect(new Vector3(0,-1,0).applyQuaternion(rotateInView(start,direction,0,-Math.PI/2)).z).toBeCloseTo(1,12);
});
it.each(DEVICE_IDS)('%s stays grounded, opaque and safely framed through full turns and resize', id => {
  const stage = createStage(id,'soft-studio',1);
  try {
    let changes=0; stage.onGeometryChange(()=>changes++);
    for (const [x,y] of [[Math.PI,0],[0,-Math.PI/2],[1.1,.8],[Math.PI*2,0]]) {
      stage.rotate(x!,y!);
      expect(stage.getPose()).toBeNull();
      expect(stage.snapshot().custom.rotation.length()).toBeCloseTo(1,12);
      for(const aspect of [.5625,1,1.6,3]) {
        stage.setAspect(aspect);
        const b=geometryWorldBounds(stage.getRig().group);
        expect(b.min.y).toBeCloseTo(0,7);
        expect(b.min.distanceTo(stage.getWorldBounds().min)).toBeLessThan(1e-6);
        for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]) {
          const p=new Vector3(x,y,z).project(stage.camera);
          expect(Math.abs(p.x)).toBeLessThanOrEqual(.9000001); expect(Math.abs(p.y)).toBeLessThanOrEqual(.9000001);
          expect(p.z).toBeGreaterThan(-1); expect(p.z).toBeLessThan(1);
        }
        expect(stage.camera.up.toArray()).toEqual([0,1,0]);
      }
    }
    expect(changes).toBe(4);
  } finally {stage.dispose();}
});
it('interrupts from the displayed pose and rejects invalid deltas atomically', () => {
  const stage=createStage('laptop','soft-studio',1.6);
  try {
    stage.setPose('lean');stage.advancePose(.1);const before=stage.snapshot();
    const expected=rotateInView(before.custom.rotation,before.custom.direction,.4,.2);
    stage.rotate(.4,.2);expect(stage.isTransitioning()).toBe(false);
    expect(stage.snapshot().custom.rotation.angleTo(expected)).toBeCloseTo(0,8);
    const current=stage.snapshot();for(const value of [NaN,Infinity,-Infinity]) {
      expect(()=>stage.rotate(value,0)).toThrow();expect(stage.snapshot()).toEqual(current);
    }
  } finally {stage.dispose();}
});
