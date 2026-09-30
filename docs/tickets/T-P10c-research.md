# T-P10c research: performance diagnostics

Author: Codex (backend identifier not exposed), 2026-09-30.
Base: 2b54ce0aad8c344c5d4f112185f767df702330d0 (P-19 merged).
Shared knowledge: astra-runner 2df99332f5e4cd14d464146900969e91405193bd,
portal-standard Gate 5b. This research precedes implementation.

## 1. Clauses touched

§2.2–2.3: no runtime network/backend. §2.6–2.7: independent review and
committed research. §6/P-19(3–5): frozen workload, five runs, real samples,
honest metrics and outstanding physical-device evidence. §7: preserve PG.
§8/T-P10: measurement tooling and recorded evidence.

## 2. Existing surfaces

- src/main.ts:179 render calls studio.render only when armed and ready.
- src/main.ts:247 awaits studio.ready before exposing controls/readiness.
- src/scene/studio.ts:render includes dirty contact shadow and postprocessing;
  ready warms all four scene pipelines. Render is not a permanent animation loop.
- src/camera/controller.ts:tick schedules transitions; pointermove redraws
  immediately for Free view. An idle rAF is not an application render.
- src/ui/panel.ts:createPanel exposes native device/scene/pose selects and Free view.
- scripts/png-acceptance.mjs provides existing Playwright/Vite infrastructure,
  but its software-GPU mode is correctness evidence, not hardware performance.
- No five-run performance harness/report exists on this base. Neither PG's
  frozen scheduler nor the PNG export matrix implements P-19's live workload.

## 3. Findings

F1. Count actual studio.render calls, not idle requestAnimationFrame callbacks.
Keep refresh cadence separate; do not compare a 60 Hz interval directly against
the 8.3 ms desktop work budget. Preserve slow/incomplete samples.

F2. CPU wall duration around studio.render excludes settings/geometry updates
before the call, DOM layout, compositor and presentation. WebGL timer queries
measure GPU elapsed work asynchronously, not end-to-end frame latency. Do not
add CPU and GPU durations or label either the complete §6 frame-time metric.
This ticket can deliver diagnostics, not a release budget verdict; the complete
frame/presentation measurement and physical-device gate remain pending.

F3. EXT_disjoint_timer_query_webgl2 requires later availability polling and
GPU_DISJOINT_EXT checking. Unsupported, disjoint or unresolved samples are
missing evidence, never zero. No gl.finish, busy wait or forced render loop.
Source (read 2026-09-30):
https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/

F4. Long Animation Frames reports slow frames, not a distribution of every
frame. It cannot alone establish the required p50/p99. Avoid adopting it as a
replacement metric. Source (read 2026-09-30):
https://developer.chrome.com/docs/web-platform/long-animation-frames

F5. Freeze a desktop diagnostic trace before data collection. Use normal UI
controls and Playwright mouse input, normal startup/demo, no pg=1 or setter
hooks. Include warm-up, input timestamps/lateness, raw samples, viewport/DPR,
browser/GPU/host disclosure, five-run summaries, sample counts and CoV. A
short smoke mode must never masquerade as the 60-second workload. A mobile
trace requires actual target hardware and a separate frozen coordinate plan.

F6. Keep instrumentation in an isolated benchmark build produced by a Vite
transform; do not add timers/telemetry to production src, alter guards or add
dependencies/CI workflows. Record the source/build fingerprint and probe
overhead limits. Existing acceptance remains required; unavailable checks
stay pending. Cloud/software results cannot certify desktop or phone budgets.

TODO(spec): none for diagnostic tooling. A release verdict is out of scope
until the complete frame-time method is established and reviewed; F2 is an
explicit remaining measurement task, not permission to redefine §6.
