/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import {
  Context,
  Model,
  ModelDesc,
  OnMountHook,
  ModelDescOptions,
} from '@/types';

type ModelInitial<M extends Omit<ModelDesc<any>, 'name'>> = (
  context: Context,
  {
    use,
    onMount,
  }: {
    use: Context['apis']['useModel'];
    onMount: OnMountHook;
  },
) => M;

export const initializerSymbol = Symbol('model initializer');

const model = <State = void, MDO extends ModelDescOptions = any>(
  name: string,
) => ({
  define: <
    M extends Omit<
      ModelDesc<State extends void ? any : State, MDO>,
      'name'
    > = Omit<ModelDesc<State extends void ? any : State, MDO>, 'name'>,
  >(
    modelDesc: ModelInitial<M> | M,
  ) => {
    let modelInitializer: ModelInitial<M>;

    if (typeof modelDesc === 'function') {
      modelInitializer = modelDesc;
    } else {
      modelInitializer = () => modelDesc;
    }

    const modelCache = new Map<string, ReturnType<typeof createResponse>>();

    const createResponse = (initialLizer: ModelInitial<M>) => {
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
      response._ = undefined as M & {
        state: State extends void ? M['state'] : State;
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

export const isModel = (_model: any) => Boolean(getModelInitializer(_model));

export default model;
