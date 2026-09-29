# T-P9l research — touch sliders inside the mobile settings sheet

Author: Codex (backend identifier not exposed). Linux, 2026-09-28.
Base: 6c4e8607f03ddbdd08d54ea098d8be1b58fd9d4a.
Shared knowledge consulted at astra-runner 2df99332f5e4cd14d464146900969e91405193bd:
handoff entry/index, SOURCE-POLICY and Three.js vault Entry 2 B (bottom sheet).

## 1. Clauses touched

§4.5 / P-13(5): native 0–25% output padding, with no pose/image changes.
§4.9 / P-10(2) / P-14(5): touch-safe, scrollable nonmodal settings sheet.
§2.2–2.3 and §7: no runtime network/backend; additive validation, no fixture edits.

## 2. Existing surfaces

- F1: src/ui/panel.css #panel explicitly permits pan-y; input[type=range]
  has a 44px touch target but no gesture reservation. A vertical component in
  a slider drag can therefore be claimed as native sheet scrolling. This is
  a static diagnosis consistent with the owner's report, pending browser proof.
- F2: src/ui/panel.ts numeric() uses native range inputs for outputPad, image
  pad and hinge. Keep native value validation, keyboard and input semantics.
- F3: guards/panel.test.ts tests perfectly horizontal touch sliding and ordinary
  vertical panel scrolling, but does not assert scroll stability during diagonal
  slider input. Extend coverage rather than weaken the old guard.
- F4: focusin scrollIntoView helps keyboard accessibility; do not remove it to
  mask gesture ownership. Position the regression control fully within the sheet
  before measuring a drag, so the oracle isolates scrolling during interaction.

## 3. Gaps / boundaries

No new product behavior outside the cited clauses. No normative amendment is
needed for reserving a native slider's touch gesture. Do not disable scrolling
on the whole panel or alter camera/PNG/state math. Owner reports all five devices
and downloads look OK, with this mobile-control exception; this is owner feedback,
not a new measured acceptance matrix. Owner separately cut animation work for
competition; this ticket adds no animation or video feature.

Local browser setup: pinned Chromium download failed to unzip; an alternate
Chromium 141 binary downloaded, but launch failed at process_singleton socket()
with Operation not permitted. No sandbox restriction was bypassed. Browser
acceptance must be obtained from the existing Linux PR CI; no local browser PASS.

## Follow-up research: settings refresh reveals stale focus (2026-09-28)

The owner reports the same behavior on the offered candidate. Head 1662df0c
CI 36471216739 also fails the unchanged 1px stability assertion: observed
movement 625px, 105 other guards pass. PG/PNG succeed; neither proves touch
behavior. The CSS-only diagnosis and previous browser limitation are incomplete.

- F5: src/main.ts:resize is called by the settings-store subscription for an
  outputPad input, even when the host viewport has not changed. It always calls
  scrollIntoView on the active panel element. A native touch range edit can
  leave document.activeElement on sheet-close. Thus a value edit scrolls back
  to the close button. In an isolated diagnostic on 1662df0c, scrollTop changes
  637 → 12 on the first horizontal-first move; the stack is numeric input →
  attempt → store.apply → emit → resize → sheet-close.scrollIntoView.
- F6: retain src/ui/panel.ts's focusin reveal and breakpoint focus restoration.
  The separate actual window/visualViewport resize event needs to reveal the
  focused field for keyboard/accessibility. Ordinary settings and workspace
  render updates must not reveal unrelated stale focus. Separate the event
  adapter from resize rather than removing focus accessibility or moving focus
  into the slider from a test.
- F7: the existing real-touch guard already exposes F5 and must stay intact.
  Add a served-main focus-scroll seed restoring the legacy reveal in resize,
  and cover a focused field remaining visible after a real viewport shrink.
  Keep the existing slider-scroll seed and its pan regression independently.

This extends the ticket's write set to src/main.ts's resize/event wiring and
additive panel guard coverage. The same §§4.5/4.9, P-13(5), P-14(5) authorize
the correction; TODO(spec): none. No renderer/camera math or layout dimensions
change. The shared-knowledge revision above remains the consulted revision.

Execution: the already-installed Chromium 141 Headless Shell launches through
the existing PLINTH_CHROMIUM_PATH override, without a new install or sandbox
changes. The unchanged candidate guard genuinely FAILS at panel.test.ts:173
(625 > 1), matching cloud Chromium. Diagnostic instrumentation was temporary,
not an acceptance test or a source change. Local results are Linux/SwiftShader
evidence, not physical-phone or Safari acceptance. Full Chromium's earlier
socket launch failure remains a distinct failed setup attempt.
