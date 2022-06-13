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

type ActionDesc<S, State> = {
  actions?: Actions<State extends void ? S : State>;
};

type ModelFn = <State = void>(
  name: string,
) => {
  define: (<
    S,
    M extends ActionDesc<S, State> & { state: S } = ActionDesc<S, State> & {
      state: S;
    },
    Resp = {
      _name: string;
      _: Omit<M, 'state'> & { state: State extends void ? S : State };
    },
  >(
    c: (...args: ModelInitialParams) => M & { state: S },
  ) => Resp &
    ((ns: string) => Resp & ((ns: string) => Resp)) & {
      state: State extends void ? S : State;
    }) &
    (<
      S,
      M extends ActionDesc<S, State> & { state: S } = ActionDesc<S, State> & {
        state: S;
      },
      Resp = {
        _name: string;
        _: Omit<M, 'state'> & { state: State extends void ? S : State };
      },
    >(
      c: M & { state: S },
    ) => Resp & {
      (ns: string): Resp & ((ns: string) => Resp);
      _name: string;
      _: Omit<M, 'state'> & { state: State extends void ? S : State };
    });
};
const model: ModelFn = name => ({
  define(modelDesc) {
    let modelInitializer: ModelInitial<any>;

    if (typeof modelDesc === 'function') {
      modelInitializer = modelDesc;
    } else {
      modelInitializer = () => modelDesc;
    }

    const modelCache = new Map<string, ReturnType<typeof createResponse>>();

    const createResponse = (initialLizer: ModelInitial<any>) => {
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

      Object.defineProperty(response, initializerSymbol, {
        configurable: false,
        enumerable: false,
        value: initialLizer,
      });

      return response as any;
    };

    return createResponse(modelInitializer);
  },
});

export const getModelInitializer = (_model: Model) =>
  _model?.[initializerSymbol];

export const isModel = (_model: any): _model is Model =>
  Boolean(getModelInitializer(_model));

export default model;
