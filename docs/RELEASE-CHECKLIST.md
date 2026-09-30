# PNG release checklist

Snapshot: 2026-09-30, main base 2b54ce0aad8c344c5d4f112185f767df702330d0.
This checklist replaces no specification requirement and is not a release PASS.

## Existing evidence

- Five-device PNG studio, responsive controls, sharing and manual Free view
  are merged. Owner reported checking all five devices and downloads.
- PR #37 independent MERGE review: 5356638036, head 6d936675.
- CI 36598798664 and PG 36598798757 passed for that head. PNG 36584449640
  passed on parent 28abb335; reviewer accepted reuse for the fixture-only delta.
- Production deployment for merge 4506c7f succeeded. Check current main jobs
  separately; this is not a claim that every later commit has passed.
- PR #39 final independent review is MERGE for
  cb540a4a68b7a4d9d180b015a430b1d3868aa589. CI 36634995499,
  PG 36634995438 and PNG 36634995407 passed for that reviewed content.
  Merge 6ad29737f947c4e691f68c8b5b416976f3eb9c07 was deployed successfully.
  These results are not a new run on this documentation PR or a perf/Safari PASS.

## Merged presentation and copy

- Accurate current-feature README, favicon and social metadata/card.
- Submission copy and demo storyboard in SUBMISSION.md; nothing submitted.
- Original vector social artwork is a brand illustration, not a captured export.
- PR #38 presentation and PR #39 punctuation completed independent review
  and were merged. The name/tab/social titles now read Plinth with no em dash
  in user-facing copy; product-name confirmation is recorded in P-19.

## Approved planning amendment

- Owner approved all six parts of tickets/T-P10-decisions-proposal.md on
  2026-09-30 at 01:25 Europe/Belgrade: name Plinth, PNG release, deferred motion
  and video, the replacement workload with preserved budgets and evidence,
  continued browser/PNG/PG acceptance and truthful demo media.
- P-19 is a standalone spec-only commit; release-plan synchronization is a
  separate documentation commit. PR #40 received independent MERGE review and
  owner-authorized merge at 2b54ce0aad8c344c5d4f112185f767df702330d0;
  its automatic deployment succeeded. P-19 is now the active release contract.

## T-P10c diagnostic preparation

- Desktop trace, warm-up and separate CPU/GPU measurement limits are frozen in
  tickets/T-P10c.md. The optional instrumented build leaves production source alone.
- Collector preserves actual renders, raw input timings, GPU gaps, slow samples
  and five-run distributions. Every diagnostic summary remains LOW-TRUST with
  the release gate pending; no partial metric is a full-frame budget verdict.
- Local regression cases: 8 passed. Existing unit tests: 236 passed. Typecheck,
  normal build and instrumented build passed. Normal build contains no probe.
- Local npm run ci was blocked: 15 browser suites could not launch missing
  Chromium; 18 tests passed and 89 could not run. Browser installation failed
  with a truncated archive. Existing CI now includes the collector smoke and
  retains raw JSON. Its result and independent PR review must be checked on
  the candidate head; neither is claimed here in advance.

## Still open

- Review and merge T-P10c diagnostic preparation after existing CI succeeds.
- Establish the complete frame/presentation measurement, then collect/report
  five real runs on disclosed target hardware. Freeze the actual-phone trace
  separately. No physical desktop/phone performance PASS is claimed.
- Verify Safari on actual supported Apple hardware/browser; emulation is not proof.
- Record a real production walkthrough and representative exports using owned
  content. Do not treat the social illustration as a working-product screenshot.
- Verify current official competition terms, deadline, eligibility and actual
  form fields with the owner before submission; historical dates are not proof.
- Owner confirms public entrant name and submits the entry after final review.

No motion/video functionality, benchmark success, prize outcome or unrestricted
support for every GPU is promised by the presentation work.
