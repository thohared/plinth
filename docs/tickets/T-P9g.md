# T-P9g — Free view and generic device details

Codex builder, Linux, base cdcd80a. Owner authorized 2026-09-21.
Research F1–F9 committed first; P-16 is a standalone planning commit.
Cites §2.1–2.7, §4.2–4.4, §4.6, §4.8–4.9, §6–7,
P-8/P-9/P-11/P-13/P-14/P-15/P-16.

## Acceptance

1. Free view is an explicit touch/mouse tool, initially off; unconstrained model
   rotation can reveal back and underside, with stable camera up and floor.
   Preserve legacy orbit. Reset view returns to Three-quarter and exits mode;
   named angles/looks/Reset look exit too. Preserve image and other settings.
2. Continuous normalized quaternion math, finite rejection/no partial mutation,
   immediate reverse without overshoot, interrupt from the current displayed
   pose. Safe framing, export, resize and custom v1 links cover all orientations.
3. Phone/tablet have opaque backs, generic cameras, buttons, charging ports,
   microphone/speaker openings. Laptop has webcam, ports, ventilation, feet and
   its existing visible touchpad. No physical hardware on Browser/Card.
4. Parametric details, material/resource ownership, instanced repetition;
   geometry bounds and shadows include all details, including after spec edits.
   At most 30 added draws / 40k added submitted vertices per rig.
5. Preserve all source screenshot and PNG dimensions/filtering contracts,
   accepted camera fill, UI footer/defaults, no-network policy, old v1 links.
6. Add meaningful unit and real pointer browser guards, seeded failing probe,
   actual local high-resolution front/rear/underside and mobile images, round-trip
   and PNG evidence. Run npm run ci and build before publication. Report metrics
   and physical-device limitations. No baseline replacement or claimed self-review.

## Write set

src/devices/{build,details} and tests; src/camera/{poses,controller} and tests;
src/scene.ts and all-side tests; src/main.ts; src/ui/panel.ts and CSS;
additive guards/device-details.test.ts; additive scripts/device-details-capture.mjs
and pg-capture named captures; README and this ticket/research/evidence.
No dependency, workflow, source demo image, shader, export pipeline or fixture edits.
P-16 is already committed separately and is read-only during implementation.

## Review

One builder, one PR, independent fresh-session review. Existing PG differences
from added hardware must be inspected and owner-blessed separately if required.
Physical mobile/Safari and the full §6 performance gate remain release obligations.
