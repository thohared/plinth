# T-P10g research — production Analytics boundary

Base: `a5fd724e7f5c345304d53dfdc90c9ad38ca8fcca` (2026-10-25).
Read-only research before the implementation ticket; no source or guard changes.

## 1. Clauses touched
§2.2–2.4 (network, uploaded images, dependency licences), §2.6–2.7
(independent review/research), §4.1/§4.6/§4.8 (input/export/shared state),
§7 (deterministic PG), P-2 and P-14. A separate P-20 amendment is needed:
the owner approved retaining Analytics with a narrow privacy exception.

## 2. Current surfaces and findings

- F1 — `src/main.ts:1,30` imports and unconditionally calls `inject()`.
  PR #46 introduced it without a corresponding §2.2/P-2 exception.
- F2 — Main CI [39273836721](https://github.com/thohared/plinth/actions/runs/39273836721),
  job 118132859881, reports 104/107 guards passing. The three failures are
  `guards/no-network.test.ts`, the input-session guard in
  `guards/pg-mode.test.ts`, and the interrupted-copy privacy case in
  `guards/state-share.test.ts`. All see
  `https://va.vercel-scripts.com/v1/script.debug.js`.
  This run stops before typecheck/unit tests. PG run 39273837220 passed.
- F3 — `package.json` uses `^2.0.1`; the lock resolves 2.0.1.
  `LICENSES.md` omits the new runtime dependency. Pinning the manifest to
  the existing lock version and recording MIT is a scoped correction.
- F4 — Upstream SDK tag v2.0.1 is
  `0d6941670b31bf2f3cbcf47540840b0b08860077`.
  [generic.ts](https://github.com/vercel/analytics/blob/0d6941670b31bf2f3cbcf47540840b0b08860077/packages/web/src/generic.ts)
  queues beforeSend before inserting the remote script.
  [utils.ts](https://github.com/vercel/analytics/blob/0d6941670b31bf2f3cbcf47540840b0b08860077/packages/web/src/utils.ts)
  selects the external debug script for development/test unless mode is explicit.
  Explicit scriptSrc overrides dynamic configuration. Import alone does not inject.
- F5 — [types.ts](https://github.com/vercel/analytics/blob/0d6941670b31bf2f3cbcf47540840b0b08860077/packages/web/src/types.ts)
  and [package documentation](https://vercel.com/docs/analytics/package)
  expose beforeSend for pageview/event URL redaction or dropping an event.
  It does not promise control over every provider metadata field.
  [Provider privacy documentation](https://vercel.com/docs/analytics/privacy-policy)
  lists referrer, browser/device and coarse geography among visit statistics.
  Do not describe Analytics as sending no visitor metadata.
- F6 — `src/main.ts` parses PG/QA query flags after the current injection.
  `src/state/navigation.ts` updates the hash; `src/state/share.ts` removes
  query data from copied links. Analytics must never receive scene hashes,
  arbitrary query tokens, filenames, image data or custom interaction events.
  A canonical root pageview is enough for this single-page studio.
- F7 — Existing guards exercise localhost production previews and development
  servers. Keep all assertions unchanged. Add positive coverage of the real
  built SDK on a routed canonical production origin, with a local collector
  double so CI never sends real Analytics. Negative seeds must prove detection.
- F8 — `index.html` has no referrer policy. A page-level no-referrer policy
  prevents sensitive current URL query data in outgoing HTTP Referer headers.
  It does not erase incoming `document.referrer`; suppress Analytics when that
  referrer contains a path, query, credentials or fragment beyond an origin.
- F9 — The live Analytics script could not be retrieved in this environment:
  Vercel connector denied project/team access (403); web retrieval also failed.
  SDK-contract tests are not proof of the hosted collector's implementation.
  Record live payload/dashboard verification as pending, not a production PASS.
- F10 — This session has Windows only, no installed Linux/WSL and no reachable
  shell GitHub network. The existing GitHub connector can publish a focused
  candidate; automatic ubuntu-latest PR CI is the available Linux execution
  surface. Reuse one set of automatic CI/PG/PNG runs; no workflow gate changes,
  duplicate dispatches, paid model API or new runner service.

## 3. Gaps and scope

The spec prohibits every analytics call, while code injects one in every mode.
No production domain gate, URL scrubber, collector-specific regression or licence
entry exists. The narrow P-20 amendment must precede implementation in its own
spec-only commit. The implementation should retain Analytics only for root visits
on https://plinth-phi.vercel.app, suppress QA/PG/local/preview use, reject custom
events, redact URL state and preserve the independent original guards.
No rendering, image encoding, baseline, workflow or account/backend changes.
