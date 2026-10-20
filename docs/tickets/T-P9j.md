# T-P9j — Stop Free view distance pumping

Owner: Thohared. Builder: Codex. Base: e17cf5c. Research committed before P-18,
which is a separate specification-only commit. Cites P-11/P-16/P-18,
§2.1–2.7, §4.2–4.4, §4.8–4.9 and §7.

## Acceptance and scope

- Stable camera distance to the device's transformed local enclosure center
  during full horizontal, vertical and mixed rotations for all five devices.
- Reserve full-turn space once on first nonzero drag; exact floor contact,
  camera up, safe bounds, output padding and existing FOV policy remain.
- Named poses and legacy custom views retain their existing framing.
- Optional strict v1 custom-view `framing: "rotation"` persists framing only;
  the input tool remains transient. Preserve through reload, ordinary orbit,
  settings/spec edits, resize and export. Named pose resets the policy.
- No shader, dependency, workflow, fixture or baseline changes. No tolerance
  changes. Write set: scene framing, pose copying, codec/hydration, regression
  tests and additive assertions in the existing real-input/export browser guard.

## Evidence

Linux; Node 24. Typecheck, production build and 236/236 tests in 34 files pass.
New regression samples 24 steps per axis at five output aspects on all five
classes; fixed distance ratio equals 1 within 1e-10, with safe projected bounds
and near/far checks throughout. Includes camera orientation, floor, same-aspect
export, exception restoration, reset, URL round-trip, orbit, shape/padding edits,
strict invalid framing and legacy v1 compatibility.

Seed: replacing only the invariant enclosure selection with the old posed box
makes all five device distance tests fail. Restored source afterward.
Existing real mouse/touch/reload/PNG guard gains assertions that the framing
policy survives the input and reload journey; all previous assertions remain.

Cloud acceptance and independent fresh-session review remain required. Local
Chromium is unavailable (previously approved cloud verification exception).
No claim of new visual captures, physical mobile/Safari validation or owner
approval. The initial wider framing needs owner inspection in preview.

## Review prompt

Review this PR against PLINTH_SPEC §2.1–2.7, §4.2–4.4, §4.8–4.9,
§7 and P-11/P-16/P-18, and this ticket. Do not fix anything. Verify the seeded
regression, strict backwards-compatible codec, transactional preparation,
export/resize/reset, and scope. Report MERGE or numbered FIXUP and POST THE
FULL REPORT AS A GITHUB REVIEW. Builder is not its independent reviewer.
