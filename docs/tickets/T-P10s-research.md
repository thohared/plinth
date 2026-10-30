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
