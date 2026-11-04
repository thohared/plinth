# T-P10w — ordinary view endpoint buttons

Codex, Linux. Base 4fc57311ab46874c97a2e7e6987d8fe1e1a86fd9.
Research T-P10w F1–F5 precedes this ticket; merged P-26 governs implementation.
Scope: replace P-25 button behavior with ordinary constrained orbit endpoints.
Preserve keyboard/history/busy/export/privacy contracts and Free view dragging.
Write set: src/main.ts, src/ui/panel.ts, guards/free-view-steps.test.ts,
README.md, this ticket. No spec, baseline, workflow or dependency edits.
Acceptance: literal endpoints, preserved other coordinate/quaternion, all devices,
no-op history, mode exit, interrupted transition, real desktop/mobile actions,
keyboard/busy/PG/rejection/disposal, Copy/reload/PNG. Seeds: wrong endpoint,
retained Free-view gate, unintended device rotation and missing history.
Use Linux CI/build and normal cloud CI/PG/PNG, inspect captures and request
fresh independent review. P-26 explicitly authorizes replacing old 5°/mode-gate
assertions with endpoint assertions; preserve all unrelated coverage.
TODO(spec): none.

## Local validation
Typecheck PASS; 287 units in 39 files PASS; production build PASS (existing
bundle warning). Browser suite could not launch: previous temporary Chromium
is absent, and official installer returned invalid empty ZIP archives. No
browser assertions, negative probes or full local CI PASS are claimed.
The replacement browser suite retains desktop/mobile PNG comparison, keyboard,
history, upload/recovery/export/PG/disposal/rejection and all-device cases.
Old 5° quaternion expectations become literal orbit endpoint expectations,
with independent checks that device quaternion remains unchanged. Seed modes
axis/gate/rotation/history/leak require execution evidence before acceptance.
Normal cloud checks and independent review remain pending after publication.

## Review fixups and recovered local browser evidence

Independent review 5776350388 found a zero-delta transition cancellation gap
and vacuous native-repeat/disposal checks after changing to endpoint semantics.
The paused-clock regression fails on the old code when the transition moves
away from the selected endpoint, then passes after freezing the actual custom
snapshot. The freeze adds no history entry; steady endpoint clicks remain no-op.
Native callback counters now detect duplicate calls, the double seed is restored,
and disposal dispatches the opposite endpoint rather than the current limit.

A temporary @sparticuz/chromium 143.0.0 archive supplied Chromium 143.0.7499.0
and software rendering outside the repository; no dependency/lockfile changed.
The first six browser cases passed (105.18s); after review fixups all seven pass
(116.20s), including desktop/mobile real PNG byte equality, upload/history,
keyboard, busy/PG/recovery/rejection/disposal and five-device literal endpoints.
Typecheck, 287 units and build pass again. Desktop/mobile captures inspected.
All six focused seeds exit 1 at assertions: axis wrong sign, gate disabled,
rotation wrong direction, history unavailable Undo, leak wrong slider value,
double callback count 2 instead of 1. They are not browser/setup failures.
These Chromium143 focused results supplement, not replace, normal pinned-browser
cloud CI/PG/PNG and final independent review. Full local CI is not claimed.
