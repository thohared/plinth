# T-P9j research — stable Free view distance

Base e17cf5c. Owner requested correction after observing forward/backward motion.

- F1: scene.rotate calls calculateFrame with each rotated exact AABB. Its reference
  fill and corner safety solve change distance on every pointer event.
- F2: 72 horizontal samples per full turn at aspect 1 measured max/min distance:
  phone 1.196, tablet 1.224, laptop 1.735, browser 1.186, card 1.241.
- F3: Keeping the previous distance is unsafe and history-dependent. Instead use
  a rotation-invariant enclosure computed from all retained mesh points, including
  hardware and instances. A cube about the transformed local bounding-sphere
  center contains every rotated vertex and every actual world AABB corner.
- F4: Scope the new framing to poses produced by free rotation. Ordinary orbit,
  named presets and existing custom links must retain their old framing. An optional
  literal custom-view field is needed to persist framing across reload. Absence
  retains legacy behavior; the input tool itself remains transient.
- F5: Floor correction stays exact. Camera tracks the transformed sphere center,
  preventing changes of the asymmetric AABB center from shifting the apparent
  rotation pivot. Distance, FOV and orientation stay constant for fixed settings.
- F6: Test full horizontal/vertical/mixed turns, all devices and output aspects,
  actual bounds, URL hydration, export restoration, geometry edits and reset.
  Browser validation uses existing real-input guard plus a distance assertion.
  Local Chromium is unavailable; use the previously authorized cloud CI exception.
