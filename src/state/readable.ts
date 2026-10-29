import type { SharedState } from './codec';
import type { DeviceSpec } from '../devices/spec';

// P-21 wire defaults are frozen at v2, independent of future UI preset changes.
const SPECS: Record<string, DeviceSpec> = {
  phone: {w:.07266,h:.150,depth:.010,cornerRadius:.010,bezel:.0042,screenInset:.0008,frameMetalness:.95,frameRoughness:.18,glassClearcoat:1,standType:'none',hingeAngle:Math.PI/2},
  tablet: {w:.250,h:.178,depth:.008,cornerRadius:.012,bezel:.009,screenInset:.0008,frameMetalness:.95,frameRoughness:.24,glassClearcoat:1,standType:'none',hingeAngle:Math.PI/2},
  laptop: {w:.312,h:.212,depth:.007,cornerRadius:.008,bezel:.007,screenInset:.0008,frameMetalness:.9,frameRoughness:.28,glassClearcoat:.6,standType:'hinge',hingeAngle:1.85},
  browser: {w:.320,h:.200,depth:.004,cornerRadius:.009,bezel:.004,screenInset:.0006,frameMetalness:.35,frameRoughness:.32,glassClearcoat:0,standType:'none',hingeAngle:Math.PI/2},
  card: {w:.300,h:.200,depth:.003,cornerRadius:.012,bezel:.001,screenInset:.0005,frameMetalness:.15,frameRoughness:.4,glassClearcoat:0,standType:'none',hingeAngle:Math.PI/2},
};
const SPEC_KEYS = ['w','h','depth','cornerRadius','bezel','screenInset','frameMetalness','frameRoughness','glassClearcoat','standType','hingeAngle'] as const;
const KEYS = new Set(['scene','pose','tone','msaa','aspect','outputPad','background','solid','top','bottom','fit','pad','padColor','scale','rotation','direction','framing',...SPEC_KEYS]);
function invalid(): never { throw new Error('Invalid scene link. Your current scene has not been changed.'); }
function numeric(value: string): number {
  if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)) return invalid();
  const number = Number(value);
  if (!Number.isFinite(number)) return invalid();
  return number;
}

/** Parse the transport only. codec.decodeV1 validates the complete DTO before use. */
export function decodeReadable(hash: string): unknown {
  if (hash.length - 1 > 8192) return invalid();
  if (/^#v\d+\//.test(hash) && !hash.startsWith('#v2/')) {
    throw new Error('Unsupported scene link version. Your current scene has not been changed.');
  }
  const match = /^#v2\/([a-z]+)(?:\?(.+))?$/.exec(hash);
  if (!match || !Object.hasOwn(SPECS, match[1]!)) return invalid();
  const device = match[1]!;
  const fields = new Map<string,string>();
  for (const pair of match[2]?.split('&') ?? []) {
    const part = /^([a-zA-Z]+)=((?:[a-zA-Z0-9.,:+-]|%[0-9a-fA-F]{2})+)$/.exec(pair);
    if (!part || !KEYS.has(part[1]!) || fields.has(part[1]!)) return invalid();
    try { fields.set(part[1]!, decodeURIComponent(part[2]!)); } catch { return invalid(); }
  }
  const text = (key: string, fallback: string): string => fields.get(key) ?? fallback;
  const number = (key: string, fallback: number): number => fields.has(key) ? numeric(fields.get(key)!) : fallback;
  const color = (key: string, fallback: string): string => '#' + text(key, fallback);
  const spec: Record<string, unknown> = {...SPECS[device]!};
  for (const key of SPEC_KEYS) if (fields.has(key)) spec[key] = key === 'standType' ? fields.get(key) : numeric(fields.get(key)!);
  const pose = text('pose','hero');
  let view: unknown = {pose};
  if (pose === 'custom') {
    if (!fields.has('rotation') || !fields.has('direction')) return invalid();
    view = {pose:null,rotation:fields.get('rotation')!.split(',').map(numeric),direction:fields.get('direction')!.split(',').map(numeric),
      ...(fields.has('framing') ? {framing:fields.get('framing')} : {})};
  } else if (['rotation','direction','framing'].some(key => fields.has(key))) return invalid();
  const msaa = text('msaa','false');
  if (msaa !== 'false' && msaa !== 'true') return invalid();
  return {v:1,device,spec,view,scene:text('scene','soft-studio'),tone:text('tone','agx'),msaa:msaa === 'true',
    aspect:text('aspect','4:5'),outputPad:number('outputPad',0),
    background:{mode:text('background','preset'),solid:color('solid','ffffff'),top:color('top','f2f4f8'),bottom:color('bottom','c8d3e3')},
    fit:text('fit','contain'),pad:number('pad',0),padColor:color('padColor','ffffff'),pngScale:number('scale',1)};
}

/** Input has already passed decodeV1. Emit only differences, without rounding. */
export function encodeReadable(state: SharedState): string {
  const fields: string[] = [];
  const add = (key: string, value: string | number | boolean, fallback?: string | number | boolean): void => {
    if (value !== fallback) fields.push(key + '=' + encodeURIComponent(String(value)).replace(/%3A/g,':').replace(/%2C/g,','));
  };
  add('scene',state.scene,'soft-studio');
  add('pose',state.view.pose ?? 'custom','hero');
  add('aspect',state.aspect,'4:5');
  add('background',state.background.mode,'preset');
  add('tone',state.tone,'agx'); add('msaa',state.msaa,false); add('outputPad',state.outputPad,0);
  add('solid',state.background.solid.slice(1),'ffffff');
  add('top',state.background.top.slice(1),'f2f4f8'); add('bottom',state.background.bottom.slice(1),'c8d3e3');
  add('fit',state.fit,'contain'); add('pad',state.pad,0); add('padColor',state.padColor.slice(1),'ffffff'); add('scale',state.pngScale,1);
  for (const key of SPEC_KEYS) add(key,state.spec[key],SPECS[state.device]![key]);
  if (state.view.pose === null) {
    add('rotation',state.view.rotation.join(',')); add('direction',state.view.direction.join(','));
    if (state.view.framing) add('framing',state.view.framing);
  }
  const hash = '#v2/' + state.device + (fields.length ? '?' + fields.join('&') : '');
  if (hash.length - 1 > 8192) return invalid();
  return hash;
}
