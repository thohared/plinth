# Evidence only, do not merge

Application PR #44 head 569a9aeabd4b332ecb0fdf74518b0afdc505883c, tree cd551e15acb7cb2d07b14417e3af197cf3482439 is unchanged.

Run 36779102980 performed two passing unseeded tests and three seeded failures
at the intended assertion lines. Its evidence aggregator incorrectly required
full expected/actual values inside Vitest's abbreviated JSON failureMessages,
so the workflow and summary report failure. Preserve that result and artifact
11126564948 (ZIP SHA256 bb989dc7f5114fc4893b2ecfd037efdb19f6ad0be2767d5cb1edbb4d5c9c30e7).

This follow-up reruns ONLY the three negative cases with both the default
reporter (full assertion diff in raw logs) and JSON (structured statuses/stacks).
The two successful positive cases are reused, not rerun. No full CI/PG/PNG
dispatch. Source identity and clean checkout checks remain mandatory.

The headless guard needs the pinned headless shell. This evidence job installs
that browser only on the standard Ubuntu runner, avoiding the previous lengthy
system package upgrade. A missing dependency or setup failure is not mutation
proof. Full application CI retains its existing setup. Raw artifacts are kept.
