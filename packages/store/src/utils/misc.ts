import { Model } from '@/types';

export const initializerSymbol = Symbol('model initializer');

export const getModelInitializer = (_model: Model) => _model[initializerSymbol];

export const isModel = (_model: any): _model is Model =>
  Boolean(getModelInitializer(_model));

export const getComputedDepModels = (computed: any) => {
  const depModels: Model[] = [];
  const computedArr = Array.isArray(computed) ? computed : [computed];

  computedArr.forEach(_computed => {
    computed &&
      Object.keys(computed).forEach(key => {
        const selector = computed[key];
        if (Array.isArray(selector)) {
          selector.forEach(s => {
            if (!depModels.includes(s) && isModel(s)) {
              depModels.push(s);
            }
          });
        }
      });
  });

  return depModels;
};

export enum StateType {
  Primitive = 'primitive',
  Array = 'array',
  Object = 'object',
}

export const getStateType = (value: any): StateType => {
  if (Array.isArray(value)) {
    return StateType.Array;
    // eslint-disable-next-line eqeqeq
  } else if (typeof value === 'object' && value != 'undefined') {
    return StateType.Object;
  } else {
    // ignore other types of checking which are not supported by Redux
    return StateType.Primitive;
  }
};
