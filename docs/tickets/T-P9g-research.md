# T-P9g research — all-side views and generic hardware

Read-only pass, Codex, Linux, 2026-09-21. Base main cdcd80a.
Owner request: view backs/undersides; add cameras, charging ports, speakers,
buttons, laptop ventilation and feet. Explicit implementation approval in chat.

## 1. Clauses touched

§2.1–2.3 (generic/offline/client-only), §2.5–2.7 (planning/review),
§4.2–4.4 (geometry/posing/shadows), §4.6 (unchanged PNG contract),
§4.8–4.9 (custom state and touch controls), §6–7 (performance/evidence),
P-8, P-9, P-11, P-13, P-14, P-15.

## 2. Current surfaces

- F1 — src/camera/poses.ts:22 and src/camera/controller.ts:79: camera orbit
  is limited to the front hemisphere; no all-side interaction. P-11 owns those
  bounds. Extend the contract before implementing; preserve legacy camera orbit.
- F2 — src/scene.ts:224 applyPose floor-corrects actual transformed vertices and
  frames conservatively. Device quaternion already supports any orientation.
  Full model rotation with a stable camera avoids poles, camera flips and floor
  penetration. It needs shadow invalidation, unlike camera-only orbit.
- F3 — src/state/codec.ts and src/scene.ts:prepareSettings serialize/restore a
  normalized custom quaternion in v1. No schema change is needed. Input mode is
  transient UI state; the resulting displayed pose remains shareable/exportable.
- F4 — src/devices/build.ts:buildSlab has a dark backing for the screen recess,
  also visible from the rear; no camera, button, charging or speaker details.
  A separate opaque generic rear cover is needed without changing screenshot UVs.
- F5 — src/devices/build.ts:buildDeck already owns instanced keys and a trackpad;
  buildInto owns the hinge/base. Laptop ports, webcam, vents and feet have no
  surface. Keep the accepted deck and add low-cost parametric hardware.
- F6 — src/devices/build.ts:buildDevice owns update/dispose. New materials must
  be owned once per rig; shared geometry and InstancedMesh buffers need disposal
  on rebuild and teardown. Repeated holes/vents should be instanced.
- F7 — src/scene.ts:175,396,455 instantiate rigs and cache exact local vertices
  by class/shape. Hardware must be installed in every production constructor and
  participate in bounds, floor placement, shadow and output framing.
- F8 — src/ui/panel.ts:123, src/main.ts:261,400 integrate posing. Add Free view
  and Reset view with touch/keyboard accessibility and recovery gates. Four
  named angles, source pixel handling, export size, mobile footer stay unchanged.
- F9 — guards/camera-posing.test.ts, guards/state-share.test.ts and
  scripts/pg-capture.mjs cover old camera, state and baseline cases. Add real
  pointer and round-trip/export evidence, never replace old coverage/fixtures.

## 3. Gaps and disposition

F1/F4/F5 require a standalone P-16 planning amendment, authorized by the owner's
“Uradi sve to”; no implementation starts before that commit. F2/F3 reuse existing
state/framing contracts. F6–F9 need new behavioral/lifecycle tests and actual
screenshots. No third-party hardware assets, paid API, new dependency or network
surface is necessary. Named views keep their accepted camera rules; hardware can
alter silhouettes and therefore PG differences must be disclosed, never blessed
by the builder. Physical mobile performance and Safari remain release gates.

## Implementation finding — F10

`buildInto` cleared children but retained root.position before measuring rebuilt
geometry. New bottom sockets make this observable: after a phone dimension edit,
rig.bounds.min.y was -0.000075 instead of zero. The added lifecycle assertion
failed before the fix. Reset the builder's local position before rebuilding;
Stage still owns its separate world pose/floor correction. This restores the
existing builder contract rather than changing the P-11 floor rule.

## Implementation finding — F11

The unchanged 100-endpoint test exceeds its 5s timeout on both main (9.58s) and
this branch (7.09–8.95s) in this workspace, on Node 24 and Node 22. No assertion
or deadline is changed. CPU profiling identified repeated ExtrudeGeometry vertex,
UV and buffer creation as the dominant cost. A normal-only cache was insufficient
and was discarded before commit. Stage now explicitly requests immutable CPU-only
extrusion templates from the builder (32 entries / 8 MiB cap). Each rig receives
its own BufferGeometry and copied attributes. The direct authoring builder still
creates the extrusion; new tests compare every cached production position, normal,
UV, index and group byte-for-byte against it, and prove disposal/mutation isolation.
This reduces repeated device/Advanced rebuild work without changing rendered data.

F11 also found that the pose support-point cache retained every duplicate triangle
position (UV/normal seams), multiplying work on every drag. Deduplicate exact
local positions per mesh before applying instances when collecting cached points.
No rounding or hull approximation; all unique actual vertices remain. The separate
geometryWorldBounds path continues reading every triangle vertex, preserving its
independence in the existing 100-endpoint/1,500-transition checks.

## F12 — instance buffers across context recovery (2026-09-21)

The full acceptance run exposed a regression in the unchanged state-share
recovery guard. The isolated guard also failed (60s wait for ready), while base
main passed. A served-code logging probe narrowed it to deferred device navigation
after restoration: four `INVALID_OPERATION: delete: object does not belong to this
context` warnings and recovery=`failed`. Restoration without navigation succeeded.

`Stage.releaseGpuResources` disposed geometry/materials but did not dispose
InstancedMesh-owned buffers/listeners. The new repeated phone details introduced
these resources to the default rig; later rig disposal still called old renderer
listeners after restoration. Include InstancedMesh in the existing release set
before renderer reinitialization. The unchanged browser guard is the regression
check; do not change its assertions or timeouts. This is within P-16's resource
ownership/recovery requirement and does not affect rendered geometry.
