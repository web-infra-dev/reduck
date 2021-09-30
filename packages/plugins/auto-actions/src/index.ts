import { createPlugin } from '@modern-js-reduck/store';
import { Model } from '@modern-js-reduck/store/dist/types/types';
import { getType, mergeActions } from './utils';
import * as primitiveActions from './primitive';
import { ArrayDisptachActions } from './array';
import * as arrayActions from './array';
import { ObjectDispatchActions, createObjectActions } from './object';

type ExractDispatchAction<T, State> = {
  [key in keyof T]: T[key] extends (state: any) => any
    ? () => void
    : T[key] extends (state: any, payload: any) => any
    ? (paylod: State) => void
    : never;
};

declare module '@modern-js-reduck/store' {
  // Overload GetActions interface to add actions type to useModel's return
  interface GetActions<M extends Model> {
    autoActions: M['_']['state'] extends
      | string
      | number
      | null
      | undefined
      | ((...args: any[]) => any)
      | RegExp
      | symbol
      ? ExractDispatchAction<typeof primitiveActions, M['_']['state']>
      : M['_']['state'] extends any[]
      ? ArrayDisptachActions<M['_']['state']>
      : M['_']['state'] extends Record<string, any>
      ? ObjectDispatchActions<M['_']['state']>
      : never;
  }
}

export default createPlugin(() => ({
  prepareModelDesc(modelDesc) {
    const initialState = modelDesc.state;
    const type = getType(initialState);

    if (type === 'primitive') {
      return mergeActions(modelDesc, primitiveActions);
    }

    if (type === 'array') {
      return mergeActions(modelDesc, arrayActions);
    }

    if (type === 'object') {
      return mergeActions(modelDesc, createObjectActions(modelDesc.state));
    }

    return modelDesc;
  },
}));
