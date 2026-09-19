# T-P9d research — owner feedback on demo fill and screen edges

Base: PR #27 edfe4ea. Owner requests portrait demo on phone, the previously
approved landscape demo on tablet/laptop/card, cleaner less broken dark rims,
neutral card/clean-white and matching desktop side gutters. Baseline bless is
withheld. Clauses: §2, §4.1/P-9, §4.4/P-6/P-7, §4.6/P-13, §4.8/P-14, §7.

- F1: public/demo.png is portrait 845x1862. The exact earlier landscape image
  is public/demo.png at bdebd02 (2880x1800). Restore those bytes under a second
  name; keep portrait unchanged. Browser is also a wide device. Stage currently
  owns one image in src/scene.ts; a synchronous two-demo bank must select by ID,
  cover direct device changes and prepareSettings/hydration, release all handles
  once, and retire both demos after user upload. Failed/pending upload retains
  existing loader semantics; no async demo request can overwrite a user image.
- F2: landscape image ratio differs slightly from wide-device openings. Use
  visible Fit=cover for wide DEMO startup/device/preset choices, phone contain.
  Preserve user-image fit and ownership across device/reset/composition changes,
  and preserve explicit fit in shared-state hydration. No per-upload resizing
  of device or automatic replacement of user images. Existing contain tests for
  user images remain; compositionSettings stays the normative contain template.
- F3: src/screen/material.ts alphaHash creates stochastic subpixel SDF coverage,
  visible as broken dark/silver dots against screenBacking. Evaluate deterministic
  alphaTest at 0.5 after the same derivative-based coverage, using existing SMAA
  (MSAA still opt-in). Keep opaque one-MeshPhysicalMaterial, discard outside SDF,
  tone/glare/alpha limits, depth and screen geometry. Do not weaken existing tests.
- F4: src/ui/panel.css forces a green-grey body while the canvas has its selected
  background. Extend matching preset/solid background into the desktop workspace
  gutters. Remove only the canvas outer CSS shadow, which makes a darker seam. Keep
  panel/export layout and transparent checkerboard unchanged.
- F5: saved actual card-clean-white PNG is neutral. Red in a *-diff.png is the
  pixelmatch diagnostic, not the render (scripts/pg-capture.mjs). Inspect actual
  source render before changing neutral lighting. Contact sheets downsample
  images; native PNG exports must accompany the next preview, without enlarging
  screenshots or changing fixed DPR1 acceptance captures.

Write set: src/main.ts, src/scene.ts, src/settings.ts, src/screen/material.ts;
src/ui/panel.css;
src/screen/demo.ts and tests; existing screen lifecycle/material tests;
additive guards/demo-edges.test.ts; public/demo-landscape.png;
public/compositions/*.png; scripts/demo-edges-capture.mjs; this research/ticket.
No spec, fixtures, old guard assertions, dependency or workflow edits.

## F6 — first-frame guard fixture migration (full-CI finding)

The existing guards/pg-mode.test.ts first-ready probe still expects the portrait
845x1862/contain demo on a tablet and searches src/main.ts for the former
single-image mount call. That expectation conflicts with the owner's explicit
wide-device demo request (F1/F2), rather than a broken first-frame render.
Extend the same probe to phone AND tablet, assert each exact committed image
size/fit, and adapt the mount-order check to setDemoImages. Keep shader warm-up,
first rendered content, dimensions, readiness and ordering assertions intact.
This explicitly expands the write set to this guard fixture; no tolerance,
assertion coverage, test timeout or baseline may be weakened.

## F7 — owner requests uncropped tablet/laptop/card demos

After reviewing PR #28, the owner accepts the polish but reports missing left
and right image content on tablet, card and laptop. Their openings are narrower
than the 2880x1800 landscape image; demoFit's Cover setting necessarily crops
the horizontal extent. Use Contain for those three demo devices, retaining the
complete image and its aspect ratio with small top/bottom margins. Phone keeps
Contain and browser keeps Cover. Do not resize devices, stretch the image,
alter the source asset, or override an explicit user/shared-link Fit choice.
Update exact default-Fit fixtures without removing their actions/assertions;
verify the fitted image lies within each real screen rectangle, preserve both
explicit shared Fit values, and inspect actual exports. Refresh composition
thumbnails and the existing capture script's Fit assertion. This supersedes
F2's Cover choice only for the three devices named in the new owner feedback.

## F8 — fresh review: transparent PG workspace regression

Review of 01a9372 (PR #28 review 5218869833) found that src/main.ts:resize
sets an opaque workspace background in pure PG mode. scripts/pg-capture.mjs
clears body/html for its transparent screenshot but the new ancestor remains
opaque; the actual CI clear corner is [233,235,238,255]. P-13(3–4), §7 and
F4 require preserving transparent capture while matching editor gutters.
Restrict workspace decoration to ui mode, keeping the existing editor
checkerboard and all capture assertions/thresholds. Add a browser regression
using the unchanged capture preparation and inspect actual screenshot RGBA.
No capture-script or renderer/export changes are needed.

## F9 — fresh review: active demo downscale notice

P-9(2)/§4.1.1 require a visible note naming the applied cap. main.ts:boot
checks only the initial image; scene.ts:setDevice/prepareSettings later choose
the cached landscape image without updating that note. At a simulated GPU
MAX_TEXTURE_SIZE=2048 the portrait fits, but the landscape is 2048x1280 and
needs a notice. Derive a separate demo-notice value from the active image on
settings/image changes and initial hydration, and compose it with the existing
input/recovery notice. Do not overwrite input errors or user-image resize
messages; clear only the demo component when an unscaled/user image is active.
Use real Device controls with a browser-only lower-cap simulation, test return
to phone, composition/hydration, failed input followed by device change, and
successful user upload. This is a simulated supported cap, not physical GPU proof.

F8/F9 write set: src/main.ts, additive guards/demo-edges.test.ts, this research
and ticket. No spec gap: existing contracts cover both findings. No fixtures,
workflow/dependency edits, threshold changes, baseline bless or merge. The
review's third finding (owner bless and stacked dependencies) remains open.
