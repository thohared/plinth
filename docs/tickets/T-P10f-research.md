# T-P10f: upload guard synchronization and shared-link coverage

Author/build: Codex, Linux, 2026-09-30. Owner requested continuation after
documentation PR #43 merged. Fetched base: `176631d739834758022ae142077d70655acdbfda`.
Shared guidance remains `thohared/astra-runner@2df99332f5e4cd14d464146900969e91405193bd`;
the previously read handoff/index/source policy at that unchanged revision apply.

## Clauses, surfaces and findings

- F1 — §2.7/§7: post-merge CI 36769509852, job 110072030623, checked out
  `8577219ff16358820770fdd658931feda44b4c06`. Its sole guard failure was
  `guards/live-feedback.test.ts:100`: expected new 200×380/Cover, observed prior
  320×180/Contain. PR #43's later CI 36772501945 passed on unchanged application
  and guard files. Neither result alone establishes the cause. Retain both.
- F2 — §4.1/P-9 and T-P10d acceptance: `src/screen/load.ts:loadImage` awaits
  format validation and bitmap decoding. `latestImageLoader` mounts only the
  latest successful result. `src/main.ts:setImage` calls `prepareUpload` then
  mounts synchronously; `src/settings.ts:prepareUpload` selects Cover on every
  accepted normal-editor upload. There is no demonstrated application defect
  requiring a production change in the inspected trace.
- F3 — §4.8/P-14(3): a fresh shared page must show the demo; in-tab hash
  navigation must retain the existing user image. The guard saves `page.url()`
  and calls `page.goto(shared)` on that same page without asserting a fresh
  document or demo. Hash navigation can leave the prior uploaded image present.
  Thus this action does not establish its intended fresh-link boundary. Use
  an actual recipient page and assert demo identity, and separately exercise
  explicit in-tab navigation with the prior upload retained.
- F4 — §4.1/§7: the first and final upload waits only require
  `getImage()?.identity === 'user'`. For a replacement, the prior image already
  satisfies this condition. The earlier replacement correctly waits for new
  originalWidth=320. After shared navigation, wait for both literal dimensions
  of the requested 200×380 image plus user identity, independently of fit;
  retain immediate Cover/padding/UI assertions so incorrect fit still fails.
- F5 — §2.6/§7: make the suspected race observable with a test-only promise
  barrier around the next real File's createImageBitmap call. Before releasing
  it, assert the old image remains and show the old identity-only wait resolves.
  Then release the actual decoder and require the new image and Cover. No
  arbitrary sleep, retrying assertions on fit, production hook, timeout increase
  or weakened guard. A legacy-wait probe must fail on the stale dimensions;
  disabled-Fill probes must fail on Cover, including the fresh recipient path.
  Browser execution is still needed to confirm this mechanism at publication.
- F6 — §2/§7: existing Playwright executable is absent locally, and system
  Chrome/Chromium is unavailable. Earlier downloads returned Site Unavailable;
  do not repeat blocked downloads. Use existing automatic Linux CI/PG and only
  focused missing browser evidence, preserving exact source identity. Existing
  PNG results apply to unchanged production/PNG content, not to a new PNG run.
  No physical performance measurement or Safari claim follows from this work.
- F7 — no normative gap: preserve input semantics, latest-request-wins, manual
  fit, settings restoration and every prior guard assertion. Proposed write set:
  `guards/live-feedback.test.ts`, this research, the implementation ticket and
  a narrow release-checklist follow-up. No production/spec/fixture/dependency
  changes. Any focused evidence workflow stays on a separate evidence-only
  branch that is not merged. Independent review and owner merge remain required.

Primary reference read 2026-09-30:
https://playwright.dev/docs/api/class-page#page-goto documents same-URL hash
navigation returning no main-resource response; https://playwright.dev/docs/pages
documents separate pages. Repository P-14 determines the required image behavior.
The precise historical interleaving was not captured by the failed run; the
controlled probe must establish the stale-image mechanism without claiming more.

TODO(spec): none. This research is committed before implementation.
