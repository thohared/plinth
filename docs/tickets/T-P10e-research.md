# T-P10e: release documentation and performance handoff

Author: Codex, Linux, 2026-09-30. Owner requested final documentation and an
explanation of performance testing. Fetched base:
`8577219ff16358820770fdd658931feda44b4c06`, tree
`a8db74c3142b738bf0d6fda6583fab8facbf171d`. PR #42 is merged and deployed;
there are no open application PRs at this snapshot. Shared knowledge revision:
`thohared/astra-runner@2df99332f5e4cd14d464146900969e91405193bd`.

## Clauses, existing surfaces and gaps

- F1: §1/P-19 and §4.1/P-9. README's final upload paragraph still says an
  earlier manual/restored fit takes precedence. `src/settings.ts:105–107` now
  selects Cover on every accepted normal-editor upload (PR #42). Document that
  shared/manual settings apply until a new image, and retain padding semantics.
- F2: §7 and §8/T-P10. `docs/RELEASE-CHECKLIST.md` still lists T-P10c review
  and merge as pending. PR #41's final review 5367979960 and merge cb47c39,
  plus PR #42's final review 5371175772 and merge 8577219, supply current
  evidence. Record exact tested source, runs/artifacts, and separate post-merge
  status. Green automated checks are not physical performance or Safari proof.
- F3: §1/P-19 and §8. HANDOFF opens with the September 11 pre-export snapshot;
  RELEASE-PLAN's current section does not record completed diagnostic work.
  Add a current entry point and update the current plan while retaining the
  older dated history and all implementation/review rules.
- F4: §6/P-19(3–5). `scripts/performance.mjs:112–200` builds a separate
  instrumented site, runs five warmed 60-second traces and preserves raw JSON.
  `performance-metrics.mjs:34–41` always reports LOW-TRUST/pending because
  CPU/GPU timing is partial. Full-frame measurement and actual-phone trace are
  still missing. The existing physical-preflight report collected 0/5 runs in
  a cloud container, not on the owner's desktop. Do not claim a physical PASS.
- F5: §6/P-19 and owner environment rules. Provide a runbook for a physical
  foreground desktop with disclosed hardware/browser/renderer/display/power,
  exact source identity, new output outside the checkout, preserved exit codes,
  complete logs/raw files, and a fresh reviewer. Default to Linux; do not change
  the owner's existing OS merely to obtain a measurement. Cloud, emulation,
  software rendering and display refresh cadence are not substitutes.
- F6: portability preflight, not an implementation change. Vite normalizes
  resolved IDs to forward slashes; the collector compares the ID directly with
  OS-native `resolve('src/main.ts')`. A read-only Node win32 path probe gives
  `G:\\Plinth\\src\\main.ts` versus `G:/Plinth/src/main.ts`, unequal.
  Separately, calling existing `instrument` with current LF source succeeds,
  while a temporary CRLF string throws `Expected exactly one main render anchor`.
  Native Windows has not been executed here. Document this concrete portability
  risk and require build-only preflight; do not advertise a verified native
  Windows collector or silently patch the harness for a measurement. A targeted
  portability implementation belongs to another ticket/PR if needed.
- F7: §8/T-P10 presentation, P-19(6). The official entry page was read on
  2026-09-30: name, optional handle, public demo/repo, optional description up
  to 200 characters, email and terms acceptance. It displays September 30,
  midnight New York. That end-of-day boundary is October 1, 06:00 Belgrade.
  The separate terms page could not be retrieved: eligibility/terms remain
  unverified. Preserve the owner's submission/identity decision. Draft copy
  and a storyboard exist; a real walkthrough recording does not.
- F8: §2.7/§7. This is documentation-only: no source, performance algorithm,
  test, fixture, spec, dependency or workflow edits. No new guard. Validate
  local links, copy length, commands/flags against source, evidence identities
  and diff scope; reuse existing evidence, allow normal automatic checks,
  and require fresh independent review. TODO(spec): none; no rule is waived.

## Sources

- Current repository, P-19, T-P10a–d and the two final GitHub reviews above.
- Owner's saved `Plinth-fizicka-provera-BLOCKED-2026-09-30.txt`, dated
  2026-09-30 18:56 UTC: no physical connection, collector not invoked, 0/5 runs.
  This is a preflight record, not a benchmark result.
- https://playwright.dev/docs/browsers#google-chrome--microsoft-edge
  (installed Chrome channel and browser-installation boundaries).
- https://vite.dev/guide/api-plugin.html#path-normalization
  (normalized module IDs versus Windows-native path separators).
- https://developer.chrome.com/docs/devtools/performance/reference
  (runtime recording and frame inspection, not Plinth acceptance definitions).
- https://canivibecodeit.com/thebuildgames and
  https://canivibecodeit.com/thebuildgames/builders (visible form/deadline).
- https://canivibecodeit.com/thebuildgames/terms (retrieval unavailable).

All external reads above were made on 2026-09-30. No new physical measurement,
competition submission, baseline approval, duplicate workflow or paid API call.
