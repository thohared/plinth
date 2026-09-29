# T-P9m — starting portrait duration

Author: Codex (backend identifier not exposed), 2026-09-29.
Owner request: change "4h 20m" to "2h 30m" on the starting demo screenshot.
Cites §4.1/P-9, §2.1–2.3 and §7; research T-P9m-research F1–F3.

## Write set
Only public/demo.png and these two ticket/research documents.
Keep runtime, landscape demo, composition thumbnails, dependencies, tests,
specification and fixtures unchanged. No automatic baseline blessing.

## Implementation and validation
- Built-in imagegen edited the existing portrait, instructed to replace only
  the reading duration with exact text "2h 30m" while preserving typography,
  framing and all other content. No paid API was invoked.
- Before/after images visually inspected: requested text is correct; all
  sections, other copy, colors and overall layout remain present. Generative
  raster editing can slightly alter surrounding pixels; this is not a
  byte-identical patch outside the duration.
- Opaque RGB PNG, dimensions unchanged at 845×1862.
- SHA-256: 501806464129b1fcd098daa593856b24a740dac4dfa4539956d0c1d3cd2f6805.
- Git blob: 2577c608a83b9a0dccad4edbcf84febbd4d4b559.
- npm run build PASS (existing >700kB chunk warning); git diff --check PASS.
  Output JS/CSS names remain index-mKY0XFwz.js / index-DhyIrSNn.css.
- No new behavior or test was added for this content-only replacement.
  Full local CI was not rerun; normal exact-head cloud checks remain pending.
  Previous commit test successes are not new-asset test results.
- Expected phone PG differences require review against unchanged fixtures.
  Independent review, owner visual approval and merge remain separate.
