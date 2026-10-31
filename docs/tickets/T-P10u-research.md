# T-P10u: Free view without dragging

Codex, 2026-10-31. Research base: 9eab26333c1a90a607c38bf784dda1ae834d88fd.
Planning only; fourth owner-requested improvement. Crop implementation is separate.

## 1. Clauses touched

§2.2–2.7, §4.3, §4.6, §4.8–4.9, §7; P-11, P-14–P-16,
P-18, P-19, P-21–P-24.

## 2. Existing surfaces and findings

- F1: src/camera/poses.ts:125 rotateInView already composes normalized
  camera-relative quaternion rotations. src/scene.ts:573 rotate validates
  framing before committing, interrupts the displayed transition, and enables
  rotation-invariant framing. Reuse it for discrete input, without new math.
- F2: src/camera/controller.ts:81 maps positive screen dx/dy to positive
  horizontal/vertical radians. Four buttons can use the same signs with fixed
  angular deltas. Current specification describes pointer input only.
- F3: src/ui/panel.ts:168 provides Free view and Reset view, but no alternative
  to dragging. Its setFree preserves transient mode and updates the hint.
  New labeled native buttons belong beside these controls on desktop/mobile.
- F4: src/ui/shortcuts.ts:7 ignores repeats, editable paths, modifiers and IME.
  Global arrow shortcuts would interfere with scrolling/form controls. A local
  handler on the rotation-button group can preserve those interactions.
- F5: src/main.ts:287 history and :452 pointer edit hooks capture the actual
  view and group gestures. Each button/key activation should be one completed
  edit, with no repeat timer; end an existing gesture first. Undo exits Free
  view already. src/main.ts:358 observes rotation; existing URL coalescing,
  copy snapshots, recovery and PNG can preserve the same custom view.
- F6: P-16/P-18 do not yet authorize discrete Free view input, its angular
  step, focus scope or keyboard semantics. P-23 supplies history but not this
  input contract. P-25 must settle these before implementation. No new state
  schema, dependency, network, storage, camera zoom or baseline change is needed.

## 3. Gaps and next deliverable

TODO(spec): F2/F4/F6 require P-25. Prepare a specification-only commit after
this research commit. Later implementation needs its own ticket, literal axis
expectations, focus/native-control and busy-state tests, Undo/Redo and actual
mobile/desktop click/key→copy/reload→PNG evidence. Current planning is neither
implementation nor a runtime PASS. Existing tests and thresholds remain intact.
