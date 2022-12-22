import { createStore, utils } from '@modern-js-reduck/store';
import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import invariant from 'invariant';
import { Model, UseModel } from '@modern-js-reduck/store/dist/types/types';
import effectsPlugin from '@modern-js-reduck/plugin-effects';
import immerPlugin from '@modern-js-reduck/plugin-immutable';
import autoActionsPlugin from '@modern-js-reduck/plugin-auto-actions';
import devToolsPlugin, {
  DevToolsOptions,
} from '@modern-js-reduck/plugin-devtools';
import { useIsomorphicLayoutEffect } from './utils/useIsomorphicLayoutEffect';
import { createBatchManager } from './batchManager';

export type Config =
  | (Parameters<typeof createStore>[0] & PluginConfig)
  | undefined;

export type PluginConfig = {
  devTools?: boolean | DevToolsOptions;
  autoActions?: boolean;
};
type Store = ReturnType<typeof createStore>;

// don't import from 'react' to suppress webpack warnings
const { useSyncExternalStore } = React;

const isReact18 = useSyncExternalStore !== undefined;

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

  return Object.keys(a).every(
    key => b.hasOwnProperty(key) && a[key] === b[key],
  );
};

export const getDefaultPlugins = (config?: PluginConfig) => {
  const defaultConfig = {
    devTools: true,
    autoActions: true,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const plugins = [immerPlugin, effectsPlugin];
  if (finalConfig.autoActions) {
    plugins.push(autoActionsPlugin);
  }
  const devToolsOptions = finalConfig.devTools;
  if (devToolsOptions) {
    plugins.push(
      devToolsPlugin(
        typeof devToolsOptions === 'object' ? devToolsOptions : undefined,
      ),
    );
  }
  return plugins;
};

export const createApp = (config: Config = {}) => {
  let configFromProvider: Config;
  const Context = createContext<{
    store: Store;
    batchManager: ReturnType<typeof createBatchManager>;
  }>(null as any);

  const defaultPlugins = getDefaultPlugins(config);

  const Provider = (
    props: PropsWithChildren<{ store?: Store; config?: Config }>,
  ) => {
    const { children, store: storeFromProps, config: _config } = props;
    configFromProvider = { ...config, ..._config };
    // user setting would override default plugins
    configFromProvider.plugins = configFromProvider.plugins || defaultPlugins;

    const contextValue = useMemo(() => {
      const store = storeFromProps || createStore(configFromProvider);
      const batchManager = createBatchManager(store);

      return {
        store,
        batchManager,
      };
    }, [storeFromProps, _config]);

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  };

  const createUseModel =
    (store: Store) =>
    (..._args: any[]) => {
      const args = _args.flat();
      const initialValue = store.use(...args);

      const lastValueRef = useRef<ReturnType<typeof store.use>>(initialValue);

      const getSnapshot = useCallback(() => {
        const newValue = store.use(...args);
        if (!shallowEqual(lastValueRef.current[0], newValue[0])) {
          lastValueRef.current = newValue;
          return newValue;
        } else {
          return lastValueRef.current;
        }
      }, [store, ...args]);

      const selectedState = useSyncExternalStore(
        initialValue[2],
        getSnapshot,
        // The third parameter is required in SSR.
        // The initial state should be set when createStore in hydration stage,
        // so we can use the same getSnapshot to get state.
        getSnapshot,
      );

      return selectedState;
    };

  // for react 17
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const legacy_createUseModel =
    (store: Store, batchManager: ReturnType<typeof createBatchManager>) =>
    (..._args: any[]) => {
      const args = _args.flat();
      // don't depend on stateSelectors and actionSelectors,
      // since they are inline usually and their references always change
      const deps: Model[] = args.filter(item => utils.isModel(item));
      const initialValue = useMemo(() => store.use(...args), [store, ...deps]);
      const [modelValue, setModelValue] = useState(initialValue);

      const lastValueRef = useRef<ReturnType<typeof store.use>>(initialValue);

      const checkForUpdates = (sync = false) => {
        const newValue = store.use(...args);

        if (!shallowEqual(lastValueRef.current[0], newValue[0])) {
          if (sync) {
            setModelValue(newValue);
            lastValueRef.current = newValue;
          } else {
            batchManager.pushUpdate(() => {
              setModelValue(newValue);
              lastValueRef.current = newValue;
            });
          }
        }
      };

      useIsomorphicLayoutEffect(() => {
        const subscribe = initialValue[2];
        const unsubscribe = subscribe(checkForUpdates);

        // always invoke addModels to make sure batchedUpdates is the last listener,
        // so that there are no missing component updates.
        batchManager.addModels(...deps);

        // Pull data from the store after first render in case the store has
        // changed since we began.
        checkForUpdates(true);

        return () => {
          unsubscribe();
          batchManager.removeModels(...deps);
        };
      }, [...deps, initialValue, batchManager]);

      return modelValue;
    };

  const useModel: Store['use'] = (...args: any[]) => {
    const context = useContext(Context);

    invariant(
      Boolean(context),
      `You should wrap your Component with Reduck Provider.`,
    );

    const { store, batchManager } = context;

    const _useModel = useMemo(() => {
      return isReact18
        ? createUseModel(store)
        : legacy_createUseModel(store, batchManager);
    }, [store]);
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

    useIsomorphicLayoutEffect(() => {
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
      const finalConfig = configFromProvider;

      const localStoreConfig = {
        enhancers: finalConfig?.enhancers || [],
        middlewares: finalConfig?.middlewares || [],
        plugins: finalConfig?.plugins,
      };

      const reduckStore = createStore(localStoreConfig);

      return [reduckStore, createBatchManager(reduckStore)];
    }, []);

    return useMemo(() => {
      return isReact18
        ? createUseModel(store)
        : legacy_createUseModel(store, batchManager);
    }, [])(...args);
  };

  const useStore: () => Store = () => {
    const { store } = useContext(Context);
    return store;
  };

  return {
    Provider,
    useStore,
    useModel,
    useStaticModel,
    useLocalModel,
  };
};
