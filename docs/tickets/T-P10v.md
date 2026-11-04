# T-P10v — reconcile handoff and superseded intake

Author/builder: Codex (GPT-6), Linux, 2026-11-04. Base main:
`459a0ac8aa607cc4d7e587f6e78d75a9856736b4`.
Research: T-P10v-research F1–F5, committed first as `ec979ff` locally.
Clauses: §2.5–2.7, §6–7, P-5/P-19/P-23–25. TODO(spec): none.

## Acceptance and write set

1. F1/F4: update current HANDOFF, RELEASE-PLAN, ticket README routing; distinguish
   merged runtime, merged specification and open PR #62. Preserve dated history.
2. F2: correct RELEASE-CHECKLIST and T-P10f closure using PR #44's exact source,
   completed checks and independent review. Preserve historical failures and
   the limit of the controlled stale-image reproduction.
3. F3/F5: map issue #23 to cumulative #29 and remaining/deferred obligations.
   Propose closure via this PR only after the durable handoff merges; do not
   claim every intake idea completed or delete old issue/branch history.
4. F5: label SUBMISSION as historical prepared copy; retain performance, real
   phone/Safari, media and owner submission requirements without invented PASS.
5. Docs-only write set: this ticket/research, docs/HANDOFF.md,
   docs/RELEASE-CHECKLIST.md, docs/RELEASE-PLAN.md, docs/SUBMISSION.md,
   docs/tickets/README.md and docs/tickets/T-P10f.md. No runtime/spec/test/
   baseline/dependency/workflow edits or new tests are needed.

## Validation and review

Check diff whitespace, local document links, unchanged non-doc tree and cited
Git history/PR states. Pre-commit typecheck remains enabled. Normal automatic
CI/PG run on the published PR; do not dispatch duplicates or represent older
checks as this head's acceptance. Fresh independent GitHub review is required.
This ticket does not merge PR #62 or grant release/submission approval.
