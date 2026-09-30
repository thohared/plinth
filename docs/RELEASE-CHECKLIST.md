# PNG release checklist

Application snapshot: 2026-09-30, merged main
`8577219ff16358820770fdd658931feda44b4c06`, tree
`a8db74c3142b738bf0d6fda6583fab8facbf171d`. This is an evidence inventory,
not a release PASS. Refresh live statuses before the final release decision.

## Shipped scope

- Five generic devices, four lighting presets/looks, responsive controls,
  named poses, manual Free view, backgrounds, scene links and PNG at 1×/2×/3×.
- Every accepted normal-editor screenshot starts with Fill screen. Manual
  fitting applies to the current image; a later upload selects Fill again.
  Explicit image padding and color remain. Shared settings restore before
  further editing; images are excluded from links.
- Plinth name and PNG-only competition scope are approved by P-19 (PR #40,
  merge `2b54ce0aad8c344c5d4f112185f767df702330d0`). Motion preview and video
  export are deferred, not hidden shipped features.
- README, English interface, favicon, local social card and submission copy
  exist. The social card is an original illustration, not a captured export.
- Owner previously reported checking all five devices and downloads, including
  Android 1×/2×/3×. These observations are not five-run performance measurements
  or proof of physical Safari support.

## Reviewed and merged work

| Work | Independent review / merge | Evidence boundary |
| --- | --- | --- |
| Presentation / punctuation | PR #38 and #39; #39 final review for `cb540a4`; merge `6ad2973` | Current-feature copy, metadata and prepared submission text; no entry submitted. |
| PNG release contract | PR #40, merge `2b54ce0` | Approved P-19 plan, not measured acceptance. |
| Desktop diagnostics | [PR #41 review 5367979960](https://github.com/thohared/plinth/pull/41#pullrequestreview-5367979960), merge `cb47c39` | Corrected 4:5 v2 trace and real-drag receipts; partial CPU/GPU metrics remain LOW-TRUST/pending. |
| New-upload Fill screen | [PR #42 review 5371175772](https://github.com/thohared/plinth/pull/42#pullrequestreview-5371175772), merge `8577219` | Both evidence findings closed; reviewed head `91fa2f67b2581c352b4796db78093115936ce011`. |

PR #42's reviewed head and its merge have the same tree recorded above. Its
three existing acceptance runs also used that tree (test-merge `4b088622`).

| Existing run | Final result |
| --- | --- |
| [CI 36760505174](https://github.com/thohared/plinth/actions/runs/36760505174) | SUCCESS: 107 guards, typecheck, 239 unit tests, 12 diagnostic regressions and software diagnostic smoke. |
| [PG 36760505168](https://github.com/thohared/plinth/actions/runs/36760505168) | SUCCESS: 73 captures, 0 missing baselines, 0 failures; all 20 comparisons within unchanged thresholds. Artifact 11119484483. |
| [PNG 36760505158](https://github.com/thohared/plinth/actions/runs/36760505158) | SUCCESS: 15 sizes and 400 matrix cases; manifest success=true, probe=false, errors=[]; RGB max 1.811764705882382, alpha max 1. Artifact 11119654354. |
| [Focused browser proof 36766187781](https://github.com/thohared/plinth/actions/runs/36766187781) | SUCCESS: seeded expected Cover/actual Contain failure, then unseeded pass. Artifact 11121685392 records tested head `91fa2f6` and clean source. |

The focused proof's workflow is on evidence commit `2a67f52`, but explicitly
checks out the reviewed application head/tree. That evidence branch is not
part of the product and must not be merged. The independent reviewer verified
this distinction, raw artifacts and hashes. No baseline blessing was added.

Vercel reported successful production deployment for merge `8577219`.
Automatic post-merge [PG 36769509786](https://github.com/thohared/plinth/actions/runs/36769509786)
completed successfully. [CI 36769509852](https://github.com/thohared/plinth/actions/runs/36769509852)
finished with **FAILURE**: 106 guards passed and one failed. In job 110072030623,
the T-P10d browser assertion at `guards/live-feedback.test.ts:100` expected
the new 200×380 image with Cover after shared-state restore/upload, but observed
the prior 320×180 image with Contain. The cause is not established by this log;
do not dismiss it as timing or treat earlier green evidence as its resolution.
The remaining `npm run ci` stages and diagnostic smoke were not reached.
Retain this failure and resolve it through focused investigation/review before
final acceptance. Do not manually dispatch duplicate full checks.

T-P10f investigates this failure without changing the application. Its guarded
candidate separates fresh recipient loading from in-tab hash navigation and
waits for the requested image's dimensions. A controlled pending decode tests
the stale-image mechanism, with negative probes for the old wait and disabled
Fill behavior. See [T-P10f](tickets/T-P10f.md). The historical failure remains
recorded; closure requires published execution evidence and independent review.

## Still open for final release acceptance

1. Resolve the post-merge CI failure above, distinguishing application behavior
   from test synchronization with evidence; preserve the guard's requirements.
2. Define and review complete frame/presentation measurement separately from
   the existing partial CPU/GPU timers and rAF cadence. Freeze the physical-phone
   trace. Preserve §6/P-19 budgets, sample counts, hitches and variability rules.
3. Collect and review five actual desktop runs and the required physical-phone
   evidence. The saved `Plinth-fizicka-provera-BLOCKED-2026-09-30.txt` reports
   **0/5**, no collector invocation and no access to the owner's physical GPU.
   It is an environment preflight, neither measured PASS nor measured FAIL.
   Follow [PERFORMANCE-TESTING.md](PERFORMANCE-TESTING.md); native-Windows
   collector compatibility needs its documented preflight/targeted follow-up.
4. Verify save/open and interaction behavior in Safari on actual Apple hardware.
   Linux WebKit and emulated viewports do not establish this result.
5. Record a real production walkthrough and representative owned-content
   exports. The storyboard and social illustration are not a completed video.
6. Owner reviews the current competition terms/eligibility and final entry
   fields, supplies the intended public name/email, and makes the submission
   decision after the required final review. The visible form was checked on
   September 30; the separate terms page was inaccessible to the retrieval tool.

Prepared entry copy and exact remaining submission inputs are in
[SUBMISSION.md](SUBMISSION.md). No entry has been submitted by this work.
