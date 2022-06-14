import { createPlugin } from '@modern-js-reduck/store';
import { Model } from '@modern-js-reduck/store/dist/types/types';
import { getType, mergeActions } from './utils';
import * as primitiveActions from './primitive';
import { ArrayDispatchActions } from './array';
import * as arrayActions from './array';
import { ObjectDispatchActions, createObjectActions } from './object';

type ExtractDispatchAction<T, State> = {
  [key in keyof T]: T[key] extends (state: any) => any
    ? () => void
    : T[key] extends (state: any, payload: any) => any
    ? (payload: State) => void
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
      ? ExtractDispatchAction<typeof primitiveActions, M['_']['state']>
      : M['_']['state'] extends any[]
      ? ArrayDispatchActions<M['_']['state']>
      : M['_']['state'] extends Record<string, any>
      ? ObjectDispatchActions<M['_']['state']>
      : Record<string, unknown>;
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
