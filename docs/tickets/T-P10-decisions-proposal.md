# Proposed PNG release scope and performance contract

Status: PROPOSAL, not an active P-entry. Author: Codex, 2026-09-29.
Research: T-P10a F4–F6. Owner already chose to omit animation; the concrete
replacement performance workload below still needs approval. Do not mark §6 PASS.

1. Confirm the existing product name **Plinth** for this release (§10).
2. Ship the current screenshot-to-PNG workflow. Defer T-P8a motion preview and
   T-P8b video export beyond this competition release, including Space/Shift+V.
   Preserve manual Free view and existing pose transitions. Replace the §1
   release promise with screenshot-to-studio-lit-3D-image plus PNG export.
3. Replace only the missing float step of §6 with a named, repeated interaction
   workload using shipped features. Proposed 60-second measured segment after
   explicit shader warm-up: 0–10s cycle all five devices at 2-second intervals;
   10–18s cycle four scene presets at 2-second intervals; 18–24s select Front,
   Top and Lean at 2-second intervals; 24–60s enable Free view and alternate
   horizontal and vertical drags every 3 seconds, on laptop, with the default
   demo. Specify exact coordinates, viewport, DPR and timestamps in the later
   measurement ticket before collecting results; freeze that trace for all runs.
4. Retain five runs, ≥1,500 measured frame samples per run, p50/p99, hitches
   above 50ms, CoV, sample counts and hardware/browser/viewport/DPR disclosure.
   Keep §6 desktop 8.3/16.7ms and phone 16.7/33.3ms budgets, zero hitches,
   and LOW-TRUST for CoV >20% or n<3. Report insufficient-frame runs explicitly;
   do not fill samples, remove slow frames or substitute software GPU results
   for physical hardware evidence. Document the frame-time measurement method
   separately from displayed refresh cadence before making a budget verdict.
5. Preserve PNG/PG acceptance and real browser/mobile checks. Linux automated
   correctness is not physical-device performance or Safari verification.
   Unperformed checks stay pending. A measured failure requires remediation or
   an explicit owner release decision; changing the workload is not a waiver.
6. T-P10 media may use a static product image and a recorded real interaction
   walkthrough. A demonstration recording is not an in-app animation/export
   feature. Never manufacture a recording or present a storyboard as a capture.

After approval, transfer the accepted contract into a standalone spec-only
P-entry commit and update the release plan. Do not silently edit the original
requirements inside implementation work. Approval alone is neither test PASS,
independent review, merge nor competition submission.
