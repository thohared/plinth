# T-P10s: Undo/Redo research
Codex (GPT-6), 2026-10-31. Base45b5439c401620b90a5197dee311a39f580d482e.

1. Clauses: §2.2–2.7, §4.1/4.3/4.8/4.9, §7, P-13, P-14(1–5), P-18, P-19, P-21/P-22.
2. Surfaces and findings:
- F1: src/settings.ts SettingsStore owns validated scene settings and image-preserving reset, but no undo/redo stacks.
- F2: stage.onStateChange emits animation and pointer updates. Recording each notification would create frame-sized history; gestures need explicit transaction boundaries.
- F3: src/ui/shortcuts.ts rejects Ctrl/Meta combinations. Undo requires a narrow exception, preserving native editing in inputs, selects and editable content.
- F4: src/state/navigation.ts owns replaceState and hydration. Browser Back/Forward is not studio undo; successful external navigation must establish a fresh history baseline.
- F5: prepareUpload selects Fill screen. History must not retain images or undo an accepted upload into old fitting defaults. Accepted upload clears history; failed upload preserves it.
- F6: P-14 describes URL reload, explicitly not undo history; P-22 defines which selections synchronize immediately. New history domain and shortcut exceptions need a separate planning amendment before implementation.
3. Gap: TODO(spec) F2–F6, resolved only when proposed P-23 is accepted.
No implementation, dependencies, tests, fixtures or workflows changed. Existing PR57 is separate.

## Implementation follow-up (approved P-23, base ca9ce628)

Clauses: P-23(1–7), P-22(1–4), P-21(3–6), P-18, P-14(2–5),
§2.2–2.7, §4.1/4.3/4.8/4.9, §7. P-23 is now merged; F6 is resolved.

- F7: `src/settings.ts:63` apply validates stage/studio candidates; `:86`
  hydrate validates the shared DTO and restores immediately, with recovery on
  failure. `src/state/codec.ts:92` snapshotState explicitly excludes images
  and projects either the displayed transition frame or selected named target.
  Reuse this domain for snapshots; no new serialization or dependencies.
- F8: `src/ui/panel.ts:71` attempt is the common discrete-edit boundary;
  numeric `:92` and colour `:105` currently apply every input. They need explicit
  grouped gesture boundaries without changing existing live preview validation.
  `src/camera/controller.ts:75` move and `:89` release delimit pointer edits;
  ending an active pointer before history traversal prevents resumed stale drags.
- F9: `src/main.ts:231` upload mount calls prepareUpload before setImage.
  Clear history only after accepted setImage, never at decode or prepareUpload.
  Track outstanding loader requests to gate traversal while uploading.
  `:299` navigation apply must clear history only after hydrate/render/checkGl.
- F10: `src/main.ts:422` controller and `:432` shortcuts are explicit user
  entry points. `src/ui/shortcuts.ts:7` rejects modifiers today; permit only
  the P-23 combinations after editable/IME/defaultPrevented/repeat checks.
- F11: `src/main.ts:316` navigation subscriber already cancels delayed writes
  for selected settings. Undo restoration needs a final immediate update after
  successful GL verification, including custom views. Existing exporter busy
  and recovery state provide traversal gates; changes to them are not edits.
- F12: No history implementation exists. Store pairs of before/after snapshots
  so interrupted transitions restore the actual before frame. Compare intended
  before/after to exclude no-op selections during animation. Commit cursor only
  after successful restore. Keep 50 edits and discard redo only for real edits.

No remaining specification gap identified. Tests must independently exercise
history limit/branching/failure, gestures, shortcut exclusions, accepted/rejected
uploads/navigation and real desktop/mobile Undo→Redo→PNG. Existing guards,
PG/PNG thresholds and owner-only baselines remain untouched.
