/** Original, unbranded hardware. Apertures use inset dark faces, not CSG. */
import { CircleGeometry, CylinderGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3, type BufferGeometry, type Material } from 'three';
import type { DeviceSpec } from './spec';
import type { DeviceId } from './presets';

export function detailMaterials() {
  return {
    aperture: new MeshStandardMaterial({ color: 0x20262b, roughness: .8 }),
    lens: new MeshPhysicalMaterial({ color: 0x122c3d, metalness: .35, roughness: .12, clearcoat: 1 }),
    flash: new MeshStandardMaterial({ color: 0xe8e3d5, roughness: .45 }),
    rubber: new MeshStandardMaterial({ color: 0x353a3d, roughness: 1 }),
  };
}
type Materials = ReturnType<typeof detailMaterials> & { frame: Material; key: Material; well: Material };
type Geometry = {
  plane(w: number, h: number, radius: number): BufferGeometry;
  solid(w: number, h: number, depth: number, radius: number): BufferGeometry;
};
const Z = new Vector3(0, 0, 1);

function surface(parent: Group, name: string, at: [number, number, number], normal: [number, number, number]): Group {
  const group = new Group(); group.name = name; group.position.set(...at);
  group.quaternion.setFromUnitVectors(Z, new Vector3(...normal)); parent.add(group); return group;
}
function mesh(parent: Group, name: string, geometry: BufferGeometry, material: Material, x = 0, y = 0, z = 0): Mesh {
  const part = new Mesh(geometry, material); part.name = name; part.position.set(x, y, z); parent.add(part); return part;
}
function repeated(parent: Group, name: string, geometry: BufferGeometry, material: Material, points: [number, number, number][]): InstancedMesh {
  const part = new InstancedMesh(geometry, material, points.length); part.name = name;
  const matrix = new Matrix4(); points.forEach((p, i) => part.setMatrixAt(i, matrix.makeTranslation(...p)));
  part.instanceMatrix.needsUpdate = true; parent.add(part); return part;
}
function socket(parent: Group, geometry: Geometry, mats: Materials, width: number, height: number, gap: number): void {
  mesh(parent, 'socket-rim', geometry.plane(width, height, height * .36), mats.well);
  mesh(parent, 'socket-cavity', geometry.plane(width * .87, height * .72, height * .27), mats.aperture, 0, 0, gap);
  mesh(parent, 'socket-contact', geometry.plane(width * .54, height * .12, height * .05), mats.key, 0, 0, gap * 2);
}

export function slabDetails(parent: Group, spec: DeviceSpec, id: DeviceId | undefined, mats: Materials, geometry: Geometry): void {
  if (id !== 'phone' && id !== 'tablet' && id !== 'laptop') return;
  const { w, h, depth: d, bezel, cornerRadius: r } = spec;
  const gap = Math.min(d * .003, .000025);
  const bevel = Math.min(d * .3, bezel * .35);
  const back = surface(parent, 'rear-hardware', [0, 0, -gap], [0, 0, -1]);
  mesh(back, 'rear-cover', geometry.plane(w - 2 * bevel, h - 2 * bevel, Math.max(0, r - bevel)), mats.frame);
  if (id === 'laptop') {
    const size = Math.min(bezel * .25, w * .008);
    mesh(parent, 'webcam', new CircleGeometry(size, 24), mats.aperture, 0, h / 2 - bezel * .52, d + gap);
    mesh(parent, 'webcam-lens', new CircleGeometry(size * .52, 20), mats.lens, 0, h / 2 - bezel * .52, d + gap * 2);
    return;
  }
  // Coordinates are rear-facing: the camera island is on the viewer's left.
  const minor = Math.min(w, h), islandW = minor * (id === 'phone' ? .23 : .13);
  const islandH = islandW * (id === 'phone' ? 1.8 : 1.12);
  const rise = Math.min(d * .15, minor * .015);
  const cx = Math.min(0, -w / 2 + r + islandW * .6), cy = Math.max(0, h / 2 - r - islandH * .6);
  const camera = surface(back, 'camera-module', [cx, cy, gap], [0, 0, 1]);
  mesh(camera, 'camera-island', geometry.solid(islandW, islandH, rise, islandW * .25), mats.well);
  const ys = id === 'phone' ? [-islandH * .25, islandH * .25] : [0];
  const radius = islandW * .31;
  const ring = new CylinderGeometry(radius, radius, rise * .28, 32, 1);
  ring.rotateX(Math.PI / 2);
  repeated(camera, 'camera-rings', ring, mats.key, ys.map(y => [0, y, rise * 1.13]));
  repeated(camera, 'camera-lenses', new CircleGeometry(radius * .79, 32), mats.lens, ys.map(y => [0, y, rise * 1.28 + gap]));
  // Small inner optics and flash distinguish the lens from a flat black circle.
  repeated(camera, 'camera-optics', new CircleGeometry(radius * .33, 24), mats.aperture, ys.map(y => [0, y, rise * 1.28 + gap * 2]));
  mesh(back, 'camera-flash', new CircleGeometry(islandW * .13, 24), mats.flash, cx + islandW * .78, cy, gap);
  const buttonW = d * .46, buttonH = Math.min(h * .10, (h - 2 * r) * .3);
  for (const [side, y, name] of [[1, h * .16, 'power-button'], [-1, h * .22, 'volume-up'], [-1, h * .09, 'volume-down']] as const) {
    if (buttonH < gap * 10) continue;
    const limit = Math.max(0, h / 2 - r - buttonH / 2);
    const mount = surface(parent, name, [side * w / 2, Math.min(y, limit), d / 2], [side, 0, 0]);
    mesh(mount, 'button-cap', geometry.solid(buttonW, buttonH, d * .035, buttonW * .4), mats.key);
  }
  const bottom = surface(parent, 'bottom-hardware', [0, -h / 2 - gap, d / 2], [0, -1, 0]);
  socket(bottom, geometry, mats, Math.min(w * .13, d * 1.25), d * .36, gap);
  const holeR = Math.min(d * .075, w * .009);
  repeated(bottom, 'speaker-openings', new CircleGeometry(holeR, 16), mats.aperture,
    [-1, 1].flatMap(side => Array.from({ length: 5 }, (_, i): [number, number, number] => [side * (w * .19 + i * holeR * 3.2), 0, gap])));
  mesh(bottom, 'microphone', new CircleGeometry(holeR * .65, 16), mats.aperture, w * .105, 0, gap);
}

export function deckDetails(parent: Group, spec: DeviceSpec, baseD: number, baseT: number, mats: Materials, geometry: Geometry): void {
  const { w, depth: d } = spec, gap = Math.min(d * .003, .000025);
  const pad = parent.getObjectByName('trackpad');
  if (pad instanceof Mesh) {
    pad.geometry.computeBoundingBox();
    const size = pad.geometry.boundingBox!.getSize(new Vector3()), edge = Math.min(d * .15, size.y * .03);
    const rim = mesh(parent, 'trackpad-rim', geometry.plane(size.x + edge * 2, size.y + edge * 2, size.y * .06 + edge), mats.aperture);
    rim.rotation.copy(pad.rotation); rim.position.copy(pad.position); rim.position.y = baseT + gap;
    pad.material = mats.key;
  }
  const underside = surface(parent, 'underside-hardware', [0, -gap, baseD / 2], [0, -1, 0]);
  const footW = Math.min(w * .12, baseD * .18), footH = footW * .38;
  repeated(underside, 'rubber-feet', geometry.solid(footW, footH, d * .10, footH * .42), mats.rubber,
    [-1, 1].flatMap(x => [-1, 1].map(y => [x * w * .35, y * baseD * .35, 0] as [number, number, number])));
  repeated(underside, 'ventilation', geometry.plane(w * .018, baseD * .24, w * .008), mats.aperture,
    Array.from({ length: 14 }, (_, i): [number, number, number] => [(i - 6.5) * w * .039, -baseD * .13, gap]));
  for (const [side, z, name, width] of [[-1, .24, 'charging-port', .075], [-1, .44, 'display-port', .12], [1, .28, 'data-port', .095]] as const) {
    const port = surface(parent, name, [side * w / 2 + side * gap, baseT / 2, baseD * z], [side, 0, 0]);
    socket(port, geometry, mats, baseD * width, baseT * .37, gap);
  }
  const outlet = surface(parent, 'rear-vent', [0, baseT / 2, -gap], [0, 0, -1]);
  repeated(outlet, 'rear-ventilation', geometry.plane(w * .023, baseT * .30, baseT * .07), mats.aperture,
    Array.from({ length: 16 }, (_, i): [number, number, number] => [(i - 7.5) * w * .045, 0, 0]));
}
