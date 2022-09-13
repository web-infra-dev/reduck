import { combineReducers, Reducer, Store } from 'redux';
import { createUseModel } from '@/model/useModel';
import { Context, Model, MountedModel } from '@/types';
import { createPluginCore } from '@/plugin';
import { createSubscribe } from '@/model/subscribe';

const dummyReducer = '__REDUCK_DUMMY_REDUCER__';

const createContext = (store: Store) => {
  const reducers: Record<string, Reducer> = {};
  const mountedModels = new Map<string, MountedModel>();
  const subscriptions = new Map<string, ReturnType<typeof createSubscribe>>();
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

    // remove dummy reducer we may add when unmountting a model
    if (reducers[dummyReducer]) {
      delete reducers[dummyReducer];
    }

    Object.assign(reducers, _reducers);
    Object.keys(_reducers).forEach(key => mountingModelNames.delete(key));
    store.replaceReducer(combineReducers(reducers));
  };

  /**
   * Add to exported models
   */
  const addModel: Context['apis']['addModel'] = (model, mountedModel) => {
    mountedModels.set(model._name, mountedModel);
    subscriptions.set(model._name, createSubscribe(context, model));
  };

  const getModel: Context['apis']['getModel'] = model => {
    const mountedModel = getModelByName(model._name);

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

  // Get function to subscribe model
  const getModelSubscribe: Context['apis']['getModelSubscribe'] = (
    model: Model,
  ) => subscriptions.get(model._name);

  const mountingModel = (name: string) => {
    if (mountingModelNames.has(name)) {
      throw new Error(
        `You are mounting the model: ${name} which is already in mounting process`,
      );
    }

    mountingModelNames.add(name);
  };

  const unmountModel = (model: Model) => {
    if (!getModel(model)) {
      return;
    }

    const subscription = subscriptions.get(model._name);
    subscription.getUnsubscribe()?.();

    mountedModels.delete(model._name);
    subscriptions.delete(model._name);

    delete lastState[model._name];
    delete reducers[model._name];

    // redux cannot accept empty reducers, so we fake one.
    if (Object.keys(reducers).length === 0) {
      reducers[dummyReducer] = () => {
        return null;
      };
    }

    store.replaceReducer(combineReducers(reducers));
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
      mountingModel,
      unmountModel,
    },
    pluginCore,
  } as Context;

  context.apis.useModel = createUseModel(context);

  return context;
};

export { createContext };
