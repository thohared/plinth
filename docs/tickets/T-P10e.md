# T-P10e: final release documentation

Author/build: Codex, Linux, 2026-09-30. Owner asked to finish documentation and
explain performance testing. Base `8577219ff16358820770fdd658931feda44b4c06`.
Research: T-P10e-research.md F1–F8, committed first. Clauses: §1, §2.7,
§4.1, §6–§8, P-9/P-19. Documentation completion is not release acceptance.

## Acceptance and write set

1. README states the new per-upload Fill screen behavior accurately (F1).
2. Handoff/current release plan point to the shipped PNG scope and current
   evidence, preserving dated history and all process requirements (F2/F3).
3. Release checklist records reviewed identities and separates existing success,
   post-merge status and still-open physical/full-frame/Safari/media work (F2/F4).
4. Performance runbook gives a usable manual Chrome diagnostic procedure plus
   the existing automated collector's prerequisites, commands, output handling
   and limits. Disclose native-Windows path/LF risks and require build preflight;
   no claimed physical run, portability fix or complete-frame method (F4–F6).
5. Submission copy matches visible current form fields and deadline conversion;
   unknown entrant details and inaccessible terms remain explicit (F7).
6. Validate document links, short-copy length, command syntax/flags, evidence
   identities and write scope. No new guard/test is needed for these docs (F8).

Write set: README.md; docs/HANDOFF.md; docs/RELEASE-PLAN.md;
docs/RELEASE-CHECKLIST.md; docs/SUBMISSION.md; docs/PERFORMANCE-TESTING.md;
this ticket and its research. Source/scripts/tests/spec/fixtures/dependencies/
workflows remain unchanged. No paid API, new benchmark, competition submission,
merge, self-review or manual duplicate workflow dispatch.

## Verification

- `git diff --check`: passed.
- All local Markdown links in the eight-file write set resolve. Submission
  description is 162 characters, within the verified 200-character limit.
- Both shell command blocks pass `bash -n`; flags and output behavior were
  checked against the existing collector. No physical benchmark was invoked.
- Read-only portability probes confirmed the Windows separator mismatch and
  CRLF anchor failure; they do not claim native-Windows execution.
- `npm run guards -- guards/denylist.test.ts guards/protect-files.test.ts`:
  16 tests passed in two files. Research commit's typecheck hook passed.
- Source, scripts, tests, fixtures, specification, dependencies and workflows
  are unchanged. Existing PR #42 PNG/diagnostic evidence remains applicable to
  those unchanged files; no duplicate full workflow was dispatched.
- Base post-merge PG 36769509786 succeeded; CI 36769509852 was in progress at
  the documentation snapshot. PR automatic checks and independent review are
  separate publication gates, not claimed complete by this ticket.

TODO(spec): none; no acceptance requirement is waived.
