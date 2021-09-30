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

  // Load all avaliable plugins
  props?.plugins?.forEach(plugin => context.pluginCore.usePlugin(plugin));

  const finialProps = context.pluginCore.revokePipeline('config', props);

  const { initialState = {}, middlewares, enhancers = [] } = finialProps;

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
    ) as Context['store'],
  );

  store.use = context.apis.useModel;

  context.pluginCore.revokeWaterFall('afterCreateStore', store);

  return store;
};

export default createStore;
