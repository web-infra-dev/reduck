import { AnyAction as ReduxAction } from 'redux';
import { memorize } from '@/utils/memoize';
import {
  Context,
  ModelDesc,
  Action,
  DispatchActions,
  Model,
  MountedModel,
  OnMountHook,
  UseModel,
} from '@/types';
import {
  getComputedDepModels,
  getModelInitializer,
  getStateType,
  isModel,
  StateType,
} from '@/utils/misc';

const mountModel = (context: Context, model: Model) => {
  if (context.apis.getModel(model)) {
    return;
  }

  const { onMount, trigger: triggerOnMount } = createOnMount();
  context.apis.mountingModel(model._name);

  let modelDesc: ModelDesc = getModelInitializer(model)(context, {
    use: context.apis.useModel,
    onMount,
  });
  modelDesc.name = model._name;

  modelDesc = context.pluginCore.invokePipeline('prepareModelDesc', modelDesc);

  if (!checkModel(context, modelDesc, model)) {
    return;
  }

  const flattenedActions = flattenActions(modelDesc);
  const reducer = createReducer(
    context,
    flattenedActions,
    modelDesc.state,
    modelDesc.computed,
  );

  if (reducer) {
    context.apis.addReducers({ [modelDesc.name]: reducer });
  }

  const [dispatchActions, setDispatchAction] = createDispatchActions(
    context,
    modelDesc,
  );

  let mountedModel = {
    actions: dispatchActions,
    state: modelDesc.state,
    name: modelDesc.name,
    modelDesc,
  } as MountedModel;

  ({ mountedModel } = context.pluginCore.invokePipeline(
    'modelMount',
    {
      modelDesc,
      mountedModel,
    },
    {
      setDispatchAction,
    },
  ));

  context.apis.addModel(model, mountedModel);

  triggerOnMount();
};

const checkModel = (context: Context, modelDesc: ModelDesc, model: Model) => {
  // model's name should be a string, which length > 0
  if (!modelDesc.name || typeof modelDesc.name !== 'string') {
    console.error(
      `model name expected is a valid string, but got ${modelDesc.name}`,
    );

    return false;
  }

  const mountedModel = context.apis.getModelByName(modelDesc.name);

  // model has mounted
  if (mountedModel) {
    console.info(`model named ${modelDesc.name} has already mounted, so skip`);
    context.apis.addModel(model, mountedModel);
    return false;
  }

  return true;
};

const generateComputedDescriptors = (
  computed: any = {},
  useModel: UseModel,
) => {
  return Object.keys(computed).reduce(
    (prev: PropertyDescriptorMap, name: string) => {
      const selector = generateComputedSelector(name, computed[name], useModel);

      prev[name] = {
        get() {
          // this refers to current modelState
          return selector(this);
        },
        // MARK: not enumerable, avoid to get computed properties through rest(...) syntax. eg., reducer {...state}
        enumerable: false,
        configurable: true,
      };
      return prev;
    },
    {},
  );
};

/**
 * Create reducer from model
 */
const createReducer = <S = any>(
  context: Context,
  flattenedActions: Record<string, Action<S>>,
  initialState: S,
  computed?: any,
) => {
  if (!flattenedActions) {
    return null;
  }

  let computedDescriptors =
    computed && generateComputedDescriptors(computed, context.apis.useModel);

  const depModels = getComputedDepModels(computed);

  const isDepModelAction = (actionType: string) => {
    return depModels.some(
      model => actionType.split('/')[0] === model._name.toUpperCase(),
    );
  };

  return (state: S = initialState, reduxAction: ReduxAction) => {
    const actionType = reduxAction.type;
    const reducer = flattenedActions[actionType];

    let newState = state;
    // make sure state and computed reference change when computed properties' depending models change
    if (isDepModelAction(actionType)) {
      newState = { ...state };
      computedDescriptors =
        computed &&
        generateComputedDescriptors(computed, context.apis.useModel);
    }

    if (reducer) {
      newState = context.pluginCore.invokePipeline(
        'beforeReducer',
        flattenedActions[reduxAction.type],
        { name: reduxAction.type, computedDescriptors },
      )(state, reduxAction.payload, ...(reduxAction.extraArgs || []));
    }

    if (computedDescriptors && getStateType(newState) !== StateType.Object) {
      throw Error(`Only object type state can have computed properties.`);
    }

    return computedDescriptors
      ? Object.defineProperties(newState, computedDescriptors)
      : newState;
  };
};

const generateComputedSelector = (
  name: string,
  computed: any,
  useModel: UseModel,
) => {
  let selector: (...args: any) => any;
  let depModels: Model[] | undefined;

  const _selector = (fn, ...args) => {
    const result = fn(...args);
    if (typeof result === 'function') {
      return memorize((...args: any[]) => {
        return result(...args);
      });
    } else {
      return result;
    }
  };

  if (typeof computed === 'function') {
    selector = (state: any) => {
      return _selector(computed, state);
    };
  } else if (Array.isArray(computed)) {
    depModels = computed.slice(0, -1);
    const userSelector = computed.slice(-1)[0];

    if (
      !depModels.every(m => isModel(m)) ||
      typeof userSelector !== 'function'
    ) {
      throw new Error(
        `The types of computed property parameters are not correct. Computed property name: ${name}`,
      );
    }

    selector = (state: any) => {
      return _selector(
        userSelector,
        state,
        ...depModels.map(model => useModel(model)[0]),
      );
    };
  }
  return memorize(selector);
};

/**
 * Flatten nested actions into one layer.
 */
const flattenActions = (modelDesc: ModelDesc) => {
  const flattenedActions: Record<string, Action<any>> = {};

  forEachAction(modelDesc, (path, action) => {
    flattenedActions[path.join('/').toUpperCase()] = action;
  });

  return flattenedActions;
};

const createDispatchActions = (
  context: Context,
  modelDesc: ModelDesc,
): [DispatchActions, (path: string[], action: any) => void] => {
  const dispatchActions: DispatchActions = {};
  const set = (path: string[], value: any) => {
    let cur: any = dispatchActions;
    const len = path.length;

    for (let i = 1; i < len - 1; i++) {
      if (!cur[path[i]]) {
        cur[path[i]] = {};
      }

      cur = cur[path[i]];
    }

    if (!cur[path[len - 1]]) {
      cur[path[len - 1]] = value;
    } else {
      cur[path[len - 1]] = Object.assign(value, cur[path[len - 1]]);
    }
  };

  forEachAction(modelDesc, path =>
    set(path, (payload: any, ...extraArgs: any[]) => {
      context.store.dispatch({
        type: path.join('/').toUpperCase(),
        payload,
        extraArgs,
      });
    }),
  );

  return [dispatchActions, set];
};

/**
 * Traverse action utils
 */
const forEachAction = (
  modelDesc: ModelDesc,
  callback: (path: string[], action: Action<any>) => void,
) => {
  const path = [modelDesc.name];

  const traverse = (action: ModelDesc['actions'] | Action<any>) => {
    if (!action) {
      return null;
    }

    if (typeof action === 'function') {
      return callback(path.slice(), action);
    }

    Object.keys(action).forEach(key => {
      path.push(key);

      traverse(action[key]);

      path.pop();
    });

    return null;
  };

  traverse(modelDesc.actions || {});
};

/**
 * Create onMount hook
 */
const createOnMount = () => {
  const handlers: Parameters<OnMountHook>[0][] = [];
  const triggered = false;

  const onMount = (handler: Parameters<OnMountHook>[0]) => {
    handlers.push(handler);
  };

  const trigger = () => {
    if (triggered) {
      return;
    }

    handlers.forEach(handler => handler());
  };

  return {
    onMount,
    trigger,
  };
};

export default mountModel;
