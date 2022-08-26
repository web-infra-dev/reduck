import { createPlugin } from '@modern-js-reduck/store';
import { Model } from '@modern-js-reduck/store/dist/types/types';
import { createPromise } from 'redux-promise-middleware';
import thunk from 'redux-thunk';

type AsyncEffect = (...args: any[]) => Promise<any>;
type VoidEffect = (...args: any[]) => void;
type ThunkEffect = (...args: any[]) => () => any;

interface Effects {
  [key: string]: AsyncEffect | VoidEffect | ThunkEffect | Effects;
}

declare module '@modern-js-reduck/store' {
  // Add `effects` type when use model({effects}).
  interface ModelDesc {
    effects?: Effects;
  }

  // Overload GetActions interface to add actions type to useModel's return
  interface GetActions<M extends Model> {
    effectsActions: M['_']['effects'] & {
      [key in keyof M['_']['actions']]: unknown;
    };
  }
}

const isReduxPromiseFulfilled = (data: any) => {
  return typeof data === 'object' && data.action && data.value;
};

const isPromise = (value: any) => {
  if (value !== null && typeof value === 'object') {
    return value && typeof value.then === 'function';
  }

  return false;
};

/**
 * Generate dispatch action from effects definitions.
 */
const createDispatchActionsFromEffects = (
  store: any,
  name: string,
  effects: Effects,
  setDispatchAction: (path: string[], action: any) => void,
) => {
  const path = [name];

  const traverse = (_effects: Effects[string]) => {
    if (typeof _effects === 'function') {
      const type = path.join('/').toUpperCase();

      setDispatchAction(path.slice(), (...args: any[]) => {
        const value = (_effects as (..._args: any[]) => any)(...args);
        const dispatch = (payload: any) =>
          store.dispatch({
            type,
            payload,
          });

        // Handled by promise middleware or redux thunk
        // Otherwise, do not dispatch action, just exec the effect function.
        if (isPromise(value) || typeof value === 'function') {
          const res = dispatch(value);
          if (isPromise(res)) {
            // parse redux-promise result, return orginal value of the effect
            return res.then((data: any) =>
              isReduxPromiseFulfilled(data) ? data.value : data,
            );
          }
          return res;
        }

        return value;
      });
    } else {
      Object.keys(_effects).forEach(key => {
        path.push(key);
        traverse(_effects[key]);
        path.pop();
      });
    }
  };

  traverse(effects);
};

const plugin = createPlugin(context => ({
  config(storeConfig) {
    return {
      ...storeConfig,
      middlewares: [
        ...(storeConfig.middlewares || []),
        createPromise({ promiseTypeDelimiter: '/' }),
        thunk, // currently thunk cannot work with reduck correctlly, maybe we can just remove this style of effects
      ],
    };
  },
  modelMount({ modelDesc, mountedModel }, { setDispatchAction }) {
    const { effects } = modelDesc;

    if (!effects) {
      return {
        modelDesc,
        mountedModel,
      };
    }

    createDispatchActionsFromEffects(
      context.store,
      modelDesc.name,
      modelDesc.effects!,
      setDispatchAction,
    );

    return {
      modelDesc,
      mountedModel,
    } as any;
  },
}));

export default plugin;
