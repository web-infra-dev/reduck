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

type ActionWithState<S> = (s: S, ...args: any[]) => S | void;
interface ActionsDeep<S> {
  [k: string]: ActionsDeep<S> | ActionWithState<S>;
}

type Desc<S, State> = {
  actions?: ActionsDeep<State extends void ? S : State>;
};

type DropState<A extends ActionsDeep<any>> = {
  [k in keyof A]: A[k] extends Record<string, ActionWithState<any>>
    ? DropState<A[k]>
    : A[k] extends (s: any, ...p: infer P) => any
    ? (...p: P) => void
    : () => void;
};

const model = <State = void>(
  name: string,
): {
  define: (<
    S,
    M extends Desc<S, State> & { state: S } = Desc<S, State> & { state: S },
    Resp = {
      _name: string;
      _: Omit<M, 'state'> & { state: State extends void ? S : State };
    },
  >(
    c: (...args: any[]) => M & { state: S },
  ) => Resp &
    ((ns: string) => Resp & ((ns: string) => Resp)) & { m: M } & M & {
      state: S;
    } & {
      rawDispatch: M['actions'];
      dispatch: DropState<M['actions']>;
    }) &
    (<
      S,
      M extends Desc<S, State> & { state: S } = Desc<S, State> & { state: S },
      Resp = {
        _name: string;
        _: Omit<M, 'state'> & { state: State extends void ? S : State };
      },
    >(
      c: M & { state: S },
    ) => Resp & {
      (ns: string): Resp & ((ns: string) => Resp);
      _name: string;
      name: string;
      _: Omit<M, 'state'> & { state: State extends void ? S : State };
    } & {
      m: M;
    } & M & { state: S } & {
        rawDispatch: M['actions'];
        dispatch: DropState<M['actions']>;
      });
} => ({
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

export const getModelInitializer = (_model: Model) => _model[initializerSymbol];

export const isModel = (_model: any): _model is Model =>
  Boolean(getModelInitializer(_model));

export default model;
