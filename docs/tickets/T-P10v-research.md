# T-P10v research — current handoff and stale intake closure

Codex (GPT-6), Linux, 2026-11-04. Read-only research against fetched main
`459a0ac8aa607cc4d7e587f6e78d75a9856736b4`; committed before the ticket.
Owner request: fifth improvement, documentation and old PR #42 / issue #23 status.

## 1. Clauses touched

§2.5–2.7, §6–7, P-5 and P-19 govern evidence, research/review and remaining
release obligations. P-23–25 distinguish approved behavior from implementation.
No specification amendment or runtime change is needed: TODO(spec): none.

## 2. Existing surfaces and findings

- F1 — `docs/HANDOFF.md:3–24`, `docs/RELEASE-CHECKLIST.md:3–6` and
  `docs/RELEASE-PLAN.md:3–24` still present September 30 / PR #42 as current.
  `docs/tickets/README.md:5–15` still directs new work toward T-P5 and mandatory
  motion, superseded by merged work and P-19. Keep dated history, replace routing.
- F2 — [PR #44](https://github.com/thohared/plinth/pull/44) merged as
  `bab8b1161598dafdfc89e6afed088705b97a3e32`. Its
  [independent review](https://github.com/thohared/plinth/pull/44#pullrequestreview-5372593442)
  records exact head `569a9aeabd4b332ecb0fdf74518b0afdc505883c`, tree
  `cd551e15acb7cb2d07b14417e3af197cf3482439`, positive/negative evidence and
  completed CI 36778935635, PG 36778935646 and PNG 36778935562. Requeried job
  metadata confirms all three SUCCESS. `docs/RELEASE-CHECKLIST.md:58–71` and
  `docs/tickets/T-P10f.md` still await this evidence. Preserve failed historical
  run 36769509852 and focused aggregator failure 36779102980; controlled decode
  proves the stale-image mechanism, not the exact old scheduler ordering.
- F3 — [Issue #23](https://github.com/thohared/plinth/issues/23) is open and
  describes September 15 work. [PR #29](https://github.com/thohared/plinth/pull/29)
  merged the cumulative #25/#27/#28/#29 tree as
  `e436113bdbf124dcd3b01f29ef21cdd9e6f721df`; its final acceptance records review
  5253982470 and CI/PG/PNG success. Live PR metadata: #25 merged, #27/#28 closed
  without individual merge. Their heads are included in #29, not missing work.
  `docs/tickets/T-P9e.md:9–17` covers demo/device polish and modern panel;
  accessible PNG already shipped in #24. Do not claim recovery of lost local
  source or completion of unrelated future asset/audio pilots in the intake.
- F4 — Current main includes startup recovery #57 and Undo/Redo #59. Crop #60
  is specification only (P-24). P-25 #61 is merged, while implementation #62
  remains OPEN at `f82c03bede6fa00ad1a99a8a54a8d5cf8074cced`; do not call it
  shipped or merge it as part of this ticket.
- F5 — `docs/RELEASE-CHECKLIST.md` and `docs/PERFORMANCE-TESTING.md` retain
  unmeasured physical desktop/phone performance and actual Safari requirements.
  `docs/SUBMISSION.md:3–5` is dated prepared copy, not proof of submission.
  September competition dates are historical; this pass does not verify new
  terms/eligibility or create a release PASS. Residual obligations need a durable
  destination before closing the superseded intake.

## 3. Specification/surface gaps

No new behavioral gap is introduced. P-24 has no shipped crop controls; P-25
implementation remains outside main. Motion/video are deferred by P-19. Release
measurement/Safari/media evidence remains pending rather than implemented by
editing documentation. No code, guards, fixtures, dependencies or workflows
need changes. Scope: current documentation routing, historical evidence closure,
and an explicit issue #23 disposition with remaining work preserved.
