import { describe,it,expect } from 'vitest';
import { decodeHash,encodeHash,decodeV1 } from './codec';
import { PRESETS } from '../devices/presets';

// Literal transport fixtures, independent of runtime defaults and encoder output.
const cases = [
  ['phone',.07266,.15,.01,.01,.0042,.0008,.95,.18,1,'none',1.5707963267948966],
  ['tablet',.25,.178,.008,.012,.009,.0008,.95,.24,1,'none',1.5707963267948966],
  ['laptop',.312,.212,.007,.008,.007,.0008,.9,.28,.6,'hinge',1.85],
  ['browser',.32,.2,.004,.009,.004,.0006,.35,.32,0,'none',1.5707963267948966],
  ['card',.3,.2,.003,.012,.001,.0005,.15,.4,0,'none',1.5707963267948966],
] as const;
const base = (row: typeof cases[number]) => ({v:1,device:row[0],spec:{w:row[1],h:row[2],depth:row[3],cornerRadius:row[4],bezel:row[5],screenInset:row[6],frameMetalness:row[7],frameRoughness:row[8],glassClearcoat:row[9],standType:row[10],hingeAngle:row[11]},view:{pose:'hero'},scene:'soft-studio',tone:'agx',msaa:false,aspect:'4:5',outputPad:0,background:{mode:'preset',solid:'#ffffff',top:'#f2f4f8',bottom:'#c8d3e3'},fit:'contain',pad:0,padColor:'#ffffff',pngScale:1});
describe('P-21 readable v2 links',()=>{
  it('uses literal per-device defaults with short names and no UI-preset coupling',()=>{
    for (const row of cases) {
      expect(decodeHash('#v2/'+row[0])).toEqual(base(row));
      expect(encodeHash(decodeV1(base(row)))).toBe('#v2/'+row[0]);
    }
    const saved=PRESETS.phone.w;
    try { PRESETS.phone.w=.08; expect(decodeHash('#v2/phone').spec.w).toBe(.07266); }
    finally { PRESETS.phone.w=saved; }
  });
  it('reads independent literal overrides for every settings and geometry field',()=>{
    const hash='#v2/phone?scene=warm-sunset&pose=front&aspect=16:9&background=gradient&tone=aces&msaa=true&outputPad=0.12345678901234566&solid=abcdef&top=123456&bottom=654321&fit=cover&pad=0.2&padColor=ffeedd&scale=3&w=0.08&h=0.16&depth=0.009&cornerRadius=0.011&bezel=0.005&screenInset=0.001&frameMetalness=0.8&frameRoughness=0.2&glassClearcoat=0.7&standType=hinge&hingeAngle=1.85';
    const expected={...base(cases[0]!),spec:{w:.08,h:.16,depth:.009,cornerRadius:.011,bezel:.005,screenInset:.001,frameMetalness:.8,frameRoughness:.2,glassClearcoat:.7,standType:'hinge',hingeAngle:1.85},view:{pose:'front'},scene:'warm-sunset',tone:'aces',msaa:true,aspect:'16:9',outputPad:.12345678901234567,background:{mode:'gradient',solid:'#abcdef',top:'#123456',bottom:'#654321'},fit:'cover',pad:.2,padColor:'#ffeedd',pngScale:3};
    expect(decodeHash(hash)).toEqual(expected);
    expect(encodeHash(decodeV1(expected))).toBe(hash);
    const legacy='#s='+Buffer.from(JSON.stringify(expected)).toString('base64url');
    expect(decodeHash(legacy)).toEqual(expected);
  });
  it('keeps custom precision/framing and inactive values through either transport',()=>{
    const expected={...base(cases[2]!),view:{pose:null,rotation:[0,0,0,1],direction:[0,.6,.8],framing:'rotation'},background:{mode:'transparent',solid:'#abcdef',top:'#123456',bottom:'#654321'},pad:1e-7};
    const hash='#v2/laptop?pose=custom&background=transparent&solid=abcdef&top=123456&bottom=654321&pad=1e-7&rotation=0,0,0,1&direction=0,0.6,0.8&framing=rotation';
    expect(decodeHash(hash)).toEqual(expected);expect(encodeHash(decodeV1(expected))).toBe(hash);
    for(const row of cases)for(const aspect of ['1:1','4:5','16:9','9:16','3:1'])for(const pose of ['front','hero','top','lean'])for(const pngScale of [1,2,3]) {
      const value=decodeV1({...base(row),aspect,view:{pose},pngScale});
      expect(decodeHash(encodeHash(value))).toEqual(value);
    }
  });
  it('rejects malformed, duplicate, unknown and conflicting inputs before application',()=>{
    for(const hash of ['#v2/','#v2/constructor','#v2/phone?','#v2/phone??pose=front','#v2/phone?pad=0&pad=0.1','#v2/phone?'+ 'a'.repeat(8193),
      ...['extra=1','__proto__=x','constructor=x','prototype=x','filename=private','%70ad=0.1','pad=','pad=NaN','pad=Infinity','pad=1e999','pad=0x1','pad=+0.1','pad=0.251','pad=01','pad=%ZZ','pad=%20','pad=%FF','pad=0&','msaa=1','scale=1.5','scene=unknown','solid=bad','w=0.001','bezel=0.02','screenInset=0.01','pose=custom','pose=front&rotation=0,0,0,1','framing=rotation','pose=custom&rotation=0,0,0,2&direction=0,0.6,0.8','pose=custom&rotation=0,0,0,1&direction=0,0,1','pose=custom&rotation=0,0,0,1&direction=0,0.6,0.8&framing=bad'].map(q=>'#v2/phone?'+q)]) {
      expect(()=>decodeHash(hash),hash).toThrow('Invalid');
    }
    for(const hash of ['#v3/phone','#v99/laptop?pose=front'])expect(()=>decodeHash(hash)).toThrow('Unsupported');
    expect(decodeHash('#v2/phone?aspect=16%3A9').aspect).toBe('16:9');
  });
});
