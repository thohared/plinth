# T-P10a — PNG release presentation

Author: Codex, 2026-09-29. Research: T-P10a-research.md F1–F6.
Scope: §1/P-10 truthful positioning, §2 local original assets, §7 review,
§8/T-P10 presentation and submission preparation. This is not full T-P10 acceptance.

## Changes

- README describes available PNG export, with no working-video promise (F1).
- index.html gains English descriptions and social metadata; local SVG favicon
  and 1200×630 social-card PNG plus editable SVG source (F2).
- docs/SUBMISSION.md holds draft copy/storyboard, not a submitted entry (F3).
- docs/RELEASE-CHECKLIST.md separates verified product work from open release
  evidence, and links the scope/performance decision proposal (F4–F6).

Write set: README.md, index.html, public/favicon.svg, public/social-card.svg,
public/social-card.png, this ticket, docs/SUBMISSION.md,
docs/RELEASE-CHECKLIST.md, docs/tickets/T-P10-decisions-proposal.md.
Research is a preceding commit. No spec, fixtures, source, dependencies,
workflow, test threshold or rendering changes.

## Acceptance

Build and existing no-network/denylist guards pass. Inspect the social card
at native resolution; confirm its actual PNG dimensions and opacity, local
favicon validity, and built asset presence. Keep content English and avoid
unsupported performance, Safari, competition eligibility or release-PASS claims.
No new guard is warranted for static metadata; no seeded-new-guard claim.
Existing cloud CI/PG and fresh independent review remain required.

TODO(spec): research F4/F6 remain proposed in the decision document. Metadata
describes current behavior and does not declare that the release gate changed.
