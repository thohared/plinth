# T-P10d — Fill screen for every new screenshot

Author: Codex. Linux, 2026-09-30.
Base: fetched main `cb47c39a59b67b75254121b0b46b9b8784079fd3` (PR #41 merged).
Owner request: default Screen image / Image fit to Fill screen whenever a
screenshot is inserted, avoiding the white bands produced by Fit image.

## Clauses, implementation and gaps

- F1 — §4.1 / P-9: `src/screen/fit.ts` implements correct Contain/Cover
  sampling. Contain may leave bands when source and screen aspect ratios differ.
  The requested default is Cover, not stretching or changing these algorithms.
- F2 — §4.1 / P-10(3): `src/main.ts:230–242` calls
  `settings.prepareUpload()` after successful latest-request-wins decoding, just
  before mounting an accepted user image. The normal editor enables
  `fillUploads`; PG keeps its explicit fit semantics. File, drop and paste share
  this mount path. `src/settings.ts:39,82,110–119` tracks mutable
  `automaticUploadFit`; applying a fit (including a shared link or the first
  automatic Cover) disables it. Thus an earlier Contain choice can survive a
  later upload. The flag is unnecessary under the owner's new instruction:
  every accepted normal-editor upload should apply Cover.
- F3 — §4.8 / P-14: hydration and history still restore the saved fit exactly,
  including for an existing upload. Device and composition changes still retain
  a user's current-image fit. A newly accepted image is an explicit editing
  action that now starts at Cover. This supersedes only the cross-upload
  preference in T-P9f F3/F10; manual Contain remains available after import.
  Preserve padding/color, source bytes, image dimensions and loader ordering.
- F4 — §2.7 / §7: `guards/live-feedback.test.ts:66–88` currently encodes the
  old cross-upload preference and does not wait for a replacement upload to
  finish. Extend it to observe distinct replacement dimensions before asserting
  Cover, and retain its current-image Contain/composition/shared-link assertions.
  In `guards/demo-edges.test.ts:29–37`, select Contain after importing, keeping
  all five device/resource/fit assertions intact. No thresholds or cases removed.
  Add settings regressions proving repeated upload defaults, hydration boundaries
  and unsuccessful/stale decode isolation. Old code must fail the new regression.
- F5 — §2 / §7: no normative gap. P-10(3) delegates default interaction semantics
  to tickets; P-9 supports Cover and P-14 still restores settings before further
  editing. No spec, fixture, shader, device, dependency or workflow modification.
  Only settings, focused unit/browser tests and this ticket's paper trail change.
  Local Chromium was unavailable in the preceding task; use existing automatic
  cloud checks if still unavailable, and report local/physical evidence separately.

Sources: current repository, cited specification clauses, T-P9f ticket/research
and the owner's new instruction. No external API or library changes.
