# T-P9f — live-site phone/tablet feedback research

Author: Codex (backend model identifier not exposed). Linux, 2026-09-19.
Base: main `e436113bdbf124dcd3b01f29ef21cdd9e6f721df`, fetched before work.
PR #29 is merged; #25/#27/#28 are already covered. This is a new ticket.
Owner ended the collection round with “Gotovo, za sada”.

## Clauses and findings

- F1 — §4.5/§4.8–4.9, P-10(3)/P-13(5)/P-14: `src/settings.ts:37,91–93`
  fixes startup/reset to 4:5; `src/ui/compositions.ts:7–10` restores individual
  aspects and nonzero output padding. Final owner instruction supersedes both
  increasing device sizes and 1:1 everywhere: phone host 1:1, tablet host 4:5,
  desktop host 16:9; default outputPad=0. Capture the host default once, use it
  for ordinary startup/reset; preserve a chosen aspect on composition changes.
  Every look defaults to zero output padding. Valid shared settings override
  defaults; resizing/keyboard/orientation must not reset user settings. PG keeps
  its explicit dimensions and historical default settings, independent of host.
  P-15 device fill factors, geometry, poses and export dimension table stay fixed.
- F2 — §4.9/P-14(5): `src/ui/panel.ts:42,103–108` puts the only brand in
  hidden settings. Add a compact mobile workspace wordmark visible with settings
  closed; keep it outside the exported canvas and out of pointer interaction.
- F3 — §4.1/P-9: `src/screen/fit.ts:10–15` correctly letterboxes Contain
  for differing aspect ratios. `src/main.ts:219–222` mounts user uploads without
  choosing Fill screen, which leaves white top/bottom bands. Do not stretch pixels
  or change the shader's explicit Contain semantics. Fresh ordinary-editor uploads
  use Cover until the owner explicitly chooses image fitting or restores a link;
  explicit Fit image remains available to see the entire source. Explain this
  crop/fit distinction next to the control. Preserve padding/color choices,
  uploaded resources, image privacy, latest-request-wins and PG input semantics.
- F4 — §4.6/P-13, §4.9/P-14: `src/ui/panel.css:163–185` reserves 238px on
  desktop, insufficient for full status plus Download, and caps mobile feedback
  including its action as one scrolling surface. Separate scrolling status from
  fixed-size download/reload actions; put desktop feedback above a compact fixed
  action footer as on mobile. Settings must scroll clear of the overlay. Keep
  canvas geometry stable before/during/after success/failure and the export action
  reachable; verify actual download on phone and landscape tablet dimensions.
- F5 — §4.3/P-11(4): `src/scene.ts:529–539` hard clamps orbit at ±75° and
  5–85°; `src/camera/controller.ts:14,57` maps every 240px to one radian.
  This reproduces the invisible-stop sensation, particularly on a wide tablet.
  Keep the legal camera domain and exact QA orbit API. Ease only pointer deltas
  near each boundary, without momentum or accumulated excess drag; reverse drag
  must respond immediately. Read displayed angles when applying each input so an
  interrupted pose never snaps. No unlimited turntable or new shared-state fields.
- F6 — §4.2/§4.9/P-10(3): `src/ui/compositions.ts:9` Clean view is browser;
  replace it with tablet per owner. Keep Browser as an independently selectable
  device and keep old v1 browser links intact. Retain legacy clean-browser query
  as an alias for the renamed clean-tablet look, not as a fifth preset.
- F7 — §4.9/P-10(3): `scripts/composition-thumbnails.mjs:14–17` renders an
  aspect-fitted canvas inside a fixed 240x150 body then screenshots the body.
  The background strips are baked into assets; CSS object-fit alone cannot remove
  them. Render each thumbnail directly at 480x300, full frame in its scene color,
  and screenshot the canvas. No image generation, external assets or device crop.
- F8 — §2.7/§7: preserve all old guards, PG/PNG matrices, limits and baseline
  files. Add focused browser regressions for startup/resize/hash/looks, upload
  fitting, visible brand, complete Download and thumbnail border colors. Seed
  failures; inspect actual captures. Linux software renderer is not physical
  Safari or the outstanding §6 performance gate.

## Sources and scope

Inspected current repo, full spec, prior T-P9e research and owner screenshots.
MDN primary documentation checked 2026-09-19:
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer
and https://developer.mozilla.org/en-US/docs/Web/API/Screen/width . Pointer
capability is not device identity. Host classification is a default heuristic:
touch-capable hosts use the shorter screen side (<600 CSS px phone, otherwise
tablet), other hosts use initial viewport width (<600 phone layout, <900 tablet
layout, otherwise desktop). Manual aspect choice and links always win.

No normative gap: P-10 delegates composition/default interaction choices to the
ticket; P-9 already supports Cover/Contain; P-11 hard domain is retained. No spec
amendment, paid API, dependencies, network/storage, baseline or workflow edits.
Write set: this research/ticket, main/settings and their tests; ui panel,
compositions and a small defaults helper; pointer controller and focused unit
coverage; additive live-feedback browser guard; thumbnail generator/assets;
named evidence in existing PG capture and README as needed.


## F9 — regression assertions that encode the replaced defaults

The first focused browser run passed all eight new checks and sixteen existing
checks. Two old checks failed for identified expectation/setup reasons:
`guards/panel.test.ts:49` asserts the obsolete .8 mobile aspect; retain the .01
numeric tolerance but assert the owner's new literal 1:1. The same file's
reset/fit/thumbnail expectations now assert desktop 16:9, preserved Cover and
480px thumbnails, with no removed assertions. `guards/review-polish.test.ts:156`
compares URL before/after theme while the new upload Cover setting is still
within the existing 250ms URL debounce. Wait for that upload's hash before
measuring theme isolation, retaining exact equality of settings/image/hash.
No runtime debounce or threshold changes. Write set includes this setup-only
addition to the existing guard. Full acceptance must pass after these changes.

## F10 — explicit gutter setup and implicit demo fitting

The first complete guard matrix passed 100/101 checks. The remaining failure
was `guards/demo-edges.test.ts` sampling gutter x=-1 because desktop 16:9 now
fills the workspace width. Select 4:5 explicitly for its existing four exact
gutter-color assertions. Select Contain explicitly before its upload retention
scenario, keeping all resource/fit checks across five devices. This is a setup
change, not a new threshold or deleted check.

Inspection also found that internal demo framing in `setDevice()` counted as
an explicit fitting choice and disabled the new first-upload Fill default.
Preserve the automatic-upload preference across internal device changes; actual
Fit control changes and restored links still disable it. Extend the new upload
guard to cycle through all demo devices before uploading, then retain its
Cover, explicit Contain, composition and shared-link assertions. This is within
F3 and the settings write set; include demo-edges in the setup-only guard scope.
