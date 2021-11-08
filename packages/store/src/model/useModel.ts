import mountModel from './mountModel';
import { combineSubscribe } from './subscribe';
import { isModel } from './model';
import { Context, UseModel } from '@/types';

function createUseModel(context: Context): UseModel {
  function useModel(...args: any[]) {
    const flattenedArgs = Array.isArray(args[0])
      ? [...args[0], ...args.slice(1)]
      : args;

    const { getState, getActions, subscribe, models } = mountModels(
      context,
      flattenedArgs,
    );

    let [state, actions] = [getState(), getActions()];

    ({ state, actions } = context.pluginCore.revokePipeline(
      'useModel',
      {
        state,
        actions,
      },
      {
        models,
        mountedModels: models.map(model => context.apis.getModel(model)),
      },
    ));

    return [state, actions, subscribe];
  }

  return useModel as UseModel;
}

const defaultStateSelector = (...states: any[]) => {
  if (states.length === 1) {
    return states[0];
  }

  return states.reduce((res, state) => Object.assign(res, state), {});
};

const defaultActionSelector = (...actions: any[]) =>
  actions.reduce((res, action) => Object.assign(res, action), {});

const mountModels = (context: Context, args: any[]) => {
  const models: any[] = [];
  const selectors: any[] = [];
  for (const model of args) {
    if (isModel(model)) {
      mountModel(context, model);
      models.push(model);
    } else {
      selectors.push(model);
    }
  }

  let stateSelector = defaultStateSelector;
  let actionSelector = defaultActionSelector;

  if (typeof selectors[0] === 'function') {
    stateSelector = selectors[0];
  }

  if (typeof selectors[1] === 'function') {
    actionSelector = selectors[1];
  }

  if (models.length > 1) {
    models.forEach(m => {
      if (
        Object.prototype.toString.call(context.apis.getModel(m).state) !==
        '[object Object]'
      ) {
        throw new Error(
          `You cannot use multiple models one of which's state is primitive data`,
        );
      }
    });
  }

  return {
    getState: () =>
      stateSelector(
        ...models.map(model => context.apis.getModel(model)!.state),
      ),
    getActions: () =>
      actionSelector(
        ...models.map(model => context.apis.getModel(model)!.actions),
      ),
    subscribe: (handler: () => void) =>
      combineSubscribe(
        context,
        ...models.map(model => context.apis.getModelSubscribe(model)),
      )(handler),
    models,
  };
};

export { createUseModel };
