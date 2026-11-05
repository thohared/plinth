# T-P10x research — aligned upper and front views

Base 8dd87a7. Owner supplied phone and laptop reference images.
F1. P-26 and src/main.ts endpoint handler retain lateral azimuth and the model's previous rotation when looking up. Both influence visible tilt.
F2. src/camera/poses.ts defines a centered 65° upper direction for the laptop. An upright slab seen from 85° shows the top edge in the phone reference. The named top preset instead lays the slab flat.
F3. The existing front pose uses neutral device rotation and a centered camera at 5°. Settings.hydrate accepts that same named pose and a validated custom view.
F4. The panel's focused arrow and native activation paths share the action handler. Updating both vertical actions there preserves touch and keyboard parity.
