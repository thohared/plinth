# T-P10d — New screenshots default to Fill screen

Author/build: Codex, Linux. Base `cb47c39`.
Owner authorized implementation on 2026-09-30.
Research: T-P10d-research.md F1–F5, committed before this ticket.
Cites §2, §4.1, §4.8–4.9, §7, P-9/P-10(3)/P-14.

## Acceptance

1. Every successfully accepted screenshot in the normal editor starts with
   `fit: cover` / Fill screen, including replacement uploads after a manual
   Contain choice or after opening a shared URL (F1–F3).
2. Users can choose Fit image for the current image. Device/composition changes
   retain that choice. Hydration restores saved fit until a new upload; new
   uploads preserve explicit image padding and padding color (F3).
3. Failed or superseded decodes do not reset current fit. Keep the existing
   latest-request-wins mount boundary, image resources and input paths (F2/F4).
4. Demo framing and explicit PG fits remain unchanged. No image stretching,
   shader/device changes or source pixel modifications (F1/F2).
5. Regression fails on old settings code. Preserve existing guard assertions by
   selecting manual Contain after the upload boundary where required; observe
   replacement completion using different image dimensions. Run available local
   typecheck/unit/build checks and existing automatic CI/PG/PNG checks (F4/F5).
   Independent fresh-session review before owner merge; fixtures remain read-only.

## Write set

`src/settings.ts`, `src/settings.test.ts`, `guards/live-feedback.test.ts`,
`guards/demo-edges.test.ts`, this ticket and its research.
No spec/dependency/workflow changes or paid API calls.

## Verification

- New settings regressions against the unchanged base implementation: 3 failed
  on expected Cover versus actual Contain; all 7 pre-existing settings tests passed.
- After the fix: typecheck passed, 239 unit tests / 34 files passed, production
  build passed. The existing >700 kB bundle warning remains (718.17 kB JS).
- `git diff --check` passed. Only the six declared files changed, including this
  paper trail. No baseline, workflow, spec or dependency edits.
- Local Playwright Chromium is absent (expected chromium-1243 executable does
  not exist), so full browser guards / `npm run ci`, browser mutation seed and
  visual checks are deferred to the existing automatic cloud checks and fresh
  reviewer. No duplicate workflow dispatch. Local unit success is not full CI
  or physical-device evidence; PR checks record the published-head results.
