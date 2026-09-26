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

Verification on 2026-09-26, Linux, Node 24.19.0, Chromium 153.0.8010.0,
ANGLE SwiftShader. Pinned Playwright browser download failed; an external
workspace Chromium executable was used through the existing override. Project
dependencies, lockfile and CI browser installation remain unchanged.

- New production geometry test PASS, including all five aspects, resize,
  completed Lean→Hero transitions, export framing and retained custom orbit.
- New canvas guard PASS (20.20 s). Restoring the old lateral camera in the
  served module FAILS the same guard (18.61 s total): top endpoint mismatch
  3 px at ±120, against the unchanged 1 px tolerance. The initial seed attempt
  failed to match Vite's shortened decimal syntax and timed out; it is not
  the negative proof. The corrected one-match seed produced the metric failure.
- Native screen-height differences at ±120/180/220 pixels from center:
  original 9/13/15 px; candidate 0/0/0 px. Candidate top Y=246, bottom Y=575
  at all six sampled columns. Flat QA color is used only for measurement;
  review PNGs retain the unchanged original demo.
- Phone original/candidate decoded pixels are identical (0 changed pixels).
- Typecheck and build PASS. Existing >700 kB warning retained (709.80 kB JS).
- Full unit suite: 209/210 PASS; one existing 100-endpoint camera test timed
  out at 6.653 s with its original 5 s limit. Focused candidate retry also
  timed out at 6.605 s. The identical test on clean main cdcd80a timed out
  at 7.041 s in the same environment. This documents a baseline timing
  limitation, not a full unit PASS. No timeout/assertion/configuration changed.
- A full local npm run ci was interrupted during guards without a verdict.
  Its incomplete run is not acceptance. Normal published-head cloud CI/PNG/PG
  results remain required; no manual dispatch or duplicate rerun requested.
- Native capture pages report zero page/console/GL errors. The optional
  agent-browser CLI daemon could not start; actual browser evidence uses the
  project's Playwright path and native screenshots, not a claimed CLI pass.

See `docs/evidence/T-P9i/receipt.json` for hashes, dimensions, per-pair
measurements and source identity. Local capture source
459a129a52c09800ad7affedd7c673e8bd893f76 and published source
bed42166b51cad51cab6b03ceebf4aadbbb26fd4 have identical complete Git tree
39f376093fd0ae423573e422d1f4b8febcf2505f; subsequent changes are evidence/docs.
Unit and clean-main comparison logs are included. These are local captures,
not CI PG baselines, owner approval or target-device performance evidence.

PR #32's old camera edge-quality guard is not part of this branch; integration
must preserve that angled regression with an explicit legacy/custom camera
fixture, not remove its assertions. Intentional Browser Hero PG differences
remain unblessed. Fresh review, successful cloud checks and owner visual
acceptance are outstanding. No merge or deploy.

## Authorized review fixup (2026-09-27)

Owner requested the shadow fix after the independent FIXUP. F7–F9 extend
the write set to `src/scene/studio.ts` only for Browser shadow fitting,
plus this research/ticket/evidence. Earlier camera-only scope describes
the initial patch; this extension also touches §4.4.3/P-11(6). Reuse the
existing thin-device footprint; preserve all guards, thresholds, fixtures
and camera symmetry. Browser shadows in other poses also receive the
minimum footprint; other device recipes do not change.

Local fixup verification: TypeScript PASS, build PASS (unchanged >700 kB
warning), all 210 unit tests PASS. `npm run ci` cannot complete browser
guards: no Chromium executable is installed; pinned Playwright download
failed with an invalid/truncated ZIP. No GPU PASS, native new image, or
closure of the isolated-shadow finding is claimed.

Publication is pending the required local CI gate or an explicit owner
exception permitting draft publication for normal cloud verification.
AGENTS/HANDOFF require successful local acceptance before publication;
no check, fixture, dependency or workflow was altered to evade it.
The old images remain historical evidence and are not this fixup's images.

### Owner publication exception — 2026-09-27

After disclosure of the unavailable local Chromium, all 210 unit tests,
TypeScript and build passing, the owner explicitly replied “Odobravam”
to publishing this fixup to draft PR #33 for normal GitHub CI verification.
This supersedes the publication hold above, not the required GPU checks,
independent review, owner visual approval or CI-derived baseline bless.
No manual workflow dispatch, rerun, threshold change or merge is authorized.
