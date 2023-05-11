import {
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  type Action,
  type Reducer,
  type StoreEnhancer,
  type StoreEnhancerStoreCreator,
} from 'redux';
import { createContext } from './context';
import type { Context, StoreConfig } from '@/types';

const createStore = (props: StoreConfig = {}): Context['store'] => {
  const store: any = {};
  const context = createContext(store);

  // Load all available plugins
  props?.plugins?.forEach(plugin => context.pluginCore.usePlugin(plugin));

  const finalProps = context.pluginCore.invokePipeline('config', props);

  const {
    initialState = {},
    middlewares,
    enhancers = [],
    models = [],
  } = finalProps;

  Object.assign(
    store,
    createReduxStore(
      (state => state) as Reducer,
      initialState,
      compose<StoreEnhancerStoreCreator<unknown>>(
        ...[
          mergeInitialState(),
          middlewares ? applyMiddleware(...middlewares) : undefined,
          ...(enhancers || []),
        ].filter(Boolean),
      ),
    ),
  );

  store.use = context.apis.useModel;
  store.unmount = context.apis.unmountModel;

  if (models.length > 0) {
    store.use(models);
  }

  context.pluginCore.invokeWaterFall('afterCreateStore', store);

  return store;
};

/**
 * Merge prev global state when mounting new models
 * to avoid to miss the initial state of the mounting models
 */
function mergeInitialState(): StoreEnhancer {
  return createStore => (reducer, initialState) => {
    const liftReducer = (r: Reducer) => {
      if (typeof r !== 'function') {
        throw new Error('Expected the reducer to be a function.');
      }

      return (state = initialState, action: Action) => {
        const nextState = r(state, action);
        if (/^@@redux\/REPLACE/.test(action.type)) {
          return { ...state, ...nextState };
        } else {
          return nextState;
        }
      };
    };

    const store = createStore(liftReducer(reducer));

    return {
      ...store,
      replaceReducer: reducer => {
        return store.replaceReducer(liftReducer(reducer));
      },
    };
  };
}

export default createStore;
