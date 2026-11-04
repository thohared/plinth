# PNG release checklist

Current source snapshot: 2026-11-04, merged main `459a0ac8aa607cc4d7e587f6e78d75a9856736b4`.
This is an evidence inventory, not a release PASS or deployment confirmation.
Historical runs below belong to their named commits, not automatically to this
snapshot. Refresh live statuses before any release decision.

Startup recovery (#57) and Undo/Redo (#59) are merged. P-24 crop (#60) is
specification only; Free view controls (#62) remain an open implementation PR
following merged P-25 (#61). See [HANDOFF.md](HANDOFF.md) for the current queue.

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

PR #42's reviewed head and merge share tree
`a8db74c3142b738bf0d6fda6583fab8facbf171d`. Its
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
Retain this historical failure. The subsequent correction and review are
recorded below; the failed run itself never became green.

## PR #44 closes the upload-guard investigation

[T-P10f / PR #44](https://github.com/thohared/plinth/pull/44) merged as
`bab8b1161598dafdfc89e6afed088705b97a3e32`. The
[independent MERGE review 5372593442](https://github.com/thohared/plinth/pull/44#pullrequestreview-5372593442)
verified head `569a9aeabd4b332ecb0fdf74518b0afdc505883c`, tree
`cd551e15acb7cb2d07b14417e3af197cf3482439` (also the tested merge tree).
The review is a COMMENT review because the connected account authored the PR;
it records an independent session, not formal GitHub approval.

The guard now waits for the requested image dimensions and tests fresh-recipient
loading separately from in-tab navigation. Controlled native-decode evidence
establishes the stale-image waiting mechanism, not the uncaptured exact
scheduler ordering of the old failed run. Production code was unchanged.

| Existing run | Accepted result recorded by the independent reviewer |
| --- | --- |
| [CI 36778935635](https://github.com/thohared/plinth/actions/runs/36778935635) | SUCCESS: 107 guards, typecheck, 239 units, 12 diagnostic regressions and smoke. |
| [PG 36778935646](https://github.com/thohared/plinth/actions/runs/36778935646) | SUCCESS: 73 captures, 0 missing baselines, 0 failures, 20 comparisons. |
| [PNG 36778935562](https://github.com/thohared/plinth/actions/runs/36778935562) | SUCCESS: 15 sizes, 400 cases, no errors. |
| [Focused 36779102980](https://github.com/thohared/plinth/actions/runs/36779102980) | FAILURE in evidence aggregator; two unseeded cases passed. Preserve this failure. |
| [Focused follow-up 36780749845](https://github.com/thohared/plinth/actions/runs/36780749845) | SUCCESS: three intended negative assertion failures; reused the two positive results. |

CI/PG/PNG job conclusions were rechecked on 2026-11-04. Detailed raw-artifact
verification belongs to the linked historical review; no new execution or
artifact download is claimed here. Evidence-only workflow branches stay unmerged.

## Issue #23 disposition

[Issue #23](https://github.com/thohared/plinth/issues/23) is a September intake,
now superseded by this handoff. It is proposed for closure when T-P10v merges,
with the remaining release obligations retained below. Closure means the old
intake has been reconciled, not that every release/future-project idea is done.

| Old intake item | Disposition / durable destination |
| --- | --- |
| Accessible PNG action | Already merged in PR #24; do not reimplement. |
| Portrait demo, device polish and modern panel | Cumulative [PR #29](https://github.com/thohared/plinth/pull/29), merge `e436113bdbf124dcd3b01f29ef21cdd9e6f721df`, includes #25/#27/#28. #25 is marked merged; #27/#28 were closed as covered, not individually merged. Final [review 5253982470](https://github.com/thohared/plinth/pull/29#pullrequestreview-5253982470) records acceptance. This does not recover the formerly lost local commits. |
| Mandatory motion / video sequence | Superseded by P-19: deferred beyond the PNG competition release, not completed. |
| Performance, physical Safari and final media | Still pending in the numbered release list below and PERFORMANCE-TESTING.md. |
| Future asset/audio/engine pilots | Retained as historical recommendations in issue #23; no integration, licensing clearance or new implementation commitment is implied. Gearfall remains outside this ticket. |

## Still open for final release acceptance

1. Define and review complete frame/presentation measurement separately from
   the existing partial CPU/GPU timers and rAF cadence. Freeze the physical-phone
   trace. Preserve §6/P-19 budgets, sample counts, hitches and variability rules.
2. Collect and review five actual desktop runs and the required physical-phone
   evidence. The saved `Plinth-fizicka-provera-BLOCKED-2026-09-30.txt` reports
   **0/5**, no collector invocation and no access to the owner's physical GPU.
   It is an environment preflight, neither measured PASS nor measured FAIL.
   Follow [PERFORMANCE-TESTING.md](PERFORMANCE-TESTING.md); native-Windows
   collector compatibility needs its documented preflight/targeted follow-up.
3. Verify save/open and interaction behavior in Safari on actual Apple hardware.
   Linux WebKit and emulated viewports do not establish this result.
4. Record a real production walkthrough and representative owned-content
   exports. The storyboard and social illustration are not a completed video.
5. Historical competition submission remains unverified. Before any renewed
   submission action, the owner reviews current terms/eligibility and final entry
   fields, supplies the intended public name/email, and makes the submission
   decision after the required final review. The visible form was checked on
   September 30; the separate terms page was inaccessible to the retrieval tool.

Prepared entry copy and exact remaining submission inputs are in
[SUBMISSION.md](SUBMISSION.md). No entry has been submitted by this work.

September deadlines and form observations are historical. This update does not
assert that entry is currently open or that later commits meet competition rules.
