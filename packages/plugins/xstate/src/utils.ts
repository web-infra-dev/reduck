import { ActionTypeNames, MachineActionPrefix } from './const';

export function getEventType(name: string, type: ActionTypeNames) {
  const path = [name, MachineActionPrefix, type];

  return path.join('/').toUpperCase();
}
