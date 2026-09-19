import { presetSpec, type DeviceId } from '../devices/presets';
import type { PoseId } from '../camera/poses';
import type { SceneId } from '../scene/presets';
import type { OutputAspect } from '../output';
import { defaultBackground } from '../scene/background';

export const COMPOSITIONS = [
  { id: 'studio-phone', name: 'Studio', device: 'phone', pose: 'hero', scene: 'soft-studio', aspect: '4:5', outputPad: 0 },
  { id: 'dark-laptop', name: 'Dark studio', device: 'laptop', pose: 'hero', scene: 'dark-glass', aspect: '16:9', outputPad: 0 },
  { id: 'clean-tablet', name: 'Clean view', device: 'tablet', pose: 'front', scene: 'clean-white', aspect: '16:9', outputPad: 0 },
  { id: 'warm-card', name: 'Warm view', device: 'card', pose: 'lean', scene: 'warm-sunset', aspect: '1:1', outputPad: 0 },
] as const satisfies readonly { id: string; name: string; device: DeviceId; pose: PoseId; scene: SceneId; aspect: OutputAspect; outputPad: number }[];
export type CompositionId = typeof COMPOSITIONS[number]['id'];
export function compositionSettings(id: CompositionId, aspect?: OutputAspect) {
  const row = COMPOSITIONS.find(row => row.id === id);
  if (!row) throw new Error('Unknown composition.');
  return { device: row.device, spec: presetSpec(row.device), pose: row.pose, scene: row.scene,
    aspect: aspect ?? row.aspect, outputPad: row.outputPad, tone: 'agx' as const, msaa: false,
    background: defaultBackground(), fit: 'contain' as const, pad: 0, padColor: '#ffffff', composition: row.id };
}
