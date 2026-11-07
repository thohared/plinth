# T-P10z: complete the site checklist

Author: Codex. Research F1–F5 in T-P10z-research.md; §2, §4.1, §4.9,
§8 T-P10, P-2/P-9/P-13/P-14/P-20. Owner excludes a separate privacy page.

Deliver a script-free custom 404 with same-tab root link, noindex and unique
metadata. Keep missing paths as 404, not redirects to a successful editor page.
Add 16/32/48 ICO, 32 PNG and 180 Apple touch icon from the original SVG,
with matching head links. No PWA/install promise or extra dependency at runtime.
Show Loading image while the current upload decodes. Preserve latest-wins,
error/downscale notices and the previously accepted image on failure.
Verify startup/upload/export statuses and CTA bounds at desktop/mobile sizes.
No unrelated renderer/state/privacy/analytics/extension changes.

Acceptance: npm run ci, build, focused negative probes, asset dimensions and
original-artwork check, static 404 mobile/desktop accessibility and root link,
independent fresh review. Vercel missing-path HTTP status needs preview/live
hosting verification; Vite preview alone does not prove it. Preserve PG/PNG
cases and thresholds; no baseline edits. Publish only after owner merge.

## Validation in this environment

- Typecheck, 288 unit tests, production build and git diff --check PASS.
- Original SVG converted with CairoSVG; PNG dimensions 32/180 and ICO entries
  16/32/48 verified with Pillow. No project dependency/pin changed.
- Full npm run ci attempted: browser-dependent guards cannot launch here.
  Pinned Chromium download returned invalid archives. A separately downloaded
  Chrome 157 also fails: socket() Operation not permitted in process_singleton.
  This is an environment block, not a browser-test PASS. No assertions skipped
  or thresholds weakened to bypass it. Cloud CI/PG/PNG and preview routing,
  visual CTA/404 checks remain pending. Keep PR draft until evidence passes.
- Existing upload race test now asserts the exact two pending notices plus one
  terminal notice; image ownership assertions are unchanged. Added stale-error
  test proves an older failure cannot clear the latest pending message.
