import mountModel from './mountModel';
import { combineSubscribe } from './subscribe';
import { isModel } from './model';
import { Context, UseModel } from '@/types';

function createUseModel(context: Context): UseModel {
  function useModel(...args: any) {
    const flattenedArgs = Array.isArray(args[0])
      ? [...args[0], ...args.slice(1)]
      : args;

    flattenedArgs.forEach(model => {
      if (isModel(model)) {
        mountModel(context, model);
      }
    });

    const { getState, getActions, subscribe, actualModels } = parseModelParams(
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
        models: actualModels,
        mountedModels: actualModels.map(model => context.apis.getModel(model)),
      },
    ));

    return [state, actions, subscribe];
  }

  return useModel as UseModel;
}

const parseModelParams = (context: Context, _models: any) => {
  const models = Array.isArray(_models) ? _models : [_models];
  const actualModels = [];
  let stateSelector: any = null;
  let actionSelector: any = null;

  for (const model of models) {
    if (typeof model === 'function' && !isModel(model)) {
      if (!stateSelector) {
        stateSelector = model;
      } else if (!actionSelector) {
        actionSelector = model;
      }

      continue;
    }

    actualModels.push(model);
  }

  if (actualModels.length > 1) {
    actualModels.forEach(m => {
      if (
        Object.prototype.toString.call(context.apis.getModel(m).state) !==
        '[object Object]'
      ) {
        throw new Error(
          `You cant use mutiple model one of which's state is primitive data`,
        );
      }
    });
  }

  stateSelector =
    stateSelector ||
    ((...states: any[]) => {
      if (states.length === 1) {
        return states[0];
      }

      return states.reduce((res, state) => Object.assign(res, state), {});
    });

  actionSelector =
    actionSelector ||
    ((...actions: any[]) =>
      actions.reduce((res, action) => Object.assign(res, action), {}));

  return {
    getState: () =>
      stateSelector(
        ...actualModels.map(model => context.apis.getModel(model)!.state),
      ),
    getActions: () =>
      actionSelector(
        ...actualModels.map(model => context.apis.getModel(model)!.actions),
      ),
    subscribe: (handler: () => void) =>
      combineSubscribe(
        context,
        ...actualModels.map(model => context.apis.getModelSubscribe(model)),
      )(handler),
    actualModels,
  };
};

export { createUseModel };
