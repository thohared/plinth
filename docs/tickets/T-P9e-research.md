# T-P9e research — reference-led render and panel polish

Owner finished the image review with “Gotovo” on 2026-09-17 and requested all
views plus the UI. Base: PR #28 `0914fa5b2a30be62523c2e705dc3cb7c3cac49bc`;
main `8d92de1350026acc1900971ac24f94738a3aaea1`. PRs 25/27/28 remain unmerged.
Clauses: §2, §3, §4.1–4.6, §4.8–4.9, §7, P-6/P-7/P-9/P-10/P-13/P-14.
This pass precedes implementation; no fixture acceptance or merge is implied.

## Findings

- F1 — `src/screen/demo.ts:7`, `fit.ts:12–15`, `material.ts:36–48`:
  the wide demo is 16:10 while tablet/laptop/card openings are taller. Contain
  preserves the full image but exposes white padColor above/below it. Browser
  still uses Cover, cropping its image beneath the chrome. Use Contain for all
  default demos. On the owned landscape demo only, with Contain and zero image
  padding, continue the outermost source texel colors into the unused space.
  The complete fitted picture keeps its UVs, scale and aspect. User uploads,
  explicit image padding, custom padding color and Cover keep normal behavior.
  No source asset replacement, stretched content or resized device is needed.
- F2 — `src/scene.ts:189–194,345–353` creates ordinary mipmapped textures with
  anisotropy=1, including recovery. Request 8× anisotropic filtering in one
  shared texture factory. Pinned Three `WebGLTextures.js:702` clamps to actual
  GPU capability; no new dependency. Nearest filtering would pixelate text.
  Native exports, source resolution and oblique texture sampling are separate
  from fixed DPR1 PG evidence. Do not enlarge captures and call them sharper.
- F3 — `src/devices/build.ts:290–346`, `screen/material.ts:26–33`:
  browser chrome is a rectangular plane meeting a rounded frame, and the screen
  uses a deterministic cutout plus SMAA. Inspect actual close-ups before changing
  geometry. Keep the one opaque physical screen, tone exemption and SDF mask;
  no stochastic alphaHash or second glass layer. Bound any geometry correction
  to overlap/edge continuity, preserving class dimensions and accepted poses.
- F4 — `src/scene/contactShadow.ts:98–114`: capture extent scales independently
  with width and depth. Upright phone depth is only 10 mm, so the same blur is
  compressed into a narrow strip, unlike the approved leaned phone. Give only
  upright phone captures a minimum depth footprint derived from phone width,
  retaining actual world placement. Keep lean/top and other devices' accepted
  shadows; retain 256², the two blur cycles and invalidation/restoration behavior.
- F5 — `src/ui/panel.ts:42,94–111`, `panel.css`: long header, separate large
  look cards, repeated borders and pale green dilute hierarchy. Use Plinth /
  Screenshot studio, deep green accent, compact segmented looks with all four
  required thumbnails (P-10), quiet groups and clearer focus/disabled states.
  Native selects preserve phone/tablet and keyboard behavior; style them rather
  than replacing their interaction contract with a custom widget library.
- F6 — `src/ui/panel.ts:129–180,203–230`, `panel.css:80–108`:
  export already lives outside scrollable settings, which is required by the
  accepted T-P9a repair. Preserve that structure, recovery/status and download
  link; strengthen its visual priority. Add a mobile image shortcut alongside
  Settings without cloning the hidden file input. Keep accessible nonmodal
  sheet, focus restoration and 44 px targets. Share/help move below Advanced.
  Add an in-memory light/dark panel toggle only; it must not change render colors,
  image, shared scene state, runtime network or storage. Reduced-motion styling
  and optional supported backdrop blur are visual enhancements.
- F7 — `scripts/pg-capture.mjs`, `png-acceptance.mjs`, existing guards:
  preserve all capture cases/thresholds, exact PNG sizes and read-only fixtures.
  Add behavioral coverage for uncropped browser/demo margins/upload isolation,
  geometry overlap if confirmed, and mobile image/export/theme actions. Seed
  regressions. Capture the full grid for verification but deliver a small set
  of linked native PNGs and one overview, with desktop/mobile UI screenshots.

## References and boundaries

Owner approved phone lean/top/dark, laptop lean/front/dark, tablet light lean/top
and dark, card warm/light/dark; preserve their appearance. Laptop hero was
acceptable but weaker. Browser shadow was approved; browser edges/crop were not.
All wide references need white-band removal and sharper screens. Laptop dark
also has a broken bright hinge-adjacent line to inspect. Phone sharpness is optional.

Consulted merged Astra source review at astra-runner `9e8ba711`,
`docs/knowledge/2026-09-mobile-3d.md` F1/F2/F5: distinguish resolution/UV/shadows,
compare accepted references and retain accessible controls. No external code,
React, NVIDIA SDK, AI imagery or always-on owner computer is introduced.

No uncovered normative scope is required: demo presentation and by-eye lighting
remain implementations of existing clauses. MSAA stays opt-in; PNG dimensions,
source assets, state schema and camera contract stay fixed. UI dark mode is
ephemeral panel presentation, not another lighting preset.

Proposed write set: this research and T-P9e ticket; src/screen/demo.ts and
material.ts; src/scene.ts; narrow src/devices/build.ts, scene/contactShadow.ts
and studio.ts; src/ui/panel.ts/css and related tests; additive guards/review-polish.test.ts;
browser default expectation updates in existing demo tests/guard (same assertions);
scripts/review-polish-capture.mjs and existing demo capture expectation;
public/compositions/*.png refreshed from actual app. No spec/dependency/workflow/
fixture edits. Local CI/build before publication; independent review remains separate.

## F8 — edge inspection before the final candidate

Actual before/after DPR1 captures reproduce the clipped browser header and show
thin uneven reflected strips on frame bevels, separately from the Contain bands.
Browser titlebar's square top corners overrun its rounded opening. Round only its
top corners to the opening; retain the straight seam against the picture. Increase
bevel sampling 3→6 and outline sampling 16→24 to smooth rounded silhouettes and
reflected strips while retaining exact dimensional bounds, SDF screen mask and
normals utility position/UV preservation. This modest tessellation change requires
all existing geometry and bounds tests plus native image inspection. DPR1 cannot
promise absence of every single-pixel staircase; report exports separately.
Add a rounded-bar geometry regression (all vertices inside the opening) and
phone minimum shadow footprint test. Write set includes their existing unit files.

## F9 — preserve preview dimensions during export feedback

The full CI candidate exposed two existing PNG invariants at
`guards/png-export.test.ts:49,98`. A focused unchanged rerun confirms that the
content-sized export footer changes the mobile canvas when the download/status
appears: 656²→490² after a DPR3 download and 262×328→244×305 on an injected failure.
The export renderer restores itself; the surrounding grid then resizes it.
Remove the late `height:auto` override in `src/ui/panel.css` and retain a fixed,
bounded, independently scrolling export area (238 px desktop / 172 px mobile).
Keep the new visual styling, actual download link and recovery controls. Re-run
these existing guards unchanged, then full CI. Refresh only the affected UI
captures; scene/native exports and composition thumbnails are unaffected.

## F10 — source contract and exact alpha-composite arithmetic

The completed full run (1301.58 s) passed 87/89 guards. Two failures:

- `guards/camera-posing.test.ts:28` requires the existing literal call
  `shadow.fit(stage.getWorldBounds())`. Keep that actual one-argument call for
  every non-phone device; isolate the phone's minimum-depth call in its own
  branch. This preserves both the old source contract and the accepted non-phone
  behavior. Do not edit the camera guard or add a fake matching comment.
- `guards/output-alpha.test.ts:99` rejects compositeMax=2.0000000000000284 against
  the unchanged <=2 bound. Its source-over subtraction introduces floating-point
  cancellation. For byte values v=1,p=0,a=20,pa=21,bg=255, the old expression has
  that result while the exact difference is 2. Compute the same error as
  `abs(255*(v-p)+bg*(pa-a))/255`: the numerator is exact bounded integer arithmetic.
  Keep every pixel/background/device/scene/tone/aspect case and every existing
  assertion/threshold. No epsilon, rounding, clamp, skip or case reduction.
  This corrects an oracle precision defect, not the render tolerance. Check the
  original-SMAA violation seed still fails the same corrected oracle.

Write set expands only to that arithmetic expression in the existing alpha guard,
the real non-phone branch in studio.ts, and research/ticket evidence. Run focused
positive/negative guards, then full CI/build. No shader or rendered pixels change.
