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
and this ticket/research plus native captures/receipt in `docs/evidence/T-P9h/`.
No dependency, workflow, spec, fixture,
geometry, material, camera, image, export encoder or UI edits.

## Evidence

Verification on 2026-09-24:

- New production-pixel guard PASS (16.53 s). Served-response removal of only
  `installSmaaEdgeSearch(smaa)` FAILS as intended (24.36 s): RMS 0.1976086,
  above the unchanged 0.15 regression bound. Tracked source was never seeded.
- Typecheck and production build PASS. Existing >700 kB bundle warning remains
  visible (710.13 kB minified JS); no threshold was raised.
- Initial unit run: 209/210 PASS, one unchanged 100-endpoint camera test reached
  its 5 s timeout while the negative browser probe ran concurrently. Running
  that exact test alone PASSes in a 1.73 s total run. No timeout/assertion edits.
- A sequential full `npm run ci` was started after the captures and source
  commit. Its completed status, and the normal cloud CI/PNG/PG results, belong
  on the PR. Neither the isolated rerun nor PR #31's earlier CI is claimed as
  full acceptance for this change.
- Four native before/candidate PNGs and their SHA-256 receipt are committed in
  [`../evidence/T-P9h/`](../evidence/T-P9h/). 1280×800, DPR 1, unchanged demo
  image, Hero, soft-studio. No postprocessing of the captures; zero page,
  console and GL errors. The original case removes only the served installation.
- Browser edge RMS: 0.1976086 → 0.0958656 px (51.5% reduction); largest adjacent
  column jump 0.142857 → 0.083333 px. The fresh main-based result matches the
  research probe on PR #31; both have the same Browser geometry.

Capture provenance: local source commit
`9f83fbf2aeac3bed4953796eee72d2b6d80f1954` and published code commit
`448ae13a3f6fbd3117ea4cb0bfdedffb5292eb58` have identical Git tree
`566e1b4fcd6a23b92d5fb6b19e1d1735709c94fe`. Research was a separate earlier
commit; this evidence update changes no production code.

Reproduce images (optional browser override as documented by existing tools):

```sh
PLINTH_CHROMIUM_PATH=/path/to/chromium node scripts/edge-quality-capture.mjs
PLINTH_EDGE_SEED=original PLINTH_CHROMIUM_PATH=/path/to/chromium npx vitest run --project guards guards/edge-quality.test.ts
```

The second command is intentionally red. Normal validation is `npm run ci`.

### Performance limitations

Linux, Node 24.19.0, Chromium 153.0.8010.0, ANGLE Vulkan SwiftShader; workspace
browser only, no package/pin changes. Five warm draws followed by three batches
of ten synchronous draws, with a 1-pixel readback to include GPU completion.

| Scene | Original median batch p50 | Candidate median batch p50 | Original/candidate batch CV |
|---|---:|---:|---:|
| Browser | 223.7 ms | 210.5 ms | 7.4% / 54.8% |
| Phone | 301.5 ms | 228.2 ms | 55.3% / 4.0% |

**LOW-TRUST comparison:** software rendering and unstable batches prevent a
speed or cost-neutrality conclusion. These are repeated draws of two static
scenes, not §6's five-run transition/motion segment or physical-device evidence.
The code adds bounded edge-search work, no passes or render targets. The full
§6 desktop/phone gate remains a release obligation.

Fresh independent review and PG/owner visual acceptance remain open. No baseline
was changed, no PR was merged, and no production deployment was requested.
