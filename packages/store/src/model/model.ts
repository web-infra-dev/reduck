/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Context, Model, ModelDesc, OnMountHook } from '@/types';

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

type ModelInput<S, A> = {
  name?: string;
  state: S;
  actions?: {
    [k in keyof A]: A[k] extends (state: S, ...payload: infer P) => any
      ? (state: S, ...payload: P) => S | void
      : never;
  };
};

type Fn = (...args: any[]) => any;
type MActions = Record<string, Fn>;

type MModel<S, A extends MActions, SS> = {
  state: S;
  name?: string;
  actions?: {
    [k in keyof A]: A[k] extends (
      state: SS extends void ? S : SS,
      ...payload: infer P
    ) => any
      ? (
          state: SS extends void ? S : SS,
          ...payload: P
        ) => SS extends void ? S | void : SS | void
      : A[k];
  };
};

const model = <State = void>(name: string) => ({
  define: <DS, DA extends MActions, RA>(
    modelDesc:
      | MModel<DS, DA, State>
      | ((
          ...args: ModelInitialParams
        ) => MModel<State extends void ? DS : State, DA, State>),
  ) => {
    let modelInitializer: ModelInitial<any>;

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
        ModelInput<State extends void ? DS : State, DA>,
        'state'
      > & { state: State extends void ? DS : State } & { ds: DS } & {
        da: DA;
      } & { st: State } & { ra: RA };

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
