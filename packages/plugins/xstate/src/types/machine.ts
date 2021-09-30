import type { ModelDesc } from '@modern-js-reduck/store';

export type MachineModelDesc<T extends ModelDesc = ModelDesc> = {
  [K in keyof T]: T[K];
} & { machine: NonNullable<T['machine']> };
