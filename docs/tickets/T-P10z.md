# T-P10z: static site icons and 404 page only

Owner clarified 2026-11-07: all application behavior stays unchanged. Add only
favicon variants and a custom 404 page. No privacy page, loading feedback,
CTA changes or application/test changes.

Scope: index.html icon links; public/favicon.ico (16/32/48),
public/favicon-32x32.png, public/apple-touch-icon.png (180), public/404.html.
Artwork is derived from the existing unmodified favicon.svg.
404 is script-free with unique metadata, noindex and a same-tab root link.
No redirects, catch-all editor rewrite, analytics or new runtime dependency.

Research: T-P10z-research.md; §8 T-P10, P-2, §2/P-20.
The earlier loading and CTA additions are fully reverted to base, including
all modified guards and lifecycle tests. Their failed CI is historical evidence,
not a pass for this narrowed candidate. New exact-head checks and independent
review remain required. No merge or production publication yet.

Hosted nested missing-path HTTP 404 for the unchanged page was verified on
preview deployment dpl_JWxpfhXXXkcNiUdFFmV7DKkfoFg8. Original PNG/ICO artwork
provenance and dimensions were independently verified. Local browser launch
is blocked by socket permissions; do not claim a local browser pass.
