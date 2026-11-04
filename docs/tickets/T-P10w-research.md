# T-P10w research — one-click constrained view endpoints

Codex, 2026-11-04, Linux. Base: `9ac96e6645c87a3c4598bc44c8371b775e3f92e0`.
Owner clarified and confirmed: each Turn button selects the farthest permitted
view in its direction, without enabling Free view, rather than repeated 5° steps.

## Clauses
§2.5–2.7, §4.3/4.8/4.9, §7, P-5/P-23/P-25. P-25 presently explicitly requires
Free view and 5° device rotation, so a standalone amendment must precede runtime work.

## Surfaces and findings
- F1: `src/ui/panel.ts:177–200` gates buttons on Free view and maps directions
  to 5° deltas. `src/main.ts:306–312` repeats the gate and invokes stage.rotate.
- F2: `src/camera/poses.ts:8–10` defines ordinary orbit limits: azimuth ±75°,
  elevation 5–85°. `src/camera/controller.ts:83–85` uses these for ordinary drag.
  `src/scene.ts:562–573` changes camera direction, retaining device rotation;
  `rotate` instead introduces rotation-invariant framing. The requested path is
  ordinary constrained orbit, not arbitrary device rotation or screen translation.
- F3: An endpoint action can preserve the other orbit coordinate and current
  device rotation/image, using existing framing and URL custom-pose serialization.
  It must avoid creating history entries on an already-selected endpoint.
- F4: P-23 history/busy gates and P-25 native keyboard handling remain relevant.
  An endpoint action should leave Free view off, even if it was previously on;
  subsequent dragging then uses ordinary orbit. Reset view remains unchanged.
- F5: Existing P-25 behavioral tests intentionally assert the now-replaced
  contract. Replacement requires explicit specification authority, retaining
  keyboard, busy, history, copy/reload/PNG and all-device coverage. No baseline
  or unrelated guard relaxation is warranted.

## Gaps / deliverable
P-26 below resolves the owner-requested conflict with P-25. This planning PR
changes no runtime, tests, fixtures or dependencies. Implementation follows after
planning acceptance, with literal endpoint/other-axis/rotation expectations and
real desktop/mobile actions. No runtime PASS is implied by this document.
