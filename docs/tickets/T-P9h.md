# T-P9h — shallow frame edge quality

Base: main `cdcd80a6bda46b35d691bf926d759177b6f4e335`, independent of draft PR #31.
Research F1–F9 was committed before this ticket. Cites §2–3, §4.4–4.6,
§6–7, P-6/P-11/P-13/P-15. No TODO(spec) or spec amendment.

## Scope and acceptance

1. Extend the pinned default SMAA edge search to 32 steps (F4–F6). Preserve
   early exit, edge threshold, gamma/alpha blending, target/pass counts and
   resource ownership. Fail closed if the pinned adapter surface changes.
2. Keep source image dimensions, UVs, camera/device shape, PG DPR, preview DPR,
   PNG size table and opt-in MSAA unchanged (F3/F6/F9).
3. Add a production-canvas Browser regression for the observed shallow edge,
   using interpolated contrast crossings (F5). It must fail when the served
   adapter installation is removed, without editing tracked source.
4. Supply reproducible before/candidate Browser and Phone captures at the same
   1280×800 resolution. Report environment, relative warm render timings and
   limits; do not call SwiftShader a target-device performance pass (F7/F8).
5. Keep all existing guards and PNG/PG thresholds. `npm run ci`, build and
   the normal PR PNG/PG jobs remain acceptance gates. No duplicate dispatch.
6. Fresh-session review and owner visual acceptance remain required. No baseline
   edits or merge by this builder; do not describe all reported edges as fixed.

## Write set

`src/scene/edgeSmaa.ts`, its unit test, one installation in `pipeline.ts`,
additive `guards/edge-quality.test.ts`, `scripts/edge-quality-capture.mjs`,
and this ticket/research/evidence. No dependency, workflow, spec, fixture,
geometry, material, camera, image, export encoder or UI edits.

## Evidence

Pending implementation verification. PR #31's previous results do not validate
this new renderer configuration. Cloud results must identify this PR's head.
