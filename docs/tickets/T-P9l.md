# T-P9l — keep mobile settings steady while dragging a slider

Author/builder: Codex (backend identifier not exposed), Linux, 2026-09-28.
Research: T-P9l-research.md F1–F7. Cites §4.5, §4.9, P-13(5), P-14(5), §2 and §7.

User reported all five devices/downloads appear OK, except the settings menu
moves down while adjusting Space around device on the phone.

## Write set and behavior

Only src/ui/panel.css, src/main.ts's resize/event wiring, additive
guards/panel.test.ts coverage and this ticket/research. Reserve native
range-input touch gestures with touch-action:none. Ordinary settings updates
must not scroll to a stale focused panel element. Reveal focus on actual
window/visualViewport resize; preserve panel.ts focusin/breakpoint behavior.
Keep pan-y on the settings container, native keyboard editing, all control
values, camera, PNG, upload and layout geometry unchanged. No spec/fixture,
dependency, workflow, animation or video work.

## Acceptance

- Real CDP touches start on output padding: first vertical-first, then a fresh
  horizontal-first diagonal drag. scrollTop stays within 1px on every move;
  the horizontal-first drag changes padding,
  pose/upload survive, sheet and export button rectangles are unchanged.
- ArrowRight keeps the native 1% increment; a new swipe outside controls still
  scrolls. Existing panel/resize/focus/input/export guards remain unchanged.
- PLINTH_PANEL_SEED=slider-scroll restores native pan eligibility on the range
  and must fail the new stability assertion. PLINTH_PANEL_SEED=focus-scroll
  restores the old resize reveal in served main.ts and must fail the same
  guard at actual value editing. Neither probe changes tracked production files.
- A real viewport shrink keeps the focused range within the sheet; its native
  ArrowRight step and Tab/Shift+Tab order remain. The viewport-focus seed removes
  only the host-event focus reveal and must fail field visibility.
- npm run ci and build; reuse existing Linux PR evidence where relevant.
  The installed Chromium Headless Shell now runs local guards through the
  existing executable-path override. No physical Android or
  Safari PASS is claimed; owner confirms the phone behavior after deployment.
- Independent review is separate. No automatic merge or fixture blessing.

## CI follow-up (2026-09-28)

Head 6fb19081daaebe0b892e66c1dbca5bc56b787c3c: CI run 36464900764
passed 105 guards and failed the new guard's padding-change assertion (0 > 0).
The vertical-first gesture passed every 1px scroll-stability assertion. PG and
PNG capture workflows succeeded on that head.

Chromium's native SliderContainerElement locks the gesture direction on its
first move; a horizontal range ignores a vertical-first gesture's later moves.
Source inspected: https://chromium.googlesource.com/chromium/src/+/1c2c691d179d9cc4cb80a819759992cb1eec176b/third_party/blink/renderer/core/html/forms/slider_thumb_element.cc
(HandleTouchEvent, GetDirection, CanSlide). This explains the observed failure;
touch-action prevents panel panning but does not replace native range semantics.

Keep the entire original vertical-first gesture and all its stability checks;
add a separate horizontal-first diagonal gesture before the existing value,
state and layout assertions. Both gestures enforce the same 1px limit. The
initial production fix stayed CSS-only. This corrected an invalid combined gesture
expectation without dropping the regression that should reject the old behavior.
That candidate remained incomplete, as the follow-up below demonstrates.

## Stale-focus follow-up (2026-09-28)

Owner feedback: the offered preview still moves the menu. Head 1662df0c CI
36471216739 confirms a 625px scroll during the horizontal-first edit; 105 other
guards pass, PG/PNG succeed. Research F5–F7 is committed before this correction.

resize() was revealing document.activeElement on every settings change.
Touch editing left focus on sheet-close and scrolled the panel from 637 to 12.
Move the existing reveal into the actual host viewport event adapter, keeping
render/settings/ResizeObserver updates scroll-neutral. Preserve the focusin
handler, layout dimensions, camera/export math and all original guard assertions.

The Chromium 141 Headless Shell reproduces the original 625px failure locally,
matching cloud CI. This is a separate supported binary already in the environment;
the previous full-Chromium socket failure is retained as a setup limitation.
Fresh-head cloud acceptance, independent review and physical-phone confirmation
remain separate requirements.

### Focused evidence for this correction

Linux, Node 24.19.0, Chromium Headless Shell 141.0.7390.37, SwiftShader.
The installed Playwright manifest requests Chromium 153.0.8010.12 (revision
1243); this local browser override is not that pinned cloud environment.
Use the existing PLINTH_CHROMIUM_PATH override, then:

| Command after `npm run guards -- guards/panel.test.ts` | Result |
|---|---|
| `-t T-P9l` | Both focused cases PASS before the full acceptance run below. |
| `PLINTH_PANEL_SEED=focus-scroll`, `-t 'diagonal slider'` | Expected FAIL: 625px movement exceeds the unchanged 1px limit. |
| `PLINTH_PANEL_SEED=slider-scroll`, same filter | Expected FAIL: 5px movement exceeds the same 1px limit. |
| `PLINTH_PANEL_SEED=viewport-focus`, `-t 'actual viewport shrink'` | Expected FAIL: field bottom 432.421875 is outside sheet bottom 328. |

Set each seed as an environment variable before npm. Served-source seeds each
assert exactly one replacement. The first viewport-seed attempt matched zero
replacements because Vite uses different indentation; that setup failure is not
negative proof. After accepting whitespace in the seed regex, its replacement
count passes and field visibility fails as shown above. No production mutation,
assertion removal or tolerance increase is involved.

Typecheck, build and diff whitespace checks PASS. The existing 700kB Vite bundle
warning remains; it is not a new regression or a performance PASS.

The first complete local `npm run ci` attempt finishes with 100/107 guards
passing (898.23s), then stops before typecheck/unit stages. Six failures are
the unchanged PG two-load byte-equality test and the five unchanged P-13
device alpha matrix cases. A seventh is the existing T-P5 source contract,
which requires the original resize listener registration literally. Preserve
that registration and add an abort-owned focus-reveal listener after it;
the T-P5 guard itself stays byte-for-byte unchanged. This is not a full CI PASS.

Control run on unchanged prior head 1662df0c, isolated worktree, same local
browser and dependencies: all five P-13 device alpha cases also FAIL at the
same max-alpha assertion (16/38/15/16/27 versus limit 1); its PG two-load case
passes. Thus the alpha failures predate this correction in this environment,
but the one PG failure is not explained or excused by that comparison. Preserve
both observations and require the pin-matched cloud gates on the final head.

After preserving the original resize binding, the focused final-source run
passes 9 tests: all six panel guards, both unchanged camera-source guards and
the original PG two-load case (68.79s). The initial PG failure did not recur
in this isolated check; its cause remains unproven and the earlier failed full
run is not reclassified as green. The state-share file was included with a
nonmatching name filter and was skipped in this run, not counted as passing.

Final follow-up validation on the published source:
- Existing mobile share fallback/viewport/breakpoint case: 1 PASS (9.66s).
- Full unit suite: 236/236 PASS, 34 files (8.76s); typecheck/build/diff checks PASS.
- Repeated final-source negatives: focus-scroll FAIL at 625 > 1, slider-scroll
  FAIL at 20 > 1, viewport-focus FAIL at 432.421875 > 328. Both served-source
  replacement assertions pass first. The pan amount differs from the earlier
  5px sample but fails the same unchanged limit at the same gesture phase.
- This scoped verification resolves the resize-registration failure and
  verifies the control correction. It does not replace the failed full local
  run with a PASS; final-head cloud CI/PG/PNG and fresh review remain required.

## Fresh review prompt

Review this PR against §§4.5/4.9, P-13(5), P-14(5) and T-P9l research F1–F7.
Confirm head. Check native diagonal range gestures, normal sheet scrolling,
keyboard editing and preserved layout/state. Run the focused guard with
PLINTH_PANEL_SEED=slider-scroll and focus-scroll to prove it rejects both old
behaviors; use viewport-focus to prove the new accessibility check. Verify
served-source replacement counts before accepting a seeded failure. Use the
existing full Linux CI rather than dispatching duplicate workflows. Report
MERGE/FIXUP with file:line evidence as a GitHub review (COMMENT if same-author
approval is blocked). No edits, merge, deploy or baseline changes.
