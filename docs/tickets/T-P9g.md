# T-P9g — Free view and generic device details

Codex builder, Linux, base cdcd80a. Owner authorized 2026-09-21.
Research F1–F9 committed first; P-16 is a standalone planning commit.
Cites §2.1–2.7, §4.2–4.4, §4.6, §4.8–4.9, §6–7,
P-8/P-9/P-11/P-13/P-14/P-15/P-16.

## Acceptance

1. Free view is an explicit touch/mouse tool, initially off; unconstrained model
   rotation can reveal back and underside, with stable camera up and floor.
   Preserve legacy orbit. Reset view returns to Three-quarter and exits mode;
   named angles/looks/Reset look exit too. Preserve image and other settings.
2. Continuous normalized quaternion math, finite rejection/no partial mutation,
   immediate reverse without overshoot, interrupt from the current displayed
   pose. Safe framing, export, resize and custom v1 links cover all orientations.
3. Phone/tablet have opaque backs, generic cameras, buttons, charging ports,
   microphone/speaker openings. Laptop has webcam, ports, ventilation, feet and
   its existing visible touchpad. No physical hardware on Browser/Card.
4. Parametric details, material/resource ownership, instanced repetition;
   geometry bounds and shadows include all details, including after spec edits.
   At most 30 added draws / 40k added submitted vertices per rig.
5. Preserve all source screenshot and PNG dimensions/filtering contracts,
   accepted camera fill, UI footer/defaults, no-network policy, old v1 links.
6. Add meaningful unit and real pointer browser guards, seeded failing probe,
   actual local high-resolution front/rear/underside and mobile images, round-trip
   and PNG evidence. Run npm run ci and build before publication. Report metrics
   and physical-device limitations. No baseline replacement or claimed self-review.

## Write set

src/devices/{build,details} and tests; src/camera/{poses,controller} and tests;
src/scene.ts and all-side tests; src/main.ts; src/ui/panel.ts and CSS;
additive guards/device-details.test.ts; additive scripts/device-details-capture.mjs
and pg-capture named captures; README and this ticket/research/evidence.
No dependency, workflow, source demo image, shader, export pipeline or fixture edits.
P-16 is already committed separately and is read-only during implementation.

## Review

One builder, one PR, independent fresh-session review. Existing PG differences
from added hardware must be inspected and owner-blessed separately if required.
Physical mobile/Safari and the full §6 performance gate remain release obligations.

## Implementation and measured resources

- Free view uses normalized camera-relative model rotation. The camera direction,
  legacy orbit and four named angles retain their contracts. Real mouse/touch,
  v1 reload, PNG dimensions and Reset view are covered by the additive browser
  guard. Re-selecting the current angle by keyboard also exits Free view.
- Phone/tablet: opaque rear shell, camera island/lenses/flash, side buttons,
  charging socket with contact, speaker/microphone apertures. Laptop: webcam,
  three side sockets, rear and underside ventilation, four feet, visible trackpad
  edge. Browser/Card keep their simple geometry.

| Device | Added draw calls | Added vertices | Total submitted vertices |
|---|---:|---:|---:|
| Phone | 14 | 13,779 | 50,805 |
| Tablet | 14 | 13,224 | 49,674 |
| Laptop | 16 | 33,870 | 530,616 |

- All are below P-16's 30-draw / 40k-vertex added budgets. Hardware uses owned
  materials and instancing/shared geometry. Geometry and instance GPU buffers are
  disposed on rebuild; actual mesh bounds include every protrusion.
- F10 fixes retained builder placement during a shape rebuild; its new floor
  assertion failed at -0.000075m before the fix. F11 adds exact production
  extrusion reuse (32 CPU templates / 8 MiB of attribute buffers) and deduplicates
  exact local support points. Direct authoring builds remain available. New tests
  compare cached production geometry byte-for-byte and prove buffer/disposal
  isolation; independent world-bound and smoothing checks are unchanged.
- F12 releases InstancedMesh buffers/listeners before context restoration, avoiding
  invalid old-context deletes when deferred navigation disposes the previous rig.
- No dependency/pin, workflow, fixture, screenshot texture/shader, output-size
  table or export implementation changed. P-16 was committed separately.

## Verification record — 2026-09-21

- Linux; Node 24.19.0, Chromium 153.0.8010.0 / SwiftShader. Node 22.23.2 was also
  used to diagnose an existing default-timeout problem. Chromium and browser CLI
  are workspace tooling, not app dependencies. agent-browser's daemon could not
  start, so existing Playwright infrastructure verified the live page and actual
  pixels. Captures reported no page errors.
- Initial new browser suite: 2 passed, 69.34s, covering desktop and actual CDP
  touch input. A served-source rotation-to-old-orbit mutation failed both new
  tests: stable camera direction on desktop and half-turn orientation on touch.
  Final negative run: 2 expected failures, 60.99s; no production file was mutated.
- Existing 100-endpoint test initially exceeded its unchanged 5s deadline on
  both main and this branch. CPU profiling isolated repeated extrusion creation.
  After F11, the focused suite passed: 73 tests / 4 files, 15.45s, including all
  100 endpoints, 1,500 transition samples, new all-side and buffer parity checks.
- Full acceptance exposed the unchanged state-share context-recovery regression.
  The isolated test failed before F12 (86.94s), while base main passed (49.80s).
  A diagnostic probe confirmed four old-context delete errors and failed recovery
  during deferred navigation. The same unchanged guard passed after F12:
  39.48s test / 52.92s run. No assertion or timeout was relaxed.
- Final build and pre-commit typecheck passed after F12. Vite's 700kB bundle
  warning remains visible (approximately 717kB minified JS).
- **Final full npm run ci result is unconfirmed.** The rerun started after F12,
  then the execution connection failed with exec-server transport disconnection
  and environment_offline before an exit result could be retrieved. The previous
  full run was stopped to apply F12. Neither is claimed as passing acceptance.
  This PR remains a draft until full acceptance on its head and independent review.
- Eight actual local images were produced: seven native 1600x1600 device renders
  and mobile controls at DPR 2. The F12 change only concerns lost-context resource
  release and does not change those images' geometry or normal rendering.
  scripts/device-details-capture.mjs reproduces them; the existing cloud PG job
  now includes all eight names while preserving every old case and threshold.
  Local images are evidence, not reference-GPU baseline candidates or an owner bless.
- Added hardware and trackpad edges can change existing PG pixels. Cloud CI/PG/PNG
  status, owner image acceptance and fresh-session review remain separate gates.
  Physical mobile/Safari and the full five-run §6 release performance gate remain
  outstanding; headless touch is not physical-device GPU evidence.
- Publication preserved all eight local code/research/spec commits with verified
  identical Git trees. This final commit records evidence only, following loss of
  the local execution environment. No merge or deployment is claimed.
