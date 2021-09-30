import { combineReducers, Reducer, Store } from 'redux';
import { createUseModel } from '@/model/useModel';
import { Context, Model, MountedModel } from '@/types';
import { createPluginCore } from '@/plugin';
import { createSubscribe } from '@/model/subscribe';

const createContext = (store: Store) => {
  const reducers: Record<string, Reducer> = {};
  const mountedModels = new Map<Model, MountedModel>();
  const subscriptions = new WeakMap<Model>();
  const mountingModelNames = new Set<string>();
  let lastState: any;

  /**
   * Dynamic add reducer to store
   */
  const addReducers: Context['apis']['addReducers'] = _reducers => {
    if (!lastState) {
      store.subscribe(() => {
        lastState = store.getState();
      });
    }

    Object.assign(reducers, _reducers);

    store.replaceReducer(combineReducers(reducers));
  };

  /**
   * Add to exported models
   */
  const addModel: Context['apis']['addModel'] = (model, mountedModel) => {
    mountedModels.set(model, mountedModel);
    subscriptions.set(model, createSubscribe(context, model));
    mountingModelNames.delete(mountedModel.name);
  };

  const getModel: Context['apis']['getModel'] = model => {
    const mountedModel = mountedModels.get(model);

    if (!mountedModel) {
      return null;
    }

    return {
      name: mountedModel.name,
      state: lastState[mountedModel.name],
      actions: mountedModel.actions,
      modelDesc: mountedModel.modelDesc,
    } as any;
  };

  const getModelByName = (name: string) => {
    let model = null;

    for (const [, mountedModel] of mountedModels) {
      if (mountedModel.name === name) {
        model = mountedModel;
        break;
      }
    }

    return model;
  };

  // Get function to subsribe model
  const getModelSubscribe: Context['apis']['getModelSubscribe'] = (
    model: Model,
  ) => subscriptions.get(model);

  const mountingModel = (name: string) => {
    if (mountingModelNames.has(name)) {
      throw new Error(
        `Perhaps you mount a model named ${name} are in mounting already`,
      );
    }

    mountingModelNames.add(name);
  };

  const pluginCore = createPluginCore({ store });

  /**
   * Add all to context
   */
  const context = {
    store,
    apis: {
      addReducers,
      addModel,
      getModel,
      getModelSubscribe,
      getModelByName,
      mountingModel,
    },
    pluginCore,
  } as Context;

  context.apis.useModel = createUseModel(context);

  return context;
};

export { createContext };
