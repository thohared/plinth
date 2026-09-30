# T-P10f: wait for the requested upload and verify both shared-link paths

Author/build: Codex, Linux. Base `176631d739834758022ae142077d70655acdbfda`.
Research: T-P10f-research.md F1–F7, committed first. Clauses: §2.6–2.7,
§4.1, §4.8, §7, P-9/P-10(3)/P-14(2–3). TODO(spec): none.

## Acceptance

1. Preserve every T-P10d assertion for initial/replacement uploads, Cover,
   current-image manual Contain, composition retention and restored settings.
   Wait for the requested literal original width AND height and user identity;
   do not wait for the fit value whose correctness is being asserted (F2/F4).
2. Exercise explicit in-tab hash restoration from Cover back to saved Contain,
   checking that navigation has no new document response and retains the
   existing 320×180 user image. Its next 200×380 upload selects Cover (F3).
3. Open the saved URL in a separate recipient page, verify the demo, restored
   Contain/laptop and image-exclusion notice, then upload through the real file
   input and verify Cover plus a later manual Contain selection (F3).
4. Hold the actual next File decode behind a test-only promise barrier. While
   held, prove the old identity-only wait resolves with the old 320×180/Contain
   image. Release the native decoder and verify 200×380/Cover. No sleep, retry
   on fit, fabricated bitmap, production hook or timeout increase (F4/F5).
5. Focused negative probes: `upload-wait` must fail at the old assertion boundary
   on stale dimensions/Contain; existing `upload` must fail Cover on the initial
   upload; `upload-shared` must fail Cover specifically in the fresh recipient.
   Unseeded test must pass. Setup errors do not count as mutation proof (F5/F6).
6. Preserve the historical failed CI evidence. A successful controlled probe
   establishes this race mechanism, not the unrecorded exact scheduler ordering
   of that old run. Require normal automatic CI/PG/PNG and independent review
   before proposing closure. This is not physical performance acceptance (F1/F6).

## Write set

`guards/live-feedback.test.ts`; `docs/RELEASE-CHECKLIST.md`; this ticket and
its research. No production, spec, fixtures, dependencies, thresholds or
application-workflow edits. A focused evidence-only branch may run the missing
browser probes against an explicit application SHA/tree; never merge that branch.

## Validation and evidence

- Local TypeScript check and `git diff --check` passed.
- Denylist/protect-files guards: 16/16 passed in two files.
- Production build passed; existing 718.17 kB bundle warning remains unchanged.
- Focused local browser test was attempted but stopped in beforeAll: missing
  Playwright chromium_headless_shell-1243 executable. No browser assertion ran;
  this is not a failed application assertion or a completed `npm run ci`.
- Browser positive/negative execution and normal automatic acceptance results
  are recorded in the PR after publication, with tested head/tree and raw logs.
  No duplicate full workflow is manually dispatched. Only missing focused
  evidence is eligible for a separate Linux job.

Focused command: `npm run guards -- guards/live-feedback.test.ts -t 'T-P10d every upload'`.
Negative variants prefix `PLINTH_LIVE_SEED=upload-wait`, `upload` or
`upload-shared` respectively. Expected failures must cite actual assertion lines.
Existing full CI runs preserve the nine cases in this file and all other guards.
