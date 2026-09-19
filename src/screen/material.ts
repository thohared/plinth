import { Color, MeshPhysicalMaterial, SRGBColorSpace, Texture, Vector2, Vector4 } from 'three';
import { fitTransform } from './fit';
import type { FitMode, Size } from './types';

/** Order: top-left, top-right, bottom-right, bottom-left. Units: metres. */
export type CornerRadii = readonly [number, number, number, number];

const declarations = `
varying vec2 vScreenUv;
uniform vec2 screenMetres;
uniform vec2 innerMetres;
uniform vec2 pictureMetres;
uniform vec4 screenRadii;
uniform vec3 screenPadColor;
uniform bool screenColourOverride;
uniform bool screenDemoEdges;
float screenDistance(vec2 p) {
  float radius = p.y > 0.0
    ? (p.x < 0.0 ? screenRadii.x : screenRadii.y)
    : (p.x < 0.0 ? screenRadii.w : screenRadii.z);
  radius = min(radius, min(screenMetres.x, screenMetres.y) * 0.5);
  vec2 q = abs(p) - screenMetres * 0.5 + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}
`;
const mask = `
vec2 screenPoint = (vScreenUv - 0.5) * screenMetres;
float screenEdge = screenDistance(screenPoint);
float screenAA = max(fwidth(screenEdge), 0.0000001);
if (screenEdge > 0.0) discard;
diffuseColor.a *= smoothstep(0.0, screenAA, -screenEdge);
`;
const sample = `
#ifdef USE_EMISSIVEMAP
if (!screenColourOverride) {
  vec2 pictureUv = screenPoint / pictureMetres + 0.5;
  vec3 picture = screenPadColor;
  // Only the owned landscape demo continues its border colors into unused
  // Contain space. The fitted picture itself is neither cropped nor stretched.
  if (screenDemoEdges) pictureUv = clamp(pictureUv, vec2(0.0), vec2(1.0));
  if (all(lessThanEqual(abs(screenPoint), innerMetres * 0.5))
      && all(greaterThanEqual(pictureUv, vec2(0.0)))
      && all(lessThanEqual(pictureUv, vec2(1.0)))) {
    // Decoded bitmaps have top-left rows; texture flipY does not flip a bitmap.
    vec4 texel = texture2D(emissiveMap, vec2(pictureUv.x, 1.0 - pictureUv.y));
    picture = mix(screenPadColor, texel.rgb, texel.a);
  }
  totalEmissiveRadiance *= picture;
}
#endif
`;

export function patchScreen(material: MeshPhysicalMaterial) {
  const uniforms = {
    screenMetres: { value: new Vector2(1, 1) },
    innerMetres: { value: new Vector2(1, 1) },
    pictureMetres: { value: new Vector2(1, 1) },
    screenRadii: { value: new Vector4() },
    screenPadColor: { value: new Color('#ffffff') },
    screenColourOverride: { value: false },
    screenDemoEdges: { value: false },
  };
  let extendDemoEdges = false;
  // Continuous opaque silhouette: threshold derivative-based SDF coverage,
  // then let existing SMAA/MSAA smooth the edge without stochastic holes.
  material.alphaHash = false;
  material.alphaTest = 0.5;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `varying vec2 vScreenUv;\n${shader.vertexShader}`
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvScreenUv = uv;');
    shader.fragmentShader = declarations + shader.fragmentShader
      .replace('#include <alphatest_fragment>', `${mask}\n#include <alphatest_fragment>`)
      .replace('#include <emissivemap_fragment>', sample);
  };
  material.customProgramCacheKey = () => 't-p9e-screen-v1';
  return {
    bind(texture: Texture, imageSize: Size, demoEdges = false) {
      extendDemoEdges = demoEdges;
      texture.colorSpace = SRGBColorSpace;
      texture.flipY = false;
      const needsCompile = material.emissiveMap === null;
      material.emissiveMap = texture;
      material.emissive.set('#ffffff');
      uniforms.screenColourOverride.value = false;
      if (needsCompile) material.needsUpdate = true;
      return { ...imageSize };
    },
    refresh(image: Size, screen: Size, radii: CornerRadii, mode: FitMode, pad: number, padColor: string) {
      const fitted = fitTransform(image, screen, mode, pad);
      uniforms.screenMetres.value.set(screen.w, screen.h);
      uniforms.innerMetres.value.set(fitted.inner.w, fitted.inner.h);
      uniforms.pictureMetres.value.set(fitted.image.w, fitted.image.h);
      uniforms.screenRadii.value.set(...radii);
      uniforms.screenPadColor.value.set(padColor);
      uniforms.screenDemoEdges.value = extendDemoEdges && mode === 'contain' && pad === 0 && padColor.toLowerCase() === '#ffffff';
    },
    colour(hex: string) {
      uniforms.screenColourOverride.value = true;
      material.emissive.set(hex);
    },
  };
}
