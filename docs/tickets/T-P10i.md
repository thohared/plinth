# T-P10i: Bing and Google ownership tags

Author/builder: Codex (GPT-6), 2026-10-26.
Research: [T-P10i-research.md](T-P10i-research.md), F1–F7, committed before
this ticket. Cites §2.2–2.3/§2.6–2.7/§7/§8 T-P10, P-2/P-5/P-19/P-20.
Base: `662db1e0e510363877f3ce496c5be1d0daba7861`.

## Deliverable and write set

Add the exact Bing `msvalidate.01` and Google `google-site-verification`
meta tags issued in the owner's authenticated verification flows for
`https://plinth-phi.vercel.app/`, in the initial `index.html` head (F4–F6).
Retain both tags after successful verification. Update `docs/SEO.md` with
the setup state and remaining provider steps (F2/F7).

Write set: `index.html`, `docs/SEO.md`, this ticket and its research file.
No source/CSS, scripts, dependency, workflow, guard, fixture or specification
changes. No tracking integration, Google Analytics/Tag Manager, new account
feature, DNS change or changes to product copy/canonical/robots/sitemap.
No account identifiers, authentication codes or session data in the repository.

## Acceptance

1. Both source and built HTML contain one instance of each issued tag in the
   head, with exact values. Removing only those two elements from the built
   HTML must reproduce the base HTML byte-for-byte. All other build files,
   including JS/CSS/PNG/robots/sitemap, must match base hashes (F1/F3/F7).
2. Run the unmodified local `npm run ci` and production build; inspect the
   existing SEO guards as part of that run. No new literal-mirroring guard
   is required for this metadata-only change. Preserve all existing assertions.
3. Existing cloud CI/PG workflows must complete for the final head. Inspect
   their evidence; no baseline bless. The unchanged PNG workflow's path
   filter does not trigger on HTML/docs changes. Reuse the previous PNG
   evidence only for the unchanged export code, with explicit provenance and
   matching production assets; do not claim a new-head PNG run.
4. Obtain a fresh-context read-only GitHub review. Merge remains the owner's
   decision. Test/review success is not proof of webmaster verification.
5. After production publication, read the actual public home-page source and
   match both tags. Use each provider's Verify action, then submit the existing
   root sitemap. Record the actual provider status in the PR handoff; pending
   verification, processing, indexing and traffic effects remain pending.

No change to full performance/Safari/physical-device release obligations.
`TODO(spec): none` in this scope (F6).
