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

## F11 — restrict dense bevels to visible device surfaces

The next full run hit the existing 120 s laptop alpha-pipeline timeout and was
interrupted. The unchanged isolated laptop case passes but takes 103.53 s. Units
then pass 199/200, with the existing 1,500-transition framing test exceeding 20 s.
This warrants a geometry-cost measurement instead of increasing timeouts.

Same Node/Vite SSR traversal, default laptop, summing submitted position vertices
including InstancedMesh multiplicity:
- Accepted PR #28: 463,644 total; keys 6,324 × 70.
- F8 candidate: 1,203,948 total; keys 16,452 × 70.

The global bevel increase accidentally multiplies the repeated keycap cost by
2.6. Owner asked for device-frame edges and approved the keyboard. Retain 6/24
sampling on visible body/frame surfaces, but use the accepted 3/16 sampling for
the private keycap slab. This should yield 494,988 submitted vertices (about 7%
above accepted baseline), preserving the improved external silhouette.
Add a measured laptop vertex budget below 600,000, including all key instances;
this fails the 1.2M candidate without restating builder constants. Keep all
existing timing budgets. Re-run unit and actual laptop alpha checks. Refresh the
16 laptop scene/pose views, its native PNG and thumbnail, the overview and UI
captures. No change to accepted other-device renders is required.

Write set: private slab detail options and keycap call in build.ts, additive
build.test.ts budget, existing composition assets and ticket/evidence.

## F12–F14 — owner follow-up on the delivered UI and device renders

Base: published PR #29 `1979bde5612275e9690dd23a86be3f5a2ea67c1c`.
Owner retains the UI direction but rejects the phone's broken inner edge,
tablet/card pointed shadows, and the empty space below mobile Export.
This supersedes F4's instruction to leave tablet/card shadow fitting untouched.
Clauses remain §4.1–4.4, §4.6/P-13, §4.9 and §7; no spec gap is required.

- F12 — `src/devices/build.ts:293–352`, `src/screen/material.ts:29–34`:
  a uniform-white phone probe reproduces the broken dark inner line. Disabling
  depth testing does not remove it; removing alpha-test inset makes it worse.
  Coloring the backing pink identifies the exposed recess; giving that surface
  the shell material removes the high-contrast dotted strip. The dark recess is
  legitimate below the image, but the screen needs a continuous physical seat
  where its SDF edge meets the shell. Add a narrow rounded frame-material ring
  behind the screen, above the backing, overlapping both the frame opening and
  screen edge. Keep the dark backplate, exact screen size/UV/inset, original SDF,
  one physical screen, default SMAA and MSAA opt-in. The seat is solid housing,
  not a second glass or image layer. Verify finite geometry, ordering, ownership,
  unchanged image samples and actual DPR1/DPR2/mobile pictures. No recolored
  source image, default resolution change or weakened old backing test.
- F13 — `src/scene/studio.ts:77–83`, `contactShadow.ts:97–111`:
  upright tablet/card depths are only 8/3 mm; fitting blur to these depths makes
  a sharp sliver. Apply the phone's width-based minimum depth to tablet/card too,
  and a minimum soft blur for those two classes across all four scenes. Keep
  their scene opacity, world centre and the real captured device silhouette;
  wider top/lean footprints still use their actual bounds. Laptop and browser
  keep the original call and recipes. Retain 256² targets, two blur cycles,
  invalidation and restoration. Inspect front/hero/lean/top in every scene.
- F14 — `src/ui/panel.css:86–94,162–165`, `panel.ts:149–162`:
  the 172 px mobile export area intentionally preserves preview dimensions, but
  start-aligned controls leave unused space below them. Group export feedback in
  an independently scrolling area ABOVE the size/action row on mobile; anchor
  the primary row to the bottom with safe-area padding. Keep fixed footer size
  and all status/download/reload controls. Test actual export and failure paths
  without canvas resizing. Strengthen picker border and dark helper contrast,
  add 6 px desktop section spacing and use an inline vector theme icon. Native
  selects retain accessible OS interaction; no new dropdown library or schema.

Write set: build.ts/build.test.ts, studio.ts, scene/presets.ts and focused
shadow coverage, panel.ts/css, additive review-polish guard, capture script and
affected app thumbnails, this research and ticket. No fixtures, thresholds,
dependencies, workflows, camera poses, source PNGs or spec edits. Browser CLI is
unavailable in this environment; use the repository's existing Playwright path.
Serialize browser work and validate this correction with focused regressions,
typecheck/unit/build and the normal complete CI on its published head.

## F15 — retain contact density after widening a thin footprint

The first F13 80-view capture has continuous phone edges and rounded shadow ends,
but card front/hero shadows become too faint: a 3 mm caster occupies very few
rows of a capture widened to 165 mm. Blur conserves the small captured coverage.
Apply a bounded post-blur alpha gain only when tablet/card capture depth expands.
Use the fourth root of expanded/original depth, bounded to 1–3, so the wider
penumbra remains visible without saturating the contact. Clamp the final shadow
alpha to [0,1]. Keep preset opacity, 256² capture/blur and physical footprint
unchanged; gain=1 for existing phone, laptop/browser and unexpanded top views.
Do not stretch projection independently of its capture camera or add a fake
elliptical image. Cover continuity, finite alpha, unchanged other-device paths
and restoration using the existing output-alpha matrix plus focused unit checks.
Write set adds only contactShadow.ts/contactShadow.test.ts to F12–F14's list.

For F14 final layout, reserve a fixed 136 px mobile footer with explicit label
and action rows, feedback above them and safe-area padding. This reduces empty
space and enlarges the mobile preview while remaining the same height before,
during and after download/error feedback. Reuse unchanged PNG size invariants.

## F16 — remove idle space above mobile export controls

Owner feedback on head 34e6d32 asks to bring Ready-made looks closer to Export.
Clauses: §4.6/P-13 export feedback and stable preview, §4.9/P-14 mobile layout.
Surfaces: `src/ui/panel.css:174–186` reserves a 136 px footer whose flexible
first row is empty before export; `src/ui/panel.ts:153–173` already groups
live status, download and reload in `#png-feedback`. No missing spec contract.

Use a compact, fixed 92 px primary footer with only label/action rows. Keep
safe-area padding and bottom placement. Feedback should take no idle space:
when it has a message or action, display it in a bounded, scrolling surface
above the footer, outside layout flow so exporting cannot resize the canvas.
With settings closed, place that surface above the separate 60 px mobile
image/settings row, leaving both touch targets reachable. With settings open,
it may cover the bottom of the scrolling sheet; settings remain scrollable.
Preserve live-region semantics, DOM order, native controls and desktop layout.

Write set: panel.css, additive assertions/seeds in the existing mobile review
guard, this ticket/research. Reuse real download, recovery, small-viewport and
canvas-size guards; inspect a fresh DPR2 mobile image. Do not rerender unchanged
device matrices or alter 3D, PNG encoding, tests' old thresholds or fixtures.

## F17–F19 — independent review corrections

Source: review 5242520013 on exact head 97fcd37 / tree 30760ed, fetched
2026-09-18. Review URL: https://github.com/thohared/plinth/pull/29#pullrequestreview-5242520013.
Clauses: §4.6/P-13 stable export and recovery, §4.9/P-14(5) reachable
controls/focus, §2.7/§7 meaningful negative evidence. No specification gap.

- F17 — `src/ui/panel.css:#png-feedback` overlays the sheet, but `#panel`
  has no terminal scroll clearance. The reviewer reproduced a blocked final
  Keyboard shortcuts button after real export/download in both themes.
  Add terminal scroll space only while mobile feedback is populated, using
  the same upper bound as the overlay, plus matching scroll-padding so keyboard
  focus can reveal controls. A pseudo-element avoids growing panel padding/min
  size and preserves the existing canvas and 92 px footer. Bound open-sheet
  feedback to at most 20dvh/144 px, leaving at least half the 40dvh sheet
  available on short viewports; keep its independent scroll and live region.
  Idle/closed/desktop panel spacing is unchanged. Prove actual export/download,
  maximum sheet scroll, hit-test and real tap of its last control in both themes;
  retain all existing preview-dimension/error assertions.
- F18 — `src/ui/panel.ts:adjustFocus` tracks focus before a breakpoint hides
  its active element but excludes `mobilePick`. Include that owned button in
  the existing desktop handoff to `pick`. Preserve opener/close handling,
  remembered focus, recovery, listeners and disposal. Verify picker and settings
  opener through real focus + mobile-to-desktop resize, without assigning focus
  as a substitute for checking the result.
- F19 — `guards/png-access.test.ts` targets the old `root` insertion, but
  `createPanel` now inserts PNG actions after `mobileActions`. Extend only the
  mutation target to both supported receiver names with the exact PNG argument.
  Preserve every old assertion. Run the seeded mobile access case and require
  a behavioral failure after the app becomes ready, not a missing mutation.

Write set: panel.css/panel.ts, additive review-polish cases, the PNG-access seed
target, this research/ticket. First run new regressions against the unchanged
application; then fix and run affected browser checks/typecheck/build. Reuse
complete prior-head CI #133/PNG #17 as historical evidence only; final-head
normal CI/PG/PNG and fresh review remain required. Do not re-run unchanged
render matrices locally or bless the 20 known PG baseline differences.
