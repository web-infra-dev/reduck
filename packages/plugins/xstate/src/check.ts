import type { ModelDesc } from '@modern-js-reduck/store';
import type { MachineModelDesc } from './types';

export function isMachineModel<T extends ModelDesc>(
  model: T,
): model is MachineModelDesc<T> {
  return Boolean(model.machine);
}
