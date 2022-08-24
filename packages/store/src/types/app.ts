import { Reducer, Store as ReduxStore, Middleware, StoreEnhancer } from 'redux';
import { Model, MountedModel } from './model';
import { Plugin } from './plugin';
import { createUseModel } from '@/model/useModel';
import { createPluginCore } from '@/plugin';
import { createSubscribe } from '@/model/subscribe';

export interface ReduckContext {
  store: Context['store'];
}

/**
 * Context of reduck app
 */
export interface Context {
  /**
   * Store instance
   */
  store: ReduxStore & {
    use: ReturnType<typeof createUseModel>;
    unmount: (model: Model) => void;
  };
  apis: {
    addReducers: (reducers: Record<string, Reducer>) => void;
    addModel: <M extends Model>(model: M, mountModel: MountedModel<M>) => void;

    getModel: <M extends Model>(model: M) => MountedModel<M> | null;

    useModel: ReturnType<typeof createUseModel>;

    getModelSubscribe: (model: Model) => ReturnType<typeof createSubscribe>;

    /**
     * Get mountedModel instance by modelname
     */
    getModelByName: (name: string) => MountedModel | null;

    /**
     * Tag that model with name is `param name` is in mounting.
     */
    mountingModel: (modelname: string) => void;

    /**
     * Unmount model
     */
    unmountModel: (model: Model) => void;
  };
  pluginCore: ReturnType<typeof createPluginCore>;
}

export interface StoreConfig {
  initialState?: Record<string, any>;
  middlewares?: Middleware[];
  models?: Model[];
  plugins?: Plugin[];
  enhancers?: StoreEnhancer[];
}

export type Store = Context['store'];
