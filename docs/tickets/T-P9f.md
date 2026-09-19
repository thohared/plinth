# T-P9f — mobile/tablet live-site fixes

Author/build: Codex (backend identifier not exposed), Linux. Base e436113.
Owner authorized implementation on 2026-09-19 after collecting all comments.
Research: T-P9f-research.md F1–F8, committed before this ticket.
Cites §2, §4.1–4.6, §4.8–4.9, §7, P-9/P-10/P-11/P-13/P-14/P-15.

## Acceptance

1. Host defaults: phone 1:1, tablet 4:5, desktop 16:9; zero output padding.
   A look retains the current output aspect and sets output padding to zero.
   Reset uses the startup host default; resize never resets chosen/shared state.
   PG remains explicit and deterministic. Device geometry/fill remains accepted.
2. Visible mobile Plinth wordmark outside the exported image, settings closed.
3. Ordinary fresh uploads default to Fill screen. Explicit Fit image/padding and
   restored links retain their semantics. Explain crop versus fit. Demo/PG remain
   uncropped; do not alter image pixels, shaders or dimensions.
4. Whole Download PNG touch target visible without scrolling export feedback on
   phone and tablet; status may scroll independently. Preserve canvas dimensions,
   accessible last settings control, errors, reload and native download action.
5. Pointer orbit eases into existing legal limits, reverses immediately and does
   not collect excess drag. No change to numeric orbit API, geometry or view schema.
6. Exactly four looks: Studio phone, Dark laptop, Clean tablet, Warm card.
   Native full-frame thumbnails without baked white/gray bars. Browser still
   available in Device and old shared URLs. Legacy composition query alias works.
7. New focused regression tests and failing mutation seeds, full npm run ci and
   build on Linux. Preserve old PG/PNG cases and thresholds; normal cloud runs only.
   Independent review in a fresh session. Baselines remain read-only.

## Write set and evidence

Use F8's exact write set. New browser evidence captures belong to the existing
PG script, with no baseline replacement. Native screenshots of phone home,
phone download, tablet download and looks are owner-facing evidence. No paid API,
dependency, workflow, spec, source demo PNG, shader or device model change.

Implementation and verification results will be appended here before publication.
