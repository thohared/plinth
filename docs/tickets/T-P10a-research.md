# T-P10a research — PNG release presentation

Author: Codex (backend identifier not exposed), 2026-09-29.
Base: 4506c7f7280c99eb3e123f1031aa13f80491f55b.
Shared knowledge: astra-runner 2df99332f5e4cd14d464146900969e91405193bd.
Owner directed a PNG release without animation, then authorized continuing the
release package. This research precedes implementation. No release PASS claimed.

## 1. Clauses touched

§1/P-10(1,5): truthful claims for shipped capabilities. §2.1–2.4: generic,
local, original assets without dependencies. §6/P-10(6): preserve the unfulfilled
measured gate. §7: independent review. §8/T-P10: README, metadata, favicon,
submission preparation. §10: proposed confirmation of the existing Plinth name.

## 2. Existing surfaces

- README.md:6–11 promises a four-second clip and calls motion/video upcoming.
- index.html:7–10 has only the Plinth title and an empty data favicon; no social metadata.
- public/demo.png and public/demo-landscape.png are the reviewed Ledger inputs.
- src/export/ and scripts/png-acceptance.mjs implement PNG export/acceptance.
- scripts/pg-capture.mjs and fixtures/pg/ implement the visual gate.
- PLINTH_SPEC.md §6 specifies a five-run workload ending in float; no release
  performance report or T-P8 implementation exists on this base.
- docs/RELEASE-PLAN.md is a dated plan, not current implementation evidence.

## 3. Findings

F1. README's leading clip promise exceeds shipped functionality. Describe PNG
and explicitly say motion/video are unavailable; do not call the release complete.
F2. Add local original SVG favicon and an original 1200×630 PNG social card,
description, Open Graph and Twitter metadata. Absolute production social URLs
are crawler metadata, not runtime requests or a change to Copy link behavior.
F3. Record submission copy and a short reproducible demo storyboard. Keep owner
identity, actual submission and official deadline/terms verification pending.
The official builders page was read on 2026-09-29; it asks for owner name, public
demo and public repository. The terms URL was inaccessible to the web tool;
do not treat the historical deadline or field limits as freshly verified.
Sources: https://canivibecodeit.com/thebuildgames/builders and
https://canivibecodeit.com/thebuildgames/terms .
F4. Owner's no-animation direction conflicts with P-10's mandatory T-P8a and
§6's float segment. Prepare a concrete decision proposal, not an implicit spec
edit or a fabricated performance PASS. The presentation changes do not depend
on changing the gate: they describe current availability only.
F5. Real Safari/mobile evidence and physical-device performance remain separate
from Linux/SwiftShader correctness. Prior owner observations are not a measured
five-run report. Do not weaken tests or rerun export jobs for unchanged code.
F6. Keep the product name Plinth in this candidate; formal §10 resolution is in
the decision proposal. This is not a rename.

TODO(spec): F4/F6 apply to final release scope, not the narrow metadata build.
