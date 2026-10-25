# T-P10g — Retain production Analytics without leaking studio state

Research: [T-P10g-research.md](T-P10g-research.md), F1–F10.
Cites §2.2–2.4, §2.6–2.7, §4.1/§4.6/§4.8, §7 and P-20.

## Scope and implementation

- F1/F4/F6: replace unconditional injection with a production/canonical-root
  gate. Query-bearing URLs and detailed referrers suppress initialization;
  localhost, previews and development builds remain analytics-free.
- F5/F6/F8: return a fresh literal root pageview from beforeSend; reject custom
  events. Use the explicit same-origin production script and a no-referrer meta
  policy. The integration has no image/settings access or interaction events.
- F3: pin the existing 2.0.1 SDK and document MIT, including the licence generator.
- F7: keep the old guards byte-for-byte. New browser tests use the real bundled
  SDK on a routed production origin, with only the remote collector replaced.
  Exercise native image input, keyboard selection, Copy link and actual PNG
  download, plus Analytics blocking and no-Analytics environments.

Write set: src/analytics.ts and unit tests; narrow src/main.ts integration;
guards/analytics.test.ts; index.html referrer policy; package/lock pin;
README privacy wording; LICENSES.md and scripts/licenses.mjs; this ticket.
Research and P-20 are prior separate commits. No existing guards, fixtures,
workflows, rendering code or image/state/export implementation changes.

## Acceptance and negative controls

Use the existing automatic Linux CI, PG and PNG workflows on the exact PR tree.
The current host has no Linux runtime; no local Linux PASS is claimed (F10).
Windows diagnostic preflight: typecheck, 27 Analytics unit cases and all eight
new browser cases passed using installed Chrome with SwiftShader. The default
Playwright browser was absent; this is not the pinned Linux acceptance run.
The isolated diagnostic dependency copy uses the existing pinned tooling and
the 2.0.1 npm archive verified against the lockfile SHA-512 integrity.
Licence regeneration also passes; the generator now handles file URLs on both
platforms and retains the existing Three.js shader attribution.
Run the focused new guard with PLINTH_ANALYTICS_SEED set to each of
gate, url, event, referrer and header. Each must fail the corresponding assertion;
the default run must pass. Seeds affect only temporary Vite output / routed HTML,
not source or fixtures. Independent reviewer repeats targeted negative controls.

The collector double checks the SDK's real beforeSend registration and outbound
test requests. It does not certify the mutable provider-hosted script. Live
payload/dashboard validation remains pending because project/team access is
denied (F9). A later public fetch succeeded (2026-10-25): the deployed script
matches https://va.vercel-scripts.com/v1/script.js, SHA-256
`050e35bf7e6e96590f2a9de114c14ff792806ed28457b3248762944350c0ba4c`.
Inspection confirms beforeSend precedes the pageview payload, default intake is
same-origin, and referrer is read separately. This does not establish dashboard
delivery or release acceptance. The mutable hosted script is not pinned by npm.
Existing physical-device/Safari/performance obligations remain separate.

TODO(spec): resolved by the separate P-20 amendment. No broader exception sought.
Independent review and final automated evidence are recorded on the PR.
