export const MachineActionPrefix = '__MACHINE__';
export const MachineStateSymbol = Symbol('__machine__');

export const ActionTypes = {
  SEND: 'SEND',
  SET: 'SET',
} as const;

export type ActionTypeNames = typeof ActionTypes[keyof typeof ActionTypes];
