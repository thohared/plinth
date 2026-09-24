# T-P9h research — shallow frame edges

2026-09-24; Linux, one builder. Fetched before investigation. Implementation base:
`cdcd80a6bda46b35d691bf926d759177b6f4e335` (main). Observed PR #31 head:
`dbe9550b59ed7fb8b001bce6975d4655272d4054`. This is a separate rendering fix;
it neither includes nor approves PR #31's device hardware and Free view changes.

## 1. Clauses touched

- §2.1–2.7, §3: unchanged generic devices, local rendering, dependency pin,
  research first and independent review.
- §4.4.5–6 / P-6: per-material tone mapping, default SMAA and opt-in MSAA.
- §4.5–4.6 / P-13: shared preview/export finishing, straight-alpha PNG,
  fixed output dimensions and no hidden supersampling.
- §6–7: bounded rendering work, deterministic DPR-1 captures, unchanged
  acceptance thresholds and owner-only baseline blessing.
- P-11/P-15: preserve accepted framing and phone fill.

## 2. Existing implementation and findings

**F1 — current acceptance is not a new visual approval.** Independent review
[5276256174](https://github.com/thohared/plinth/pull/31#pullrequestreview-5276256174)
closed PR #31's code finding 1. Its remaining FIXUP is owner image acceptance.
Freshly checked runs: CI 35650922803 SUCCESS, PNG 35650922804 SUCCESS,
PG 35650922856 FAILURE (73 captures, 9 differences, no missing baselines).
They apply to the PR #31 head above, not this forthcoming implementation.
No workflow was dispatched or rerun during research.

**F2 — original captures distinguish color/alpha from diff overlays.** The saved
owner review document contains 73 original CI PNGs plus four older local
resolution probes. All 73 original PNG SHA-256 values were independently
matched against its embedded receipt. 72 originals are fully opaque;
only `background-transparent.png` contains non-opaque pixels. Red diff pixels
and faded comparison backgrounds must not be presented as product screenshots.
Original source: PG artifact 10662229675, run 35650922856. Its recorded ZIP SHA is
`9ae13163fc02f0a1ccd254dc8cf6413f99e2af1ac425a5bce938bc1e82b96f5e`;
the ZIP itself was not downloaded or independently rehashed this session.

**F3 — resolution is evidence, not permission to supersample.** The earlier
1280×800 / 2560×1600 Browser captures show less stair stepping at higher resolution.
For x=420..869 in 1280-pixel coordinates, searching y=150..269 for RGB contrast
over 30 against the clear corner, binary edge residual RMS falls from 0.2853 to
0.1441 display pixels. This is a diagnostic on existing images, not a new render
or a perceptual acceptance test. `src/main.ts:82–84,140–141` fixes PG DPR 1 and
caps live DPR at 2. `src/export/preflight.ts` owns P-13 output dimensions.
P-13 forbids silently adding a second supersampling/downsampling stage.

**F4 — bounded SMAA search truncates shallow edges.**
`src/scene/pipeline.ts:120–126` constructs the default SMAA pass and installs
the alpha correction. Pinned Three.js 0.185.1
`examples/jsm/shaders/SMAAShader.js:141,173,225–287` limits horizontal and vertical
edge searches to eight two-pixel steps. Long, nearly horizontal frame edges
outlast that search. The pipeline and alpha adapter are identical on main and
PR #31; PR #31 did not introduce this limit.

**F5 — a controlled same-resolution probe improves the reported edge.** A
served-response-only change set the existing weights material's search limit
to 32. Four fresh captures used PR #31 production code, Browser/Phone,
soft-studio, PG 1280×800, DPR 1: original eight steps and candidate 32.
Linux / Node 24.19.0 / Chromium 153.0.8010.0 / ANGLE Vulkan SwiftShader;
zero page or console errors, exactly one shader-construction replacement per
candidate. No repository production file was changed during the probe.

For Browser's straight top segment x=420..869, y=150..269, interpolate the first
30/255 RGB-contrast crossing between neighboring rows, then fit a straight
line. RMS perpendicular-in-y residual: **0.197609 → 0.095866 pixels** (51.5%
reduction). Maximum residual: **0.311605 → 0.194078 pixels**. Largest adjacent
column jump: **0.142857 → 0.083333 pixels**. The binary-only contour does not
measure antialias coverage and must not be used to claim this improvement.
The result establishes this one shallow-edge problem; it does not prove every
reported phone bevel or every device/pose is visually accepted.

**F6 — preserve the alpha and color contracts.**
`src/scene/alphaSmaa.ts:8–33` version-checks and modifies only neighborhood
blend association in gamma-2.2 space. `pipeline.ts:79–86,116–119` retains the
half-float target and separate MSAA path. A search-limit correction should use
a small fail-closed adapter and leave blend expressions, edge threshold,
textures, target count, screenshot UVs, geometry and export dimensions alone.
Existing `guards/output-alpha.test.ts`, `guards/screen-exempt.test.ts`,
`guards/png-export.test.ts` and `scripts/png-acceptance.mjs` remain required.

**F7 — performance and ownership.** Raising the search bound adds shader work
only along detected edges; existing early exits remain. It adds no passes,
render targets, geometry or texture memory. Relative SwiftShader timings may
describe this controlled workload, but cannot satisfy §6's desktop/phone GPU
gate. Measure the candidate, retain that limitation, and do not add a live DPR
increase. Shared Three.js vault Entry 27 supports explicit render-state
ownership and measured changes, not an unmeasured resolution policy.

**F8 — reproducible tooling limitations.** The pinned Playwright browser
download failed with empty/invalid archives. A workspace-only
`@sparticuz/chromium@153.0.0` supplied Chromium 153.0.8010.0. Its archives were
extracted without restoring file ownership; no application dependency changed.
Separate execution calls have isolated loopback servers here, so the successful
probe started Vite and Chromium in the same process tree. A cloud browser could
not reach the earlier local server; that failure is not product evidence.

## 3. Gaps and proposed scope

**F9 — no spec amendment is needed for a bounded SMAA implementation fix.**
P-6 prescribes SMAA, not the upstream eight-step default. Implement a 32-step
search using the existing pinned weights material, with fail-closed compatibility
checks and a production-pixel regression that fails on the old eight-step path.
Retain the original alpha oracle and all existing gates. The diagnostic contour
threshold is a regression fixture, not a replacement PG acceptance standard.

No changed contract is proposed. Hidden supersampling, default MSAA, new camera
fill, hardware changes and baseline replacement are outside this ticket. New
PG differences require normal inspection and owner blessing if over threshold.
PR #31 remains draft pending its own visual acceptance. Required T-P8a motion,
conditional T-P8b export and T-P10 release performance remain separate work.
