import { REVISION, type ShaderMaterial } from 'three';
import type { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

/** P-6: shallow silhouettes need a longer search than the pinned eight steps.
 * Keep the existing early exits, area lookup, edge threshold and blend shader.
 * No additional targets or passes are allocated (T-P9h research F4–F7).
 */
export function installSmaaEdgeSearch(pass: SMAAPass): void {
  const material = (pass as unknown as { _materialWeights?: ShaderMaterial })._materialWeights;
  if (REVISION !== '185' || !material?.isShaderMaterial
    || material.defines['SMAA_MAX_SEARCH_STEPS'] !== '8'
    || !material.vertexShader.includes('float( SMAA_MAX_SEARCH_STEPS )')
    || !material.fragmentShader.includes('i < SMAA_MAX_SEARCH_STEPS')) {
    throw new Error('Incompatible SMAA edge search; expected Three.js revision 185.');
  }
  material.defines['SMAA_MAX_SEARCH_STEPS'] = '32';
  material.needsUpdate = true;
}
