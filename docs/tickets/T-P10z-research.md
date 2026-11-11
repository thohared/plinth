# T-P10z research: static site checklist

Author: Codex. Base: 1717bd6a4c4d9ff96f33506277f3d6feafdc050f.
Owner clarification 2026-11-07 restricts scope to icons and a custom 404.

- F1: §8 T-P10 includes metadata/favicon. index.html currently links only
  public/favicon.svg. Derive PNG/ICO variants from this original artwork.
- F2: P-2 hosting is Vercel. public/404.html is copied into dist by Vite;
  Vercel serves dist/404.html for unmatched paths, retaining HTTP 404.
  Primary source: https://vercel.com/kb/guide/custom-404-page.
  Hosted status must be verified separately from Vite preview routing.
- F3: §2/P-20 remain unchanged. Script-free 404 needs no analytics or backend.
  Keep a same-tab root link, noindex, unique title/description and local icons.
- F4: Loading/CTA observations are outside this ticket after the owner's
  clarification. Preserve src and guards byte-for-byte against the base.

No new rendering/state contract or specification amendment is needed for
static release assets. No privacy page, dependency, workflow or fixture edits.
