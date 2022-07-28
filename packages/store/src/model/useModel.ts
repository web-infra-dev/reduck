import mountModel from './mountModel';
import { combineSubscribe } from './subscribe';
import { Context, Model, UseModel } from '@/types';
import { getComputedDepModels, isModel } from '@/utils/misc';

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

    const { getState, getActions, actualModels, subscribe } = parseModelParams(
      context,
      flattenedArgs,
    );

    const computedArr = actualModels.map(m => {
      const {
        modelDesc: { computed },
      } = context.apis.getModel(m);
      return computed;
    });

    const computedDepModels = getComputedDepModels(computedArr);

    computedDepModels.forEach(model => {
      if (isModel(model)) {
        mountModel(context, model);
      }
    });

    let [state, actions] = [getState(), getActions()];

    ({ state, actions } = context.pluginCore.invokePipeline(
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
  const selectors = [];

  for (const model of models) {
    if (isModel(model)) {
      actualModels.push(model);
    } else {
      selectors.push(model);
    }
  }
  const [stateSelector, actionSelector] = selectors;

  if (actualModels.length > 1) {
    actualModels.forEach(m => {
      if (
        Object.prototype.toString.call(context.apis.getModel(m).state) !==
        '[object Object]'
      ) {
        throw new Error(
          `You cant use multiple model one of which's state is primitive data`,
        );
      }
    });
  }

  const getStateWithComputed = (model: Model) => {
    const {
      state,
      modelDesc: { computed },
    } = context.apis.getModel(model);

    let computedState: any;

    if (computed) {
      computedState = Object.keys(computed).reduce((curState, computedKey) => {
        curState[computedKey] = state[computedKey];
        return curState;
      }, {});
      // state reference always changes when model has computed properties
      return { ...state, ...computedState };
    }

    return state;
  };

  const finalStateSelector = (...models: any[]) => {
    if (stateSelector) {
      return stateSelector(
        ...actualModels.map(model => getStateWithComputed(model)),
      );
    }

    if (models.length === 1) {
      return getStateWithComputed(models[0]);
    }

    return models.reduce(
      (res, model) => ({ ...res, ...getStateWithComputed(model) }),
      {},
    );
  };

  const finalActionSelector =
    actionSelector ||
    ((...actions: any[]) =>
      actions.reduce((res, action) => Object.assign(res, action), {}));

  return {
    getState: () => finalStateSelector(...actualModels),
    getActions: () =>
      finalActionSelector(
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
