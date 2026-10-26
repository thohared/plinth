# T-P10i research: webmaster ownership verification

Author: Codex (GPT-6), 2026-10-26. Read-only research completed before the
implementation ticket. Base: `662db1e0e510363877f3ce496c5be1d0daba7861`
(T-P10h / PR #48 merged and deployed).

## 1. Cited clauses

§2.2–2.3 (runtime network and upload privacy), §2.6–2.7 (independent review
and research), §7 (acceptance), §8 T-P10 (public-site metadata), P-2
(production URL/deployment), P-5 (paper trail), P-19 (PNG scope) and P-20
(narrow Analytics exception). This continues the owner's instruction to
finish Bing Webmaster Tools and Google Search Console setup after T-P10h.

## 2. Existing implementation surfaces

- F1 — `index.html:4–40` is the initial static head, with canonical,
  descriptive metadata and WebApplication JSON-LD. No webmaster ownership
  meta tags exist. `public/robots.txt:4` points to the public sitemap;
  `public/sitemap.xml:4` contains only the canonical root.
- F2 — `docs/SEO.md:23–44` separates deployed SEO from webmaster account
  verification and submission. `guards/seo.test.ts:55–139` checks the
  production-build HTML, robots/XML and guide before/after initialization.
- F3 — `src/analytics.ts` and the existing privacy/network guards implement
  P-20; they are outside this ticket. Static ownership meta tags execute no
  code and do not add a tracker, script, request, account feature or backend.

## 3. Gaps and primary evidence

- F4 — On 2026-10-26, the owner completed Microsoft's device approval in
  the browser used for this task. Bing showed the signed-in site-add flow;
  after one transient add-site error, Plinth reached its verification panel.
  The panel for exactly `https://plinth-phi.vercel.app/` supplied an
  `msvalidate.01` meta tag. This is an issued public site-verification value,
  not an invented token or the owner's sign-in code. The account is not yet
  verified for the site, and no sitemap submission has succeeded.
- F5 — Google Search Console was already signed in. Adding the exact HTTPS
  root as a URL-prefix property exposed its HTML-tag verification method and
  issued a `google-site-verification` value. No Domain property or parent
  `vercel.app` DNS access is required. No other owner's tag exists to replace.
  Google's official instructions require the issued tag in the public home
  page head, checking the live source and then using Verify; the tag must
  remain for periodic rechecks. Verification is not an indexing verdict.
- F6 — Bing's live panel likewise directs placing its tag in the home-page
  head and retaining it after verification. Publish the two values exactly
  as issued, without account email, auth code, OAuth URL or session data.
  These tags belong to public-site metadata (§8 T-P10); they do not change
  the §2/P-20 privacy or product contracts. `TODO(spec): none` in this scope.
- F7 — Existing SEO guards already protect canonical, content and crawl
  surfaces. This two-tag change needs source/build inspection and eventual
  provider verification, not a new test that only repeats two literals.
  Preserve all guards/workflows and run required local CI/build plus the
  existing cloud CI/PG gates. PNG's existing path filter does not select this
  HTML/docs-only change. Compare production assets byte-for-byte against the
  base and reuse its PNG evidence for the unchanged export implementation;
  do not label that result as a new-head PNG run. Browser-account success must be recorded
  separately from build/test success; do not claim submission before the UI
  confirms it. Full performance and physical-device obligations are unchanged.

Primary sources inspected 2026-10-26:

- [Google: Verify your site ownership, HTML tag](https://support.google.com/webmasters/answer/9008080?hl=en#meta_tag_verification)
- [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Bing: Add and verify site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b)
  and the authenticated Add & verify site panel for the exact Plinth root.
  The help page's search-readable shell required JavaScript; the live panel
  supplied the operative tag/placement instructions.

No third-party source code, dependency, paid API, screenshot or account data
is imported into the application. No Three.js technique is needed here.
