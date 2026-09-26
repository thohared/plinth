# T-P9i research — equal Browser side heights

Author: Codex. Owner request, 2026-09-26: the Browser right side looks taller
than the left; “E to. Ispravi”. Base/main:
`cdcd80a6bda46b35d691bf926d759177b6f4e335`.
Shared knowledge read at `05cdc2f09aa4c8096a79ed4621a06f9c0bad3ace`.
PR #31 and #32 are open, not ancestors of this main-based correction.

## 1. Clauses touched

§2.5–2.7, §4.2–4.3, §4.5–4.6, §4.8, §7; P-11(1–5),
P-12/P-13/P-14/P-15. Perspective correction, not a new aspect or device.

## 2. Existing surfaces

- F1: `src/camera/poses.ts:poseValue` gives wide Hero a normalized
  (0.2,0.16,1) direction. `src/scene.ts:createStage` frames a real
  PerspectiveCamera around the complete posed world bounds. Positive X makes
  the right side nearer; equal world heights project to unequal image heights.
  This is expected perspective, not a nonrectangular mesh or stretched image.
- F2: `src/devices/presets.ts:PRESETS.browser` is 0.320 × 0.200 metres;
  `src/devices/build.ts:buildSlab` removes the title bar from the image opening.
  `src/screen/fit.ts:fitTransform` uses uniform scale. Changing aspect, UVs or
  screenshot size would not eliminate left/right perspective asymmetry.
- F3: Centering only Browser Hero's camera X at zero preserves a modest
  elevated view while equalizing the projected vertical sides. Keep direction
  (0,0.16,1), device rotation identity, the 24° lens, dimensions and fill.
  Other devices/poses and explicit custom views retain their behavior.
- F4: `src/scene.test.ts` can project actual screen-mesh corners through the
  production camera, independently checking edge heights and top/bottom
  endpoint alignment. A browser pixel check must also detect the silhouette
  at symmetric columns and fail with the original served pose table.
- F5: `src/state/codec.ts`, `src/settings.ts:hydrate` preserve explicit custom
  rotation/direction. A named Browser Hero link resolves to the corrected
  named pose; there is no hash schema change or migration of custom views.
- F6: Existing CI/PG/PNG workflows remain. Browser Hero baseline diffs are
  intentional and require owner review and a separate CI-derived bless; do
  not overwrite fixtures or loosen thresholds. Main-based work excludes PR
  #32's SMAA change. Its old-angle edge regression will need an explicit
  legacy camera fixture when the two independent PRs are integrated.

## 3. Contract gap and implementation boundary

P-11(2) explicitly fixes wide Hero's lateral direction. The owner's new
Browser-only correction needs a standalone planning amendment before code,
not a hidden change to that table. P-16 belongs to open PR #31; reserve P-17
for this Browser exception. No new device geometry, orthographic camera,
roll, title-bar design, 16:9 claim or global camera change is authorized.
Research is committed first, then the spec-only amendment, then the ticket
and focused implementation. No merge/deploy or baseline blessing is implied.
