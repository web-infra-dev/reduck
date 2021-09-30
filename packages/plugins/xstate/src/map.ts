import { interpret } from 'xstate/lib/interpreter';
import { MachineModelDesc } from './types';
import type { MachineMap } from './types/map';

/**
 * merge service map at model mounting
 */
export function mergeMachineMap(
  map: MachineMap,
  modelDesc: MachineModelDesc,
): void {
  // FIXME: mounting model must have name, shoudle fix it's type
  const modelName = modelDesc.name;

  // warning for replacing service
  const prevService = map[modelName];
  if (prevService) {
    console.warn(
      `Mounting a model <${modelName}> with existed service. The service would be overrided.`,
    );
  }

  // generate service from machine schema
  const service = interpret(modelDesc.machine as any);
  service.start();

  map[modelName] = {
    service,
  };
}
