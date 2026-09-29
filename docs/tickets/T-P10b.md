# T-P10b: User-facing punctuation

Author: Codex, 2026-09-29 (backend identifier not exposed).
Base: c8de61170947a26163c219477cfc259fe2a4023b.
Shared knowledge: astra-runner 2df99332f5e4cd14d464146900969e91405193bd.

## Research and owner request

The owner requested removal of the em dash from the browser-tab hover title
and a check for other occurrences. This is a punctuation-only presentation fix.

1. Clauses: section 1/P-10 truthful presentation; section 4.6 PNG status;
   section 4.8/P-14(3) shared-link notice; section 2 and section 7 acceptance.
2. Existing surfaces and findings:
   - F1: index.html:7,11,19 has three matching tab/Open Graph/Twitter titles.
   - F2: src/export/download.ts:31 has one em dash in the PNG-ready message;
     src/main.ts:296 has one in the shared-link notice.
   - F3: README.md:78 and docs/SUBMISSION.md:1 each have one occurrence.
   - F4: the other src occurrences are comments, not product strings. No
     literal or encoded em dash was found in the public text/SVG assets.
     Historical docs, the specification and code comments retain punctuation.
3. No missing functional contract is introduced. P-14(3) quotes the old notice;
   this owner-directed punctuation change preserves its complete meaning:
   scene loaded, add your screenshot, images excluded from links. It does not
   change URL contents, persistence, rendering or exports. The specification
   and the separate T-P10 performance proposal remain untouched.

## Implementation and acceptance

Use `Plinth: Screenshot studio` for all three titles. Use a colon before
`PNG is ready`, a full stop before `Images are not included in links`, a comma
in the README sentence and a colon in the submission heading.

Write set: index.html, src/main.ts, src/export/download.ts, README.md,
docs/SUBMISSION.md and this ticket. No behavior, CSS, images, fixtures, tests,
dependencies, workflows or test thresholds change. Research is committed
before implementation. No new test or guard is needed for this copy edit.

Validate the built titles, remaining literal/encoded product-text occurrences,
typecheck, existing unit tests and build. Attempt the existing acceptance
command and disclose any unavailable browser setup. Existing automatic cloud
CI/PG/PNG and a fresh-session GitHub review remain acceptance gates; no manual
duplicate workflows, baseline blessing, self-review or release PASS.
