# T-P10t: Screenshot positioning research

Codex, 2026-10-31. Base `f9bdfa40becf1ab745200d09ea2104c4b26fd630`.
Read-only research before planning; no application changes.

## 1. Clauses touched

§2.2–2.7, §4.1, §4.3, §4.6, §4.8–4.9, §7;
P-9, P-13, P-14(1–4), P-21(2–6), P-22, P-23.

## 2. Existing surfaces and findings

- F1: `src/screen/fit.ts:3` fitTransform computes centered contain/cover
  dimensions and the P-9 equal margin. `src/screen/material.ts:36` samples
  from the screen center. There is no image translation or zoom state.
  `src/devices/build.ts:574` retains fit/padding and refreshes the shader at
  line 579. Add image mapping here, without moving the camera or geometry.
- F2: `src/scene.ts:16` StageSettings, `:395` snapshot and `:404`
  prepareSettings own validated rendering settings. `src/settings.ts:16`
  Settings and `:63` apply wrap staged validation; new crop values must travel
  through these contracts, including cloning and recovery, without image copies.
- F3: `src/ui/panel.ts:194` Screen image has fit/padding/color controls.
  `:67` endEdit and `:71` attempt already group continuous edits for P-23.
  Accessible sliders can reuse this path; canvas drag already rotates the
  scene and should not silently become an image editor.
- F4: `src/state/codec.ts:40` decodeV1 rejects any extra top-level fields;
  `:92` snapshotState explicitly projects image-free state. Readable transport
  `src/state/readable.ts:13` has a fixed key allowlist and `:54` fixed defaults.
  P-14/P-21 do not authorize crop fields. A narrow schema amendment is needed
  before implementation, preserving old links and strict unknown-key rejection.
- F5: `src/settings.ts:97` compose retains current user fit; `:103` reset
  restores studio defaults; `:108` prepareUpload chooses cover before mounting.
  `src/main.ts:242–244` prepares, mounts, renders and clears edit history.
  Crop reset belongs to successful image acceptance. Rejected/failed uploads
  must not leave reset crop values on the old image. Latest-request ownership,
  shared-link demo settings and in-tab image preservation need distinct tests.
- F6: `src/state/history.ts:6` uses validated shared snapshots. Extending
  their explicit domain includes crop in Undo/Redo without retaining pixels.
  `src/main.ts:294` immediately hydrates and renders before advancing history;
  crop restores must use the same shader for preview and PNG.

## 3. Gaps

TODO(spec), F1/F4/F5: zoom/position domain, coordinate meaning, contain
behavior, reset/upload semantics and wire fields have no normative contract.
Proposed P-24 resolves these in a standalone planning commit. Implementation
stops at this boundary until the proposal is accepted and merged.
No existing camera framing, export dimensions, image caps, privacy rules,
guards, thresholds or owner-owned baselines need to change.
