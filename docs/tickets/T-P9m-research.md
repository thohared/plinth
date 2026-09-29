# T-P9m research — portrait demo reading duration

Author: Codex (backend identifier not exposed), 2026-09-29.
Base: 821ed6502b04d268553135e0cb6ee0a7e800804a.
Owner requests changing "4h 20m" to "2h 30m" on the starting screenshot.

1. Clauses: §4.1/P-9 demo input, §2.1–2.3 asset/runtime constraints, §7 visual evidence.
2. Current surfaces: src/screen/demo.ts:loadDemoImages loads public/demo.png for phone
   and public/demo-landscape.png for wide devices; src/scene.ts:setDemoImages owns the
   two textures. The duration is raster text in public/demo.png, not a code string.
3. Findings:
   - F1: Portrait input is an opaque RGB PNG, 845×1862. Preserve dimensions and path
     so no image-selection, fit, texture, layout, renderer or export code changes.
   - F2: No editable text/vector source for this portrait was found in src/, public/
     or scripts/. Built-in imagegen can replace the text without a paid API.
     A raster regeneration is not a pixel-identical edit outside the label; inspect
     layout/text visually and disclose expected PG differences.
   - F3: This is owner-directed demo copy, not a new runtime contract; TODO(spec): none.
     Landscape demo and static look thumbnails are outside this starting-phone edit.
     Existing fixtures and thresholds stay unchanged. PG visual differences must
     be evaluated, not blessed automatically.
