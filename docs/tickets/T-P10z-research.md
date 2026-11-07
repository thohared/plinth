# T-P10z research: site checklist

Author: Codex. Base: 1717bd6a4c4d9ff96f33506277f3d6feafdc050f.
Owner request 2026-11-07: complete the checklist except a separate privacy page.

## Clauses and existing surfaces

- F1: §8 T-P10 covers release metadata/favicon; index.html links only
  public/favicon.svg. Preserve that original artwork and add raster fallbacks.
- F2: P-2 selects Vercel. No custom error document exists. A static
  public/404.html is copied into dist by Vite. Vercel documents dist/404.html
  as its unmatched-path fallback: https://vercel.com/kb/guide/custom-404-page.
  No catch-all rewrite to the editor, no redirect/soft-404. Verify hosted
  HTTP status separately; Vite preview's SPA fallback is not Vercel routing.
- F3: §4.1/P-9 latestImageLoader in src/screen/load.ts owns request ordering
  and completion/error notices, but emits no pending notice. Put pending text
  there so stale requests cannot overwrite newer status. P-13 export already
  emits Preparing PNG and panel.ts exposes busy/status; no export redesign.
- F4: §4.9/P-14 mobile-pick and desktop pick already exist. guards/startup.test.ts
  delays demo loading and verifies the mobile control remains stable. Add
  explicit viewport bounds checks rather than assuming visible means in frame.
- F5: §2/P-20 remain intact: no new backend/AI endpoint, analytics events or
  privacy page. 404 has no scripts/analytics and does not echo the requested URL.

## Gaps

No new rendering/state contract is needed. Static release assets refine the
existing T-P10/P-2 scope. Do not change the specification, fixtures, pins or
existing test thresholds. Physical Safari/phone and live Vercel routing are
separate from local browser and unit evidence.
