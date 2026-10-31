import {it, expect} from 'vitest';
import {createHistory} from './history';
import {decodeV1, type SharedState} from './codec';

// Literal domain values, independent of settings/preset defaults.
const fixture = (): SharedState => decodeV1({v:1,device:'phone',spec:{w:.072,h:.152,depth:.008,cornerRadius:.012,bezel:.003,screenInset:.001,frameMetalness:.7,frameRoughness:.3,glassClearcoat:.8,standType:'none',hingeAngle:1.85},view:{pose:'hero'},scene:'soft-studio',tone:'agx',msaa:false,aspect:'4:5',outputPad:0,background:{mode:'preset',solid:'#ffffff',top:'#ffffff',bottom:'#000000'},fit:'cover',pad:0,padColor:'#ffffff',pngScale:1});
function setup() {
  let state = fixture(), actual: SharedState | undefined, available = true, fail = false;
  const history = createHistory({capture: displayed => displayed && actual ? actual : state,
    restore(value) { if (fail) throw Error('restore failed'); state = value; },
    available: () => available, endGestures() { history.end(); }});
  return {history, get: () => state, edit: (pad: number) => history.run(() => { state = {...state,pad}; }),
    actual: (value: SharedState) => { actual = value; }, available: (value: boolean) => { available = value; }, fail: (value: boolean) => { fail = value; }};
}
it('keeps exactly fifty completed edits and reload starts empty', () => {
  const s = setup(); expect(s.history.get()).toEqual({undo:false,redo:false});
  for (let i = 1; i <= 55; i++) s.edit(i / 1000);
  for (let i = 54; i >= 5; i--) { expect(s.history.undo()).toBe(true); expect(s.get().pad).toBe(i / 1000); }
  expect(s.history.undo()).toBe(false); expect(setup().history.get()).toEqual({undo:false,redo:false});
});
it('groups a gesture and preserves redo across no-op and rejected edits', () => {
  const s = setup(); s.history.begin(); for (const pad of [.01,.02,.03]) s.edit(pad); s.history.end();
  expect(s.history.undo()).toBe(true); expect(s.get().pad).toBe(0); expect(s.history.undo()).toBe(false);
  s.edit(0); expect(() => s.history.run(() => { throw Error('invalid'); })).toThrow('invalid');
  expect(s.history.redo()).toBe(true); expect(s.get().pad).toBe(.03);
  s.history.undo(); s.edit(.04); expect(s.history.redo()).toBe(false);
});
it('captures actual interrupted pose before an edit and named target afterwards', () => {
  const s = setup(); const view: SharedState['view'] = {pose:null,rotation:[0,0,0,1],direction:[0,.6,.8],framing:'rotation'};
  s.actual({...fixture(),view}); s.edit(.1); s.history.undo(); expect(s.get().view).toEqual(view);
  s.history.redo(); expect(s.get().view).toEqual({pose:'hero'}); expect(s.get().pad).toBe(.1);
});
it('ignores animation-only differences and never consumes a failed restore', () => {
  const s = setup(); s.actual({...fixture(),view:{pose:null,rotation:[0,0,0,1],direction:[0,.6,.8]}});
  s.edit(0); expect(s.history.undo()).toBe(false); s.edit(.1);
  s.fail(true); expect(() => s.history.undo()).toThrow('restore failed'); expect(s.history.get()).toEqual({undo:true,redo:false});
  s.fail(false); expect(s.history.undo()).toBe(true); expect(s.get().pad).toBe(0);
});
it('gates traversal without deleting history and clears pending edits on a new baseline', () => {
  const s = setup(); s.edit(.1); s.available(false); expect(s.history.get()).toEqual({undo:false,redo:false}); expect(s.history.undo()).toBe(false);
  s.available(true); expect(s.history.undo()).toBe(true); s.history.begin(); s.edit(.2); s.history.clear(); s.history.end();
  expect(s.history.get()).toEqual({undo:false,redo:false});
});
