# T-P9i — symmetric Browser Hero

Author: Codex. Research: T-P9i-research F1–F6. Owner direction 2026-09-26.
Base: main cdcd80a6bda46b35d691bf926d759177b6f4e335; independent of #31/#32.
Cites §2.5–2.7, §4.2–4.3/4.5–4.6/4.8, §7, P-11–P-15 and P-17.

## Scope and write set

Only the Browser Hero camera direction changes. Preserve mesh, screenshot,
other device presets, custom orbit, FOV, framing, PNG and rendering pipeline.
Implementation: `src/camera/poses.ts`; additive
`src/camera/browser-perspective.test.ts`, `guards/browser-perspective.test.ts`;
`scripts/browser-perspective-capture.mjs`; this ticket/research and
`docs/evidence/T-P9i/`. The prior P-17 planning commit touches only the spec.
No fixture, dependency, workflow or existing test modifications.

## Acceptance

- Production scene projection: equal left/right edge heights and aligned
  top/bottom endpoints for Browser Hero across all five output aspects,
  resize and a completed transition. Custom-view serialization is unchanged.
- Real canvas regression: equal projected silhouette at paired interior
  columns; the old served lateral Hero direction fails the same check.
- Native before/after 1280×800 DPR1 captures with SHA-256 and source receipt;
  show the corrected image to the owner. Software-renderer proof only.
- Linux npm run ci and build; normal CI/PNG/PG jobs after publication, no
  duplicate dispatch. Expected Browser Hero PG differences remain blocking
  until owner-approved CI-derived baselines in a separate commit.
- Fresh independent review and owner visual acceptance. No merge or deploy.

## Evidence

Pending implementation verification. PR #32's old camera edge-quality guard
is not part of this branch; integration must preserve that angled regression
with an explicit legacy/custom camera fixture, not remove its assertions.
