import { Reducer, Store as ReduxStore, Middleware, StoreEnhancer } from 'redux';
import { Model, MountedModel } from './model';
import { Plugin } from './plugin';
import { UseModel } from '@/types';
import { createPluginCore } from '@/plugin';
import { createSubscribe } from '@/model/subscribe';

/**
 * Context of reduck app
 */
export interface Context {
  /**
   * Store instance
   */
  store: ReduxStore & { use: UseModel };
  apis: {
    addReducers: (reducers: Record<string, Reducer>) => void;
    addModel: <M extends Model>(model: M, mountModel: MountedModel<M>) => void;

    getModel: <M extends Model>(model: M) => MountedModel<M> | null;

    useModel: UseModel;

    getModelSubscribe: (model: Model) => ReturnType<typeof createSubscribe>;

    /**
     * Get mountedModel instance by modelname
     */
    getModelByName: (name: string) => MountedModel | null;

    /**
     * Tag that model with name is `param name` is in mounting.
     */
    mountingModel: (modelname: string) => void;
  };
  pluginCore: ReturnType<typeof createPluginCore>;
}

export interface StoreConfig {
  initialState?: Record<string, any>;
  reducer?: Reducer;
  middlewares?: Middleware[];
  models?: Model[];
  plugins?: Plugin[];
  enhancers?: StoreEnhancer[];
}

export type Store = Context['store'];
