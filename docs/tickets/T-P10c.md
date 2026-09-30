# T-P10c: reproducible desktop render diagnostics

Base: 2b54ce0aad8c344c5d4f112185f767df702330d0. Research:
T-P10c-research.md F1–F6, committed before this ticket. Scope: §2.2–2.3,
§2.6–2.7, §6/P-19(3–5), §7 and §8/T-P10.

Deliver an opt-in, local benchmark build and five-run desktop diagnostic
collector. Production source, specification, guards, fixtures and dependencies
remain unchanged. Append regression/smoke steps to the existing Linux CI job
and retain raw smoke JSON as an artifact; do not create a second workflow.
This is measurement preparation, not the
completed release gate. No PASS/FAIL against §6 from partial CPU/GPU metrics.

## Frozen desktop trace v2 (before corrected collection)

Normal UI, default demo, 1280×800 CSS viewport, DPR 1, explicitly selected 4:5 output,
default SMAA. No pg mode, QA setters, clock mocking or continuous render loop.
Fresh page/context for each of five runs. Wait for plinthReady, select 4:5
through the product aspect control, and assert canvas x=160, y=0, width=640,
height=800 CSS pixels and 640×800 backing pixels. Record these resolved values,
aspect, viewport and DPR and assert them again before and after measurement.
The manifest records the same frozen expectations. Then execute
one complete unmeasured trace below, restore phone/soft-studio/hero with Free
view off, and settle for 2 seconds. This explicit warm-up includes device,
scene, pose and Free view paths, in addition to studio.ready shader warm-up.

| Target time | Action through product controls |
| --- | --- |
| 0, 2, 4, 6, 8 s | Device phone, tablet, laptop, browser, card |
| 10, 12, 14, 16 s | Scene soft-studio, dark-glass, warm-sunset, clean-white |
| 18, 20, 22 s | Angle front, top, lean |
| 24 s | Select laptop, enable Free view, begin drag 0 |
| 24 + 3k s, k=0…11 | Begin drag k: horizontal if even, vertical if odd |
| 60 s | End measured window; release pointer; drain pending GPU queries |

Coordinates are in the canvas bounding rectangle: horizontal from (20%,50%)
to (80%,50%); vertical from (50%,20%) to (50%,80%). These equations freeze
coordinates before collection; record the resolved CSS-pixel rectangle and
endpoints and reject layout changes. Move at planned 60 Hz steps j=1…179,
fraction j/180, for each three-second drag. Release/reposition between drags.
The final scheduled position is 179/180 of the path, not an extra endpoint
move after the segment. Playwright mouse input drives the real pointer handler.
Do not replay missed points in a burst: record skipped input slots and actual
host timestamps/lateness. Browser event timestamps are recorded separately.
The host/browser start handshake duration bounds clock alignment uncertainty.

Review 5366806869 found that v1's first smoke (artifact 11096600652) actually
used the normal desktop 16:9 default, 960×540. That historical evidence is
retained as a mismatched v1 smoke; it is not relabeled as a 4:5 run. F7–F8 in
the research follow-up govern these corrections. All other timings and drag
equations remain the same; the v2 identifier separates corrected collection.

Smoke mode scales all trace times by 0.1 and uses one run; it is explicitly
not P-19 evidence. Headed hardware Chrome is the default. Headless or forced
SwiftShader requires explicit flags and is diagnostic evidence only.

## Measurement and interpretation

- The build transform wraps only the existing main.ts studio.render call.
  A missing/ambiguous anchor fails the build. The normal build has no probe.
- CPU wall ms brackets studio.render; GPU elapsed ms uses asynchronous WebGL2
  timer queries. Retain every render initiated inside the 60-second window,
  including a slow call finishing beyond it. Unsupported/disjoint/timed-out
  GPU timings remain null with reasons, not zero. No gl.finish or spin waits.
- Both metrics exclude parts of the full UI-to-presentation path. They cannot
  be added, nor interpreted as the §6 frame metric. Per-metric >50 ms counts
  are diagnostic hitches only. rAF intervals are cadence diagnostics; they
  never contribute to the ≥1,500 actual-render sample count.
- Save raw samples, event receipts, errors, visibility/context-loss events,
  scheduled/actual input, source SHA/tree, dirty status, probe/build hashes,
  browser, renderer strings, host description, viewport/DPR and canvas size.
- Drag acceptance requires a trusted stage pointerdown followed by a nonzero
  move with the same pointer and primary button held, while Free view is active.
  Record pointer/button state and displayed rotation before the input handler.
  A matching render must occur during that exact move's dispatch and observe a
  changed rotation afterwards. Hover, reposition, cancellation, unchanged views
  and unrelated later renders do not qualify. This proves at least one measured
  drag, not completion of every planned input; skipped/late slots stay visible.
- Report per-run count/p50/p99/hitches and median of run p50/p99, sample CoV
  (sample standard deviation / mean) for each metric, n and missing counts.
  Nearest-rank quantiles; preserve all outliers and incomplete runs. Flag
  <1,500 real renders, fewer than five runs, CoV >20%, missing GPU data, timing
  drift, skipped input, page errors, hidden page and context loss. Never average
  away hitches. Status stays LOW-TRUST; release gate remains pending, even if
  diagnostic numbers look fast. The complete frame/presentation method and
  actual desktop/mid-tier-phone reports require later work (research F2/F5).
- Instrumentation has overhead: two clocks per render, timer query commands,
  input/event logging, view snapshots and rAF polling. View snapshots are outside
  the CPU timer/query bracket but still add work to the instrumented workload.
  No overhead subtraction. Do not compare
  instrumented partial metrics directly with a production budget.

## Use and acceptance

Install the locked dependencies and Playwright Chromium as for existing guards.
From repo root:

```sh
node scripts/performance.mjs --build-only --out /tmp/plinth-perf-build
node --test scripts/performance.test.mjs
node scripts/performance.mjs --smoke --headless --software --out /tmp/plinth-perf-smoke --hardware 'cloud software diagnostic'
node scripts/performance.mjs --out reports/perf/desktop-v2 --hardware 'physical desktop: CPU, GPU, RAM, display Hz, power mode' --channel chrome
```

Use an otherwise idle physical host, foreground window and disclosed display
refresh/power mode. Do not call desktop viewport emulation a phone run. The
runner refuses to overwrite an existing output directory. A failed run writes
partial evidence and exits nonzero. Successful collection means files exist,
not that §6 passed. Keep report files together for review; do not cherry-pick.

Acceptance: meaningful synthetic regression cases for slow/missing/insufficient
samples and disjoint/unsupported queries; instrumented build succeeds; normal
`npm run ci` and build; a real browser smoke run in the existing CI job.
Local unavailable-browser evidence must be recorded; it does not replace CI.
No new guard. Independent fresh-session GitHub review required. PNG/PG/Safari
and physical performance requirements remain unchanged. TODO(spec): none for
this diagnostic-only scope; no release verdict authorized by this ticket.

## PR #41 focused fixup validation

Review 5366806869 findings 1–2 are addressed by explicit aspect preparation and
the pressed-canvas/changed-render receipt check. Local Linux: 12 diagnostic
regressions, 236 unit tests, typecheck, normal build and instrumented build pass.
The smoke attempt stops at browser launch because Playwright Chromium is absent;
no local browser/guard PASS is claimed. The new head still requires the existing
remote CI/PG jobs, a newly inspected v2 smoke artifact and independent re-review.
No duplicate workflow dispatch, production edit, fixture or threshold change.
