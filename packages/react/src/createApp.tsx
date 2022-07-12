import { createStore } from '@modern-js-reduck/store';
import {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import invariant from 'invariant';
import { UseModel } from '@modern-js-reduck/store/dist/types/types';
import { createBatchManager } from './batchManager';

type Config = Parameters<typeof createStore>[0];
type Store = ReturnType<typeof createStore>;

const shallowEqual = (a: any, b: any) => {
  if (
    Object.prototype.toString.call(a) !== '[object Object]' ||
    Object.prototype.toString.call(b) !== '[object Object]'
  ) {
    return a === b;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  return Object.keys(a).every(key => a[key] === b[key]);
};

export const createApp = (config: Config) => {
  let configFromProvider: Config | null = null;

  const Context = createContext<{
    store: Store;
    batchManager: ReturnType<typeof createBatchManager>;
  }>(null as any);

  const Provider = (
    props: PropsWithChildren<{ store?: Store; config?: Config }>,
  ) => {
    const { children, store: storeFromProps, config: _config } = props;
    const store = storeFromProps || createStore({ ...config, ..._config });
    const batchManager = createBatchManager(store);
    configFromProvider = _config;

    return (
      <Context.Provider value={{ store, batchManager }}>
        {children}
      </Context.Provider>
    );
  };

  const createUseModel =
    (store: Store, batchManager: ReturnType<typeof createBatchManager>) =>
    (..._args: any[]) => {
      const args = _args.flat();
      const initialValue = useMemo(() => store.use(...args), []);
      const [modelValue, setModelValue] = useState(initialValue);

      const lastValueRef = useRef<ReturnType<typeof store.use>>(initialValue);

      useEffect(() => {
        const subscribe = initialValue[2];
        const unsubscribe = subscribe(() => {
          const newValue = store.use(...args);

          if (
            !shallowEqual(lastValueRef.current[0], newValue[0]) ||
            !shallowEqual(lastValueRef.current[1], newValue[1])
          ) {
            batchManager.pushUpdate(() => {
              setModelValue(newValue);
              lastValueRef.current = newValue;
            });
          }
        });

        batchManager.addModels(...args);

        return () => {
          unsubscribe();
          batchManager.removeModels(...args);
        };
      }, []);

      return modelValue;
    };

  const useModel: Store['use'] = (...args: any[]) => {
    const context = useContext(Context);

    invariant(
      Boolean(context),
      `You should wrap your Component with Reduck Provider.`,
    );

    const { store, batchManager } = context;

    const _useModel = useMemo(
      () => createUseModel(store, batchManager),
      [store],
    );
    return _useModel(...args);
  };

  const useStaticModel: Store['use'] = (...args: any[]) => {
    const context = useContext(Context);

    invariant(
      Boolean(context),
      'You should wrap your Component with Reduck Provider.',
    );

    const { store } = context;
    const [state, actions, subscribe] = useMemo(() => store.use(...args), []);
    const value = useRef<ReturnType<UseModel> | any>([
      // deep clone state in case mutate origin state accidentally.
      JSON.parse(JSON.stringify(state)),
      actions,
      subscribe,
    ]);

    useEffect(() => {
      if (Object.prototype.toString.call(state) === '[object Object]') {
        return subscribe(() => {
          const [newState, newActions] = store.use(...args);

          // merge data to old reference
          Object.assign(value.current[0], newState);
          Object.assign(value.current[1], newActions);
        });
      }

      return () => {
        // do nothing
        // forbid eslint error
      };
    }, []);

    return value.current;
  };

  const useLocalModel: Store['use'] = (...args: any[]) => {
    const [store, batchManager] = useMemo(() => {
      const finalConfig = configFromProvider || config;

      const localStoreConfig = {
        enhancers: finalConfig?.enhancers || [],
        middlewares: finalConfig?.middlewares || [],
        plugins: finalConfig?.plugins,
      };

      const reduckStore = createStore(localStoreConfig);

      return [reduckStore, createBatchManager(reduckStore)];
    }, []);

    return useMemo(() => createUseModel(store, batchManager), [])(...args);
  };

  return {
    Provider,
    useModel,
    useStaticModel,
    useLocalModel,
  };
};
