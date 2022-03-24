/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Context, Model, ModelDesc, OnMountHook, Actions } from '@/types';

type ModelDescWithoutName<S> = Omit<ModelDesc<S, any>, 'name'>;

type ModelInitialParams = [
  context: Context,
  hook: {
    use: Context['apis']['useModel'];
    onMount: OnMountHook;
  },
];

type ModelInitial<S> = (...args: ModelInitialParams) => ModelDescWithoutName<S>;

export const initializerSymbol = Symbol('model initializer');

const model = <State = void>(name: string) => ({
  define: <
    DS,
    M extends ModelDescWithoutName<
      State extends void ? DS : State
    > = ModelDescWithoutName<State extends void ? DS : State>,
  >(
    modelDesc:
      | (M & { state: State extends void ? DS : State })
      | ((
          ...args: ModelInitialParams
        ) => M & { state: State extends void ? DS : State }),
  ) => {
    let modelInitializer: ModelInitial<State extends void ? DS : State>;

    if (typeof modelDesc === 'function') {
      modelInitializer = modelDesc;
    } else {
      modelInitializer = () => modelDesc;
    }

    const modelCache = new Map<string, ReturnType<typeof createResponse>>();

    const createResponse = (
      initialLizer: ModelInitial<State extends void ? DS : State>,
    ) => {
      /**
       * Use to change model namespace when mount model
       * @example
       * use(someModel('hello'))
       */
      const response = (namespace: string) => {
        const cachedModel = modelCache.get(namespace);

        if (cachedModel) {
          return cachedModel;
        }

        const clonedModelInitializer = (...args: [Context, any]) => {
          const result = initialLizer(...args);

          return result;
        };

        const modelInstance = createResponse(clonedModelInitializer);
        modelCache.set(namespace, modelInstance);
        modelInstance._name = namespace || name;

        return modelInstance;
      };

      response._name = name;
      response._ = undefined as Omit<
        {
          state: DS;
          actions?: Actions<DS>;
        },
        'state'
      > & {
        state: State extends void
          ? {
              state: DS;
              actions?: Actions<DS>;
            }['state']
          : State;
      };

      delete response._;

      Object.defineProperty(response, initializerSymbol, {
        configurable: false,
        enumerable: false,
        value: initialLizer,
      });

      return response;
    };

    return createResponse(modelInitializer);
  },
});

export const getModelInitializer = (_model: Model) => _model[initializerSymbol];

export const isModel = (_model: any): _model is Model =>
  Boolean(getModelInitializer(_model));

export default model;
