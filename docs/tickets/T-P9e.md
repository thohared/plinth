# T-P9e — finish reference views and the mobile studio panel

Owner authorization: complete all supplied image comments and improve UI, 2026-09-17.
Research: T-P9e-research F1–F7, committed first. Base PR #28 0914fa5.
Clauses: §2–§4.6, §4.8–§4.9, §7, P-6/P-7/P-9/P-10/P-13/P-14.

## Deliverable

One stacked PR: preserve accepted 3D references, remove demo white bands without
cropping content, show the full browser screenshot, improve oblique text sampling,
correct confirmed edge defects, and ground upright phone shadows consistently.
Modernize the existing 320 px panel/nonmodal mobile sheet with a short header,
deep green export action, segmented thumbnail looks, accessible control styling,
mobile image shortcut and ephemeral light/dark panel presentation.

Use the exact research write set. Preserve original image assets, camera contract,
settings schema, uploaded-image Fit/padding, accepted shadow recipes on other
devices, all existing guard assertions and fixture files. No new dependencies,
framework, lighting scene, storage, backend, off-origin runtime request or workflow.

## Acceptance

- Complete landscape source remains visible at its original aspect on every
  default wide device. Demo extension must stop when image padding/custom padding
  color is requested or a user image is mounted. Explicit shared Fit is retained.
- Examine each device × scene plus pose references; inspect native PNGs and edge
  close-ups. Keep no-op paths visually stable; record exact render changes honestly.
- Exercise actual controls on desktop and phone/tablet: image pick, looks, theme,
  settings open/close/focus, scrolling, recovery gates and PNG download. Theme must
  leave render state untouched. Keep minimum 44 px primary touch targets.
- Focused negative regressions before/after for fitting and UI behavior; existing
  guards stay additive. Full Linux npm run ci and build before push. Preserve exact
  PG/PNG matrix/thresholds; cloud evidence belongs to published head/tree.
- Refresh composition thumbnails from app output. Deliver a small image selection
  with links in chat; full CI artifact remains available. Independent fresh-session
  review and owner fixture bless remain required. No merge or baseline write.

## Evidence

Implementation/validation results will be appended after execution; this is not a
claim that tests, visual review, baseline acceptance or deployment have passed.

### Implemented changes

- F1/F2: all demo devices default to Contain. The owned wide demo continues
  boundary colors into otherwise unused space only at zero image padding and
  white/default pad color. Uploads, custom padding and explicit Cover keep their
  original semantics. The source PNG files remain byte-identical. Texture creation
  and GPU recovery both request 8× anisotropy, clamped by Three/GPU capability.
- F3/F8: denser rounded outlines/bevels and a browser titlebar clipped to the
  actual rounded opening, including larger user-edited corner radii. Screen stays
  one opaque physical material with SDF cutout and the existing AA pipeline.
- F4: phone's shadow capture has a minimum depth footprint. Lean/top already
  exceed it; the tests check they remain unchanged. Other devices retain their
  shadow fitting and scene recipes.
- F5/F6: compact Plinth header, deep green Export, quieter controls, four joined
  thumbnail buttons, improved focus/disabled/reduced-motion states, and an
  in-memory panel theme toggle. Native selects and every advanced field remain.
  Mobile has a real image-picker shortcut next to Settings. Export stays outside
  the scrolling sheet in a bounded area with stable dimensions during export.
  Share/help follow Advanced and Reset.
- F7: added demo-padding/upload isolation and actual mobile pick/theme/compose/
  PNG-download/recovery guards; rounded-titlebar, sampling-recovery and shadow
  unit checks. Browser default fixtures change Cover→Contain without dropping
  their actions or assertions. Capture script covers 80 device/scene/pose views,
  five native 2× downloads and desktop/phone/tablet UI. Four app thumbnails refreshed.

### Validation notes (in progress)

- Pre-change reference captures came from a detached 0914fa5 checkout. No fixture
  was modified. Linux Node 24.19.0, Chromium 153.0.8010.12 / SwiftShader.
- Typecheck and 197 pre-existing units passed before adding three new units;
  the 39 focused geometry/demo/shadow units then passed including the new cases.
- First new browser run passed the demo margin/upload test. Its mobile test
  asserted selected composition before the pose transition settled; the guard
  now waits for its observable aria-pressed state before asserting.
- Concurrent local capture/guard workloads produced a screenshot-stability
  timeout. That run and interrupted seed runs are not acceptance evidence.
  Subsequent GPU workloads are serialized, without changing thresholds/timeouts.
- agent-browser could not start its daemon in this execution surface. The
  repository's existing Playwright path loaded the app and recorded zero page
  errors/no Vite overlay during actual desktop/mobile interaction. This is not
  physical Safari or phone GPU proof.
- Serial negative runs behave as intended: disabling the demo border extension
  fails on a white value 255 instead of dark-sidebar <80; disabling the mobile
  picker delegation fails waiting for its actual filechooser. Both isolated
  seeds exit 1. No seeded code is left in the source tree.
- Actual capture succeeded: 80 views, five real 2× PNG downloads, zero page errors.
  Native phone is 2160×2700, four wide devices 3840×2160. Visual inspection found
  a brief low-contrast theme transition; surface color now changes immediately,
  while border/focus transitions remain. UI screenshots were refreshed separately.
- The first full CI candidate was stopped after two existing PNG tests failed.
  An unchanged focused rerun reproduced both canvas-size changes. F9 records the
  cause: a content-sized export footer grew when status/download appeared. The
  late CSS override was removed, keeping stable reserved export space. Existing
  PNG assertions and timeouts are unchanged; fresh CI/build evidence follows.
- F9's two unchanged focused PNG guards now pass (26.16 s), including DPR3 mobile
  download and all five injected export failure phases. UI captures refreshed.
- The subsequent complete run lost its execution session during a session
  interruption before emitting a result. It is not counted as passed. The source
  commits and delivered files remained intact; a fresh full run is required.
- Completed full run: 87/89 guards passed in 1301.58 s. F10 diagnoses the two
  failures: the preserved source contract for non-phone shadow fitting and a
  2.0000000000000284 versus 2 composite-oracle cancellation error. The actual
  non-phone call is restored; the oracle uses algebraically identical exact
  integer-numerator arithmetic. Every case and threshold is retained. No rendered
  pixels change in this correction. Fresh focused/seed/full evidence follows.
- F10 focused positive: 3/3 selected guards pass in 25.64 s. Original-SMAA seed
  still fails on 13,665 invalid premultiplied channels versus required zero
  (33.73 s, exit 1). The corrected composite expression leaves all thresholds
  and every one of the 40 tablet scene/tone/aspect cases intact.
- F11: the subsequent full rerun hit the 120 s laptop pipeline limit and was
  interrupted. Isolated unchanged laptop passed in 103.53 s; units then passed
  199/200, with the existing 1,500-transition test exceeding 20 s. Measurement
  identified 1,203,948 submitted laptop vertices versus accepted 463,644, mostly
  from applying frame detail to 70 repeated keycaps. Keycaps now retain accepted
  3/16 detail; exterior body/frame keeps 6/24. Result: 494,988 vertices. The new
  <600,000 budget fails the dense candidate at 1,203,948 and passes the fix.
- After F11: TypeScript PASS, all 201 units PASS (17.40 s), production build PASS
  (707.20 kB JS, existing >700 kB warning). Unchanged laptop alpha pipeline PASS
  (31.86 s total; 30.767 s test, all 40 cases, zero GL errors). No timeout changed.
  These are Linux/SwiftShader timings, not a mobile GPU benchmark.
- Local full-suite attempts and focused closures are disclosed above; they are
  not represented as a complete green run on the final code. Publish a reviewable
  draft with this evidence and use the normal exact-head GitHub CI/PG/PNG runs
  for complete acceptance. No guard is skipped or narrowed in those workflows.
- Final F11 capture refresh: all 16 laptop scene/pose views, its actual native
  2× download, the dark-laptop thumbnail, the combined overview and three UI
  screenshots were refreshed; zero page errors. The other 64 reviewed views
  retain their rendering code. The delivered ZIP still contains exactly nine
  selected images, separate from the complete CI evidence matrix.
- UI capture fast-forwards finite CSS transitions so evidence records the final
  theme border colors, rather than a transient light border during dark-mode
  switching. Product transitions are retained.

### Owner follow-up scope (F12–F14)

The owner accepts the UI direction but requests lower mobile Export controls,
continuous phone frame/screen edges, and soft tablet/card shadows without pointed
ends in every scene. Implement F12–F14 in the same PR after this research commit.
Add a real housing seat behind the unchanged SDF screen, widen only the specified
thin-device shadow footprints, and bottom-align mobile primary export controls
with feedback above them. Keep stable canvas dimensions, accessible recovery and
download flows, the original source images, camera poses and all existing tests.
Refresh affected references and thumbnails; provide a small native image package.
The old tablet/card shadow preservation requirement is superseded by this request.

### Owner correction implementation and evidence (F12–F15)

- F12: a rounded, hollow housing seat overlaps the screen perimeter below the
  unchanged image plane. It borrows the frame material; the dark backing keeps
  its original material, lifecycle and tests. No image/SDF/UV/camera change.
  All five geometry regressions ray-test inner/outer edge and corner coverage,
  an uncovered centre, material ownership and screen/backing depth order. An
  isolated missing-seat mutation fails all five; the restored six seat/density
  checks pass in 1.12 s. No violation remains in the source tree.
- F13/F15: tablet/card use a wider blur footprint and a minimum soft blur in all
  scenes. Bounded 1–3 alpha-density compensation keeps very thin contacts visible;
  the output clamps alpha to [0,1]. Capture/projection share the same footprint.
  Existing phone fitting retains its two-argument call and gain=1; laptop/browser
  retain the one-argument call. Unexpanded top views keep density=1.
- F14/F15: fixed 136 px mobile footer puts size/Export at the viewport bottom,
  with scrollable feedback above and image/settings controls above the footer.
  Empty space is reduced, enlarging the preview. Added picker contrast, dark
  helper contrast, 6 px desktop section spacing and a vector theme icon. Native
  selects and all previous keyboard/recovery/download interactions remain.
- Final TypeScript PASS, 207/207 units PASS (15.95 s), build PASS (708.37 kB JS;
  existing >700 kB warning). The initial unit attempt hit the unchanged 5 s
  endpoint budget at 5.871 s; a later unchanged full run passed. F15 initially
  passed an unnecessary false argument to phone fitting, which the existing spy
  rejected; the actual two-argument call was restored. No old assertions or
  timing budgets were changed.
- F12/F13 focused browser set: 11 selected tests PASS in 238.78 s, including all
  200 device/scene/tone/aspect alpha cases, full image/SDF checks and real desktop/
  mobile downloads. F15 final affected set: 6 selected tests PASS in 111.28 s,
  including tablet/card's 80 alpha cases, mobile bottom placement, both real UI
  downloads and five export failure phases with unchanged preview dimensions.
  Other tests were outside these explicit local selections, not skipped in code
  or removed from the full CI workflow.
- The isolated `PLINTH_POLISH_SEED=footer` violation fails on a 59.61 px bottom
  gap versus the existing new <=16 px requirement (12.70 s). The unseeded final
  mobile interaction test above passes. The seed changes only its test page.
- Captures: 80 device/scene/pose views and five actual native 2× downloads;
  after the density refinement, 32 tablet/card views and their downloads were
  refreshed. Both capture reports record zero page errors. Product UI captures
  now use an actual DPR2 viewport (desktop 2560×1600; phone 800×1600); deterministic
  PG stays 1280×800/DPR1. Four real app thumbnails were regenerated. The delivered
  ZIP contains nine selected images.
- Prior published head 1979bde: complete CI 35271496342 and PNG 35271496362 PASS;
  PG 35271496337 completed captures with 20 baseline pixel differences. Those
  results do not certify this new head. Its normal complete CI/PG/PNG and fresh
  independent review remain required. No fixture bless, merge or deploy.

### Additional mobile spacing correction (F16)

Owner requests less idle space between Ready-made looks and Export PNG.
Follow F16: compact stable footer, conditional feedback above it, safe-area and
reachable mobile actions. Extend existing mobile coverage for the top gap and
preserve actual download/recovery/canvas-size assertions. Refresh the mobile
image only; all 3D device rendering remains unchanged. Same PR and review gate.

- Implemented: 92 px footer at ordinary safe-area values (44 px less than F15),
  increasing with a larger bottom safe area. Empty live feedback occupies zero
  height; populated feedback floats above the primary actions, and above the
  separate picker/settings row when the sheet is closed. No preview resize.
- PASS: seven focused browser checks in 114.70 s: mobile picker/theme/looks,
  visible PNG access at 400/1280 px, 400 px short viewport, scale/recovery access,
  real desktop/mobile PNG download, and all five existing export failure phases.
  Existing canvas-dimension assertions and touch-target bounds are unchanged.
  TypeScript and production build PASS (existing 708.37 kB bundle warning).
- Negative spacing seed restores the old reserved row and fails at 58.61 px
  above the label versus <=16 (16.50 s). The prior footer-position seed still
  fails at 59.61 px below Export versus <=16 (12.98 s). Seeds only affect isolated
  test pages; production files are not mutated. Initial browser invocation used
  a missing /tmp executable and launched no tests; the pinned installed browser
  was then used successfully without changing any test timeout or threshold.
- Inspected actual DPR2 mobile idle light/dark and completed-export views with
  settings open/closed. Zero page errors; a hit-test confirms feedback does not
  cover the closed-sheet image picker. Updated only the mobile deliverable and
  the same nine-image ZIP. Other device images and renderer code are unchanged.
- Prior head 34e6d32 complete CI 35281590833 PASS; its PG 35281590874 failed and
  PNG 35281590967 was still running when inspected. These are not new-head
  acceptance. Continue normal exact-head CI/PG/PNG and independent review;
  no duplicate workflow dispatch, baseline bless, merge or deployment.

### Independent review fixups (F17–F19)

Review 5242520013 on 97fcd37 identifies blocked final sheet controls after
download, lost mobile-picker focus on desktop resize, and a stale PNG-access
negative mutation target. Correct these three findings in the same PR using
F17–F19. Preserve compact idle spacing, stable canvas/export dimensions and
all existing assertions. New regressions must reproduce the actual first two
failures before implementation; the repaired seed must fail on UI behavior.
Prior exact-head CI #133 and PNG #17 passed; PG #120 captured all 60 images and
failed only 20 baseline comparisons. Owner baseline/dependency acceptance is
separate from the code fixups; no merge or reference writes are authorized here.

- F17: a conditional terminal scroll spacer and scroll-padding allow the full
  last settings control to clear export feedback. They use the overlay's bound
  and account for the existing 20 px bottom padding. Open-sheet feedback is
  capped at 20dvh/144 px, preserving room for a full touch control on short
  viewports. Idle spacing, fixed footer and preview dimensions remain intact.
- F18: the existing breakpoint focus handoff now includes `mobilePick`; the
  original opener/close paths and listener lifecycle remain unchanged.
- F19: the old mutation matches either the original `root` or current
  `mobileActions` receiver for the same PNG insertion. No assertion was removed
  or weakened. Its repaired isolated seed reaches ready state and fails because
  Export has no visible bounds (11.40 s), not because the mutation failed.
- Before application fixes, all three new browser regressions fail (41.51 s):
  both themes have last-control bottom 667.53 behind feedback top 618, and the
  mobile picker ends with BODY focused. After the fix, all three pass (38.60 s):
  real export/download, maximum-scroll hit-test and tap, full 44 px target at
  400×800 and 400×400/DPR2, keyboard focus reveal, stable canvas, and both
  mobile shortcuts transferring focus to the visible desktop picker.
- Initial affected set: 9/11 PASS (147.20 s), including the existing PNG size,
  failure/recovery, picker and mobile panel flows. The two new tests exposed
  double-counted terminal padding on the short viewport (top 143.53 <148).
  The spacer now accounts for that padding; the final three-test pass above
  closes both failures without changing assertions. The focus-reveal test first
  moves focus to another control before returning to help; it does not expect
  a second focus event on an already focused element. Original tests and all
  timeouts/thresholds remain unchanged.
- Final TypeScript PASS, 207/207 units PASS (15.67 s), production build PASS
  (708.37 kB; existing bundle warning). Only the three new affected regressions
  were rerun after the terminal-padding adjustment; prior nine focused passes
  are identified above rather than presented as a fresh complete final suite.
  Full normal CI/PG/PNG on the published head and a new independent review remain
  acceptance gates. No manual workflow dispatch, baseline write, merge or deploy.
