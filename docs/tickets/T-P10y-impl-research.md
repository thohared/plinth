# T-P10y-impl research: packaged screenshot editor

Date: 2026-11-06. Author: Codex (GPT-6).
Inspected main: `1717bd6a4c4d9ff96f33506277f3d6feafdc050f`.
Owner authorized PR #67 merge, then requested continuation. PR #67 is merged;
P-28 is now active. This is a read-only implementation research pass, not runtime
implementation or a successful browser validation. No application file, spec,
fixture, dependency pin or workflow was changed.

## 1. Which specification clauses does the ticket touch?

§1/P-19 screenshot-to-PNG scope; §2.1 generic devices; §2.2/P-20/P-28(6)
network/privacy; §2.3/P-28(3–4) temporary session transfer; §2.4/§3 licences
and shared source; §2.5–2.7/§7 protected baselines and independent review.
§4.1/P-9/P-28(1–5) capture and accepted image import; §4.6/P-13 PNG;
§4.8/P-14/P-21/P-22/P-28(7) public sharing versus local scene address;
§4.9 startup/recovery; P-23 upload history boundary. P-24 remains unimplemented
and is preserved as future scope. §6 performance obligations are unchanged.

## 2. Which file:symbol implements each today?

| Contract | Existing surface on inspected main |
| --- | --- |
| Explicit capture and session lifecycle | None. No extension manifest, worker or browser transport exists. |
| Local decode and P-9 cap | `src/screen/load.ts:15 imageBlob`, `:29 validateFormat`, `:42 loadImage`. |
| Latest request wins | `src/screen/load.ts:66 latestImageLoader`. Its return is currently Promise<void>. |
| Image mount, Fill and history | `src/main.ts:238 loadSelectedImage`, `:248 setImage`, `:505 select`; `src/settings.ts:prepareUpload`. |
| Demo startup | `src/screen/demo.ts:loadDemoImages`; `src/main.ts:boot`; `src/startup.ts`. |
| Graphics recovery and export | `src/main.ts:createRecovery/createDownload`, `src/export/`. |
| Settings-only sharing | `src/state/share.ts:createShare`, `src/state/codec.ts`, `src/state/navigation.ts`; integration in `src/main.ts:355–380`. |
| Production-only analytics | `src/analytics.ts:analyticsAllowed/initAnalytics`, imported by main. |
| Image privacy text | `src/ui/panel.ts:146` says everything stays in this tab. Extension needs P-28's narrower transfer explanation. |
| Build and browser acceptance | `vite.config.ts`, `package.json`, `guards/`, `scripts/png-acceptance.mjs`, `scripts/pg-capture.mjs`. No extension build/test yet. |

## 3. What is missing, or exists without a specification clause?

F1. P-28 closes the earlier capture/storage/share specification gaps. The
remaining gap is implementation, not a request for another spec amendment.
Do not restart T-P10y planning or edit PLINTH_SPEC.md during implementation.

F2. A loaded extension must be built from the existing editor source. A separate
Vite target should exclude the analytics module entirely, emit local assets and
strict packaged-script CSP, and retain the web target unchanged. Strip web-only
metadata/structured data from the extension shell as needed; do not copy and
maintain another renderer or dist directory. Build the worker separately.
Manifest permissions must be exactly activeTab/storage/alarms, minimum Chrome
120, no external/connectable resources or content scripts.

F3. Demo startup cannot currently consume chrome-extension: URLs:
imageBlob accepts only data/blob or same-origin HTTP(S). Use a narrowly trusted
packaged-asset-to-Blob adapter for the two committed demo assets. Do not expand
the general image loader to arbitrary extension or remote URLs. Include an
offline real-editor startup test, including failed asset/decode/GPU startup.
The implementation write set needs `src/screen/demo.ts` or an equivalent
build-target alias in addition to the previously listed load.ts/main.ts files.

F4. Capture authorization must follow an actual extension action, not a worker
function invoked through a test hook. Validate source tab/window/HTTP(S)/incognito
before and after capture and track activation/navigation/removal during capture.
A switch away and back still invalidates the result. Never persist the source
URL or title. A second action during a pending transfer reports busy.
Unsupported/internal/Store pages produce a local explanation.

F5. Use one serialized session record with request ID, exact editor tab, expiry,
status and PNG only, bounded to 8 MiB of UTF-8 JSON. Check actual quota/storage
errors as well as the product cap. Restrict session access to trusted contexts.
Create/bind the editor without a claim race (for example create an inactive
blank tab, persist its binding, then navigate it to the packaged editor).
A one-time claim must persist its consumed phase before returning pixels.
Match sender extension ID, exact tab, top frame, packaged URL and request.
No source data or request token enters the scene hash/shared link.

F6. Worker restart must recover a valid pending transfer from session storage;
a delivered claim must not become replayable. Check expiry at startup and every
operation. Delete on ACK, reported error, close and expiry; recreate a missing
expiry alarm after worker startup. Avoid newer alarm properties unsupported in
Chrome 120. A late alarm must never extend claim/ACK validity. Browser restart/
extension reload is intentionally not screenshot persistence. All errors shown
to users are fixed safe messages, not raw API errors containing sensitive data.

F7. Promise<void> resolution is not proof of image acceptance: current older
successful/failed decodes resolve after supersession. Return an explicit
accepted/superseded result and preserve errors as failures; only accepted sends
ACK. Recheck disposed/recovery/export state before mount. Do not acknowledge a
no-op mount after disposal. Track manual input from editor startup so even an
early manual choice wins over a delayed capture claim, not just a decode
already in progress. Preserve current source bitmap ownership and cleanup.
Render/GPU failure must not be relabeled successful capture.

F8. Copy link needs an explicit build-target public base while automatic
navigation stays local. Keep the existing encoder and query stripping, preserve
web/preview origin/path behavior, and test both with independent literal URLs.
The extension privacy text must explain the short-lived local session transfer,
that visible sensitive content can appear in a capture, and that exported PNGs
are user-controlled files. Do not say that capture pixels never leave the tab
during the temporary worker-to-editor transfer.

F9. Acceptance must exercise a genuinely loaded MV3 extension and real action
permission grant: asymmetric local HTTP fixture -> browser capture -> decoded
image in editor -> PNG downloaded through UI, with independent pixel checks.
Chromium's experimental DevTools Extensions.triggerAction may be useful for
automation, but its availability/permission behavior must be proven in the test
browser first; a direct onClicked-handler call is not an equivalent oracle.
Cover request races, close, restart, late expiry, oversized/failed storage,
wrong sender/tab/frame, replay, newer manual input and startup/GPU failures.
Negative seeds must break ownership, ACK correctness, public-URL privacy and
manifest permissions. Check zero HTTP(S) from editor/worker, packaged CSP/assets,
offline operation and exact image omission from logs/share/storage surfaces.

F10. Expanded implementation-only write set, justified by F2/F3/F8/F9:
`extension/**`; separate extension Vite/build/package configuration and scripts;
narrow main/load/demo/share/panel integration plus tests; additive extension
guards; extension test discovery/typechecking in Vite/TypeScript configuration;
README and extension install/privacy/support documents; ticket/evidence.
No spec/fixture/workflow/dependency-pin changes. No Store upload, public listing,
new CI workflow, automatic merge or physical-performance/Safari claim.

F11. Build-environment gate is currently BLOCKED, despite partial successes:

- Git clone/fetch read succeeded. Local Git push dry-run failed for missing
  credentials. GitHub connector merge/branch writes work; do not expose or
  invent a local credential.
- Node v24.22.1 (satisfies repo >=22), npm 11.9.0. Linux npm ci succeeded
  with locked dependencies (59 packages).
- npm run build succeeded (existing >700 kB chunk warning).
- npm run typecheck succeeded.
- npm run test succeeded: 39 files, 287 tests.
- Playwright's CDN install returned HTML rather than a valid archive. The same
  pinned Chrome for Testing 153.0.8010.12 archive was successfully downloaded
  from the official chrome-for-testing-public Google storage URL and unpacked.
- Actual Chromium launch fails before opening a page:
  `FATAL:chrome/browser/process_singleton_posix.cc:297
  socket() failed: Operation not permitted (1)`.
  Full local npm run ci was attempted with PLINTH_CHROMIUM_PATH; browser suite
  setup fails. Skipped tests after failed setup are NOT passing browser tests.
- A request to execute the local smoke test outside the restricted sandbox
  was automatically rejected: sandbox approval/escalation is disabled by the
  current permission policy. No sandbox bypass or weaker guard was used.
- PR #67 head 1ce2134b02b29630edc3b02ddb517f1273b269cf has successful cloud CI
  42279775678 and PG 42279775654. These are evidence for the reviewed plan,
  not local environment acceptance or extension runtime validation.

Per HANDOFF's build-surface acceptance and T-P10y's preflight requirement,
do not open the implementation ticket or claim the environment is ready until
a supported Linux surface can run Chromium and pass the full baseline CI.
This research can be retained on its branch. No executable extension exists yet.
Use the connector for scoped Git publication if local Git credentials remain
unavailable; that does not solve the Chromium execution restriction.

### Resume procedure

Fetch main and this branch; check for newer merged work/other writers. Reuse this
research, recheck changed sources and read the complete repo instructions.
On the selected Linux build surface run npm ci, install the matching Playwright
Chromium, npm run ci and npm run build against the recorded fresh base. Record
the exact SHA and actual outputs. Then author T-P10y-impl, implement P-28, run
candidate CI/web/extension tests and real captures, and open one implementation
PR for an independent fresh-context MERGE/FIXUP review. Owner decides its merge
and later Store publication. Do not repeat completed planning or claim skipped
checks as success.

### Primary documentation checked on 2026-11-06

- https://developer.chrome.com/docs/extensions/reference/api/tabs
- https://developer.chrome.com/docs/extensions/reference/api/storage
- https://developer.chrome.com/docs/extensions/reference/api/alarms
- https://playwright.dev/docs/chrome-extensions
- https://chromedevtools.github.io/devtools-protocol/tot/Extensions/

The earlier T-P10y research/review records activeTab and CSP sources.
Current documentation also shows APIs newer than the minimum browser;
implementation must use only Chrome-120-supported APIs. No current market
volume, ranking probability, install count or Store acceptance is inferred.
