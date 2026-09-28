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

- A real CDP touch starts on output padding, drifts vertically then adjusts
  horizontally: scrollTop stays within 1px on every move, padding changes,
  pose/upload survive, sheet and export button rectangles are unchanged.
- ArrowRight keeps the native 1% increment; a new swipe outside controls still
  scrolls. Existing panel/resize/focus/input/export guards remain unchanged.
- PLINTH_PANEL_SEED=slider-scroll restores native pan eligibility on the range
  and must fail the new stability assertion (run in the fresh review).
- npm run ci and build; use existing Linux PR CI where this session's browser
  cannot launch. Typecheck/unit/build can run locally. No physical Android or
  Safari PASS is claimed; owner confirms the phone behavior after deployment.
- Independent review is separate. No automatic merge or fixture blessing.

## Fresh review prompt

Review this PR against §§4.5/4.9, P-13(5), P-14(5) and T-P9l research F1–F4.
Confirm head. Check native diagonal range gestures, normal sheet scrolling,
keyboard editing and preserved layout/state. Run the focused guard with
PLINTH_PANEL_SEED=slider-scroll to prove it rejects the old behavior; use the
existing full Linux CI rather than dispatching duplicate workflows. Report
MERGE/FIXUP with file:line evidence as a GitHub review (COMMENT if same-author
approval is blocked). No edits, merge, deploy or baseline changes.
