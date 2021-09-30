import type { Interpreter } from 'xstate/lib/interpreter';

export type MachineMap = {
  [K in string]?: {
    service: Interpreter<any>;
  };
};
