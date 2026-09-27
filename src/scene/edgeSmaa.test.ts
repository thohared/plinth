import { expect, it } from 'vitest';
import { ShaderMaterial } from 'three';
import type { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SMAAWeightsShader } from 'three/addons/shaders/SMAAShader.js';
import { installSmaaEdgeSearch } from './edgeSmaa';

it('rejects an unrecognized private shader surface before changing its defines', () => {
  expect(() => installSmaaEdgeSearch({} as SMAAPass)).toThrow('Incompatible');
  for (const drift of ['bound', 'vertex', 'fragment']) {
    const material = new ShaderMaterial({...SMAAWeightsShader, defines:{...SMAAWeightsShader.defines}});
    if (drift === 'bound') material.defines['SMAA_MAX_SEARCH_STEPS'] = '16';
    if (drift === 'vertex') material.vertexShader = '';
    if (drift === 'fragment') material.fragmentShader = '';
    const original = {...material.defines};
    try {
      expect(() => installSmaaEdgeSearch({_materialWeights:material} as unknown as SMAAPass)).toThrow('Incompatible');
      expect(material.defines).toEqual(original);
    } finally { material.dispose(); }
  }
});
