# Performance testing

Application reference: `8577219ff16358820770fdd658931feda44b4c06` (2026-09-30).
Read §6/P-19 and [T-P10c](tickets/T-P10c.md) before formal collection.

## What is available

| Check | What it establishes | Current limit |
| --- | --- | --- |
| CI / PG / PNG | Automated behavior, rendering comparisons and export correctness | Cloud software rendering is not target-device speed. |
| Existing desktop collector | Actual-render CPU wall time and asynchronous GPU elapsed time, input receipts and raw samples | Partial metrics only; always LOW-TRUST, releaseGate=pending. |
| Chrome Performance recording | A trace useful for investigating long tasks, frames and interactions | Exploratory until a complete-frame method and repeatable protocol are reviewed. |
| Final §6/P-19 evidence | Five physical runs, complete-frame statistics and the required target devices | Complete-frame method, phone trace and physical results remain open. |

The saved physical preflight from September 30 collected **0/5 runs**. It ran
in a cloud container with no physical desktop connection. Opening this chat
in a browser on a PC does not give its execution container access to that PC's GPU.

## Quick local inspection in Chrome

This can be performed on the owner's existing desktop OS without changing the
collector. It is a useful diagnostic recording, not formal release acceptance.

1. Open https://plinth-phi.vercel.app/ in desktop Chrome. Record the deployment
   SHA if verified, date/time, OS/browser version, actual CPU/GPU/RAM, display
   refresh rate and power mode. If identity is unavailable, mark it unknown.
   Use the default demo and select 4:5. Keep the same window size across trials.
2. Close unrelated heavy work. Record hardware acceleration/renderer details
   from `chrome://gpu`; do not infer the renderer from the graphics-card name.
3. Open DevTools, select **Performance**, and undock it so recording controls
   do not resize the app. Use no artificial CPU or network throttling. Record
   the settings and actual viewport/DPR; do not claim the collector's fixed
   1280×800/DPR 1 layout unless it has actually been established.
4. Warm up by visiting all devices, scenes and angles and dragging Free view.
   Restore Phone / Soft studio / Three-quarter with Free view off, then settle.
5. Start recording. For roughly 60 seconds, visit the five devices, then the
   four lighting scenes, then Front / Top / Lean, then select Laptop, enable
   Free view and alternate horizontal and vertical drags. Keep the app visible.
6. Stop and save/export the raw trace from the Performance toolbar. Preserve
   pauses, slow interactions and errors. Repeat five times under the same
   conditions, with the same warm-up. Name files by trial and keep an environment
   note with them; do not keep only the fastest recording.

Manual timing and layout are not the automated frozen trace. DevTools also
adds recording overhead. These traces can guide the next measurement-method
ticket; average FPS or a smooth-looking recording alone cannot close §6/P-19.
Do not run this capture simultaneously with the collector below.

## Automated desktop diagnostic prerequisites

Run locally in the physical desktop's graphical session, using its hardware
GPU and an installed Chrome. Linux is the development/CI default. Do not install
another OS just to follow this guide. A cloud terminal, headless session, remote
software renderer, emulated phone or unverified virtual graphics adapter is not
the required physical target. Record any remote-display/virtualization layer.

Requirements: Git, supported Node (package.json requires >=22), locked npm
dependencies, an available installed Chrome, and free loopback port 4175.
`--channel chrome` selects that installed Chrome; installing Playwright's
Chromium alone does not install the branded Chrome channel. Do not overwrite a
personal browser installation as a troubleshooting shortcut.

Disclose actual CPU/GPU/RAM/OS, Chrome version, WebGL renderer, display Hz,
power mode and driver where available. Keep the window foreground and visible;
do not interact manually or open DevTools during collector runs. Verify the
saved renderer against the physical target afterwards. SwiftShader, llvmpipe
or another software renderer cannot be labeled a physical GPU measurement.

### Native Windows: preflight required

This revision has **not** been validated as a native-Windows collector. Static
inspection found that its Vite transform compares a normalized module ID with
an OS-native resolved path. Forward slashes and Windows backslashes can prevent
the transform from running. Its source anchor also requires LF line endings;
a read-only CRLF-string probe failed that anchor check.

First attempt only the build preflight in a clean LF checkout. On errors such
as `Benchmark build did not instrument exactly one module` or
`Expected exactly one main render anchor`, preserve the logs and stop before
measurement. Resolve collector portability in a focused implementation PR and
review it; do not silently patch a measured checkout or claim zero timings.
WSL is not automatic hardware proof either: its browser/display/GPU path must
be disclosed and verified. The Chrome inspection procedure above remains a
separate way to collect useful local traces while portability is resolved.

### Pin a clean checkout and check the instrumented build

From an existing local repository, use a new, unused worktree path. Preserve
any existing changes. These Git/Node commands describe the pinned reference;
if a later source is deliberately selected, record that SHA and its differences.

```sh
git fetch origin
git -c core.autocrlf=false worktree add --detach ../plinth-perf-8577219 8577219ff16358820770fdd658931feda44b4c06
cd ../plinth-perf-8577219
git rev-parse HEAD "HEAD^{tree}"
git status --porcelain
npm ci --no-audit --no-fund
node scripts/performance.mjs --build-only --out ../plinth-build-preflight-8577219-01
```

The identity must match the selected reference and `git status --porcelain`
must print nothing before collection; preserve existing work if it does not.
Use a new preflight output name on every attempt. Save terminal output and exit
code. Stop on dependency/build errors. The build-only command creates no browser
measurement and proves neither GPU access nor native-Windows compatibility of
the later browser path. After a successful preflight, verify the actual Chrome
launch/renderer in the target environment before starting timed collection.

### Collect five runs after preflight succeeds

From the clean worktree root, this **Bash** example preserves the combined log
and exit code outside the source checkout. It is not a PowerShell script.
Replace the hardware placeholders with observed values before running.

```bash
perfHardware='physical desktop; CPU=REPLACE; GPU=REPLACE; RAM=REPLACE; OS=REPLACE; Chrome=REPLACE; renderer=REPLACE; displayHz=REPLACE; power=REPLACE'
case "$perfHardware" in *REPLACE*) echo 'Fill in observed hardware first.'; exit 2 ;; esac
perfOut="../plinth-perf-$(date -u +%Y%m%dT%H%M%SZ)"
if [ -e "$perfOut" ] || [ -e "${perfOut}.log" ]; then exit 2; fi
set -o pipefail
node scripts/performance.mjs --channel chrome --hardware "$perfHardware" --out "$perfOut" 2>&1 | tee "${perfOut}.log"
perfExit=${PIPESTATUS[0]}
printf '%s\n' "$perfExit" > "${perfOut}.exit-code.txt"
```

Keep output outside the Git checkout: the manifest records dirty status after
creating its output directory. Do not pre-create `--out`; the collector refuses
to overwrite an existing directory. In PowerShell, a local operator must preserve
`$LASTEXITCODE` immediately after the native command and save the same log/data;
this does not remove the Windows preflight requirement.

Do not add `--smoke`, `--headless` or `--software` for physical collection.
The existing collector automatically performs five full runs. Each includes a
60-second unmeasured warm-up, reset/settle and 60-second measured trace, so the
five trials take **at least about ten minutes**, plus startup, build and delays.
Do not cancel simply because a run is slow; retain every failed/partial attempt.

The automated v2 workload is fixed at viewport 1280×800, DPR 1, explicit 4:5
canvas x=160/y=0/640×800. It changes devices at 0/2/4/6/8s, scenes at
10/12/14/16s, poses at 18/20/22s, and drags Laptop in Free view from 24–60s.
Exact coordinates, input slots and receipt requirements are in T-P10c; do not
change them or add synthetic frames to reach a sample count.

## Evidence to return

Keep the whole output directory together with its external log and exit-code
file: `manifest.json`, `run-1.json` through `run-5.json`, `summary.json`, the
instrumented `site/` build, and any `failure.json` / partial run files that exist.
Missing files stay missing; do not manufacture them or overwrite failed trials.
For manual inspection, return all raw Chrome traces and environment/settings notes.

The reviewer checks source SHA/tree/dirty state, probe/build hashes, physical
renderer, all warm-ups and five windows, 4:5 layout before/after, trusted drag
receipts with changed rotation, raw/missing samples, errors and lifecycle events.
Recompute nearest-rank p50/p99, hitches >50ms, per-run counts, medians and sample
CoV. Report skipped/late inputs and insufficient actual-render samples.

§6/P-19 retains desktop p50/p99 budgets of 8.3/16.7ms and phone 16.7/33.3ms,
zero hitches >50ms, five runs and >=1,500 measured frame samples per run; CoV
>20% or n<3 is LOW-TRUST. **Do not compare partial CPU/GPU timers to these
complete-frame budgets, add CPU+GPU times, or count rAF cadence as render work.**
Even successful current-collector output remains LOW-TRUST/releaseGate=pending.
Phone measurement needs its own frozen physical trace; Safari needs real Apple
hardware. Neither is established by the desktop collector.

## Sources and next implementation boundary

Read on 2026-09-30: [Playwright browser channels](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge),
[Vite path normalization](https://vite.dev/guide/api-plugin.html#path-normalization),
and [Chrome Performance reference](https://developer.chrome.com/docs/devtools/performance/reference).
The Plinth specification and T-P10c define this project's acceptance, not those
general tool references. Native-Windows portability and complete-frame measurement
are targeted follow-up work; this documentation adds neither implementation.
