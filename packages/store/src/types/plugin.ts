import type { Store } from 'redux';
import type { Context, StoreConfig } from './app';
import type { Action, Model, ModelDesc, MountedModel } from './model';

export interface PluginContext {
  store: Store;
}

export interface PluginLifeCycle {
  /**
   * Before createStore, this hook will be invoked. Use to change config.
   */
  config?: <T extends StoreConfig>(config: T) => T;

  /**
   * Runs after store created
   */
  afterCreateStore?: <T extends Context['store'] = Context['store']>(
    store: T,
  ) => T;

  /**
   * Runs when a model mounted for first time.
   */
  modelMount?: <T extends { modelDesc: ModelDesc; mountedModel: MountedModel }>(
    params: T,
    api: {
      /**
       * path: ['todo', 'load']
       */
      setDispatchAction: (path: string[], dispatchAction: any) => void;
    },
  ) => T;

  /**
   * invoke before useModel value return.
   * You can custom returned value in this hook.
   */
  useModel?: <T extends { state: any; actions: any }>(
    bypassParams: T,
    {
      models,
      mountedModels,
    }: {
      models: Model[];
      mountedModels: MountedModel[];
    },
  ) => T;

  prepareModelDesc?: (modelDesc: ModelDesc) => ModelDesc;

  /**
   * invoke before reducer execute. You can wrap and return your reducer.
   */
  beforeReducer?: (
    reducer: Action<any>,
    options: { name: string; computedDescriptors: any },
  ) => Action<any>;
}

export type Plugin = (context: PluginContext) => PluginLifeCycle;
