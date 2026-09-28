# T-P9l — keep mobile settings steady while dragging a slider

Author/builder: Codex (backend identifier not exposed), Linux, 2026-09-28.
Research: T-P9l-research.md F1–F4. Cites §4.5, §4.9, P-13(5), P-14(5), §2 and §7.

User reported all five devices/downloads appear OK, except the settings menu
moves down while adjusting Space around device on the phone.

## Write set and behavior

Only src/ui/panel.css, additive guards/panel.test.ts coverage and this ticket/
research. Reserve native range-input touch gestures with touch-action:none.
Keep pan-y on the settings container, native keyboard editing, all control
values, camera, PNG, upload and layout geometry unchanged. No spec/fixture,
dependency, workflow, animation or video work.

## Acceptance

- Real CDP touches start on output padding: first vertical-first, then a fresh
  horizontal-first diagonal drag. scrollTop stays within 1px on every move;
  the horizontal-first drag changes padding,
  pose/upload survive, sheet and export button rectangles are unchanged.
- ArrowRight keeps the native 1% increment; a new swipe outside controls still
  scrolls. Existing panel/resize/focus/input/export guards remain unchanged.
- PLINTH_PANEL_SEED=slider-scroll restores native pan eligibility on the range
  and must fail the new stability assertion (run in the fresh review).
- npm run ci and build; use existing Linux PR CI where this session's browser
  cannot launch. Typecheck/unit/build can run locally. No physical Android or
  Safari PASS is claimed; owner confirms the phone behavior after deployment.
- Independent review is separate. No automatic merge or fixture blessing.

## CI follow-up (2026-09-28)

Head 6fb19081daaebe0b892e66c1dbca5bc56b787c3c: CI run 36464900764
passed 105 guards and failed the new guard's padding-change assertion (0 > 0).
The vertical-first gesture passed every 1px scroll-stability assertion. PG and
PNG capture workflows succeeded on that head.

Chromium's native SliderContainerElement locks the gesture direction on its
first move; a horizontal range ignores a vertical-first gesture's later moves.
Source inspected: https://chromium.googlesource.com/chromium/src/+/1c2c691d179d9cc4cb80a819759992cb1eec176b/third_party/blink/renderer/core/html/forms/slider_thumb_element.cc
(HandleTouchEvent, GetDirection, CanSlide). This explains the observed failure;
touch-action prevents panel panning but does not replace native range semantics.

Keep the entire original vertical-first gesture and all its stability checks;
add a separate horizontal-first diagonal gesture before the existing value,
state and layout assertions. Both gestures enforce the same 1px limit. The
production fix stays CSS-only. This corrects an invalid combined gesture
expectation without dropping the regression that should reject the old behavior.
Fresh-head cloud acceptance and independent seeded review remain required.

## Fresh review prompt

Review this PR against §§4.5/4.9, P-13(5), P-14(5) and T-P9l research F1–F4.
Confirm head. Check native diagonal range gestures, normal sheet scrolling,
keyboard editing and preserved layout/state. Run the focused guard with
PLINTH_PANEL_SEED=slider-scroll to prove it rejects the old behavior; use the
existing full Linux CI rather than dispatching duplicate workflows. Report
MERGE/FIXUP with file:line evidence as a GitHub review (COMMENT if same-author
approval is blocked). No edits, merge, deploy or baseline changes.
