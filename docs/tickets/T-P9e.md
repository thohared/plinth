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
