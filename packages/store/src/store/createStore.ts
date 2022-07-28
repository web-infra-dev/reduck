import {
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  Reducer,
} from 'redux';
import { createContext } from './context';
import type { Context, StoreConfig } from '@/types';

const createStore = (props: StoreConfig = {}): Context['store'] => {
  const store: any = {};
  const context = createContext(store);

  // Load all available plugins
  props?.plugins?.forEach(plugin => context.pluginCore.usePlugin(plugin));

  const finalProps = context.pluginCore.invokePipeline('config', props);

  const { initialState = {}, middlewares, enhancers = [] } = finalProps;

  Object.assign(
    store,
    createReduxStore(
      (state => state) as Reducer,
      initialState,
      compose(
        ...[
          middlewares ? applyMiddleware(...middlewares) : undefined,
          ...(enhancers || []),
        ].filter(Boolean),
      ),
    ),
  );

  store.use = context.apis.useModel;

  context.pluginCore.invokeWaterFall('afterCreateStore', store);

  return store;
};

export default createStore;
