# T-P10u: Free view step controls

Implementer: Codex (GPT-6), 2026-10-31. Base: 459a0ac8aa607cc4d7e587f6e78d75a9856736b4.
Owner approved P-25 and implementation; planning PR #61 is merged.
Research: T-P10u-research F1–F6, committed before this ticket. F6 is resolved by P-25.

## Scope and contract

Implement P-25(1–6), preserving §2, §4.3/4.6/4.8/4.9, §7,
P-11/P-14–P-16/P-18/P-19/P-21–P-24. Reuse Stage.rotate (F1/F2),
add labeled native controls beside Free view (F3), local keyboard handling
(F4), and one history transaction per activation with busy gates (F5).
No crop implementation or new serialized fields.

Write set: src/ui/panel.ts, src/main.ts, additive guards/free-view-steps.test.ts,
README.md, additive five-degree cases in src/stable-free-view.test.ts, this ticket. Existing CSS provides 44px grid buttons/focus.
No specification, fixtures, dependencies, workflow or rendering math edits.

## Acceptance

Literal signed five-degree quaternion expectations independent of production
constants; inverse steps, five devices, stable framing, interrupted poses.
Native Enter/Space (including holds), local arrows, focus/form/modifier/IME/
defaultPrevented boundaries, busy/PG gates, disposal and history. Actual desktop
and mobile button/key, upload, Copy/reload and downloaded PNG journeys.
Seed reversed axes, double activation, shortcut leakage and missing history.
Existing CI/build, cloud CI/PG/PNG and inspected images, fresh-context review.
Physical device/Safari/performance evidence is not implied.
