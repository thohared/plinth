# T-P10s: Undo/Redo implementation

Builder: Codex (GPT-6), 2026-10-31. Base ca9ce628.
Research: T-P10s-research.md F1–F12; approved P-23(1–7).

Implement an image-free, 50-edit in-memory history, visible accessible Undo/Redo
controls and specified shortcuts. Capture displayed before frames and named
result targets; restore through validated immediate hydration and existing error
recovery. Failed restores leave the cursor unchanged. Group live sliders,
color edits and canvas drags; numeric edits commit on change/blur. Preserve
native editable-control undo. Reset and pose/device shortcuts are edits.

Successful upload/navigation establishes a baseline. Failed upload/navigation
does not clear history. Gate traversal during upload/export/recovery. End active
gestures and exit Free view on traversal. Update the readable URL immediately
only after successful restoration. No persistence, image copies or dependencies.

Write set: src/state/history.ts and its tests; src/main.ts; src/ui/panel.ts;
src/ui/shortcuts.ts and its tests; src/camera/controller.ts and its tests;
src/styles.css if target sizing requires it; additive guards/undo-redo.test.ts;
this ticket/research. Do not modify spec, fixtures, existing guard assertions,
workflows or unrelated release documentation.

Acceptance: independent literal unit expectations for 50-edit cap, no-ops,
branching, failed edits/restores, grouped edits and interrupted poses. Browser
journeys at 1280 and 390 px exercise actual controls, Undo/Redo/PNG, image
identity, custom framing, immediate URL, navigation/upload boundaries and native
editing. Seed history/gesture/restore defects and confirm failure. Run npm run ci,
build and existing PG/PNG gates; inspect visual evidence. Fresh-context review
posted on PR is mandatory before requesting owner merge. Linux/SwiftShader
results do not claim physical-device performance or Safari acceptance.
