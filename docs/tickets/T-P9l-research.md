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
