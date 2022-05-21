import { createStore, model } from '..';

const count1Model = model<{ value: number }>('count1').define(() => ({
  state: {
    value: 1,
  },
  actions: {
    add(state) {
      return {
        ...state,
        // FIXME: ESlint 校验时，无法正确获取参数 state 的类型信息，识别为 any
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        value: state.value + 1,
      };
    },
  },
}));

const count2Model = model<{ value: number }>('count2').define((_, { use }) => {
  use(count1Model);

  return {
    state: {
      value: 1,
    },
    actions: {
      addCount1Value(state) {
        const [{ value: count1Value }] = use(count1Model);

        return {
          ...state,
          // FIXME: ESlint 校验时，无法正确获取参数 state 的类型信息，识别为 any
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          value: state.value + count1Value,
        };
      },
    },
  };
});

describe('test useModel', () => {
  test("use model in model's action should work", () => {
    const store = createStore();

    const [, actions] = store.use(count2Model);
    const [, count1Actions] = store.use(count1Model);

    expect(store.getState()).toEqual({
      count1: { value: 1 },
      count2: { value: 1 },
    });

    actions.addCount1Value();

    expect(store.getState()).toEqual({
      count1: { value: 1 },
      count2: { value: 2 },
    });

    count1Actions.add();

    expect(store.getState()).toEqual({
      count1: { value: 2 },
      count2: { value: 2 },
    });

    actions.addCount1Value();

    expect(store.getState()).toEqual({
      count1: { value: 2 },
      count2: { value: 4 },
    });
  });

  test('use models with same name should get a warning', () => {
    const spy = jest.spyOn(console, 'info');

    const store = createStore();
    const countModel = model('count1').define({
      state: 1,
    });
    store.use(count1Model, countModel);

    expect(spy).toHaveBeenLastCalledWith(
      'model named count1 has already mounted, so skip',
    );

    spy.mockClear();
  });

  test('use self in model will get error', () => {
    const test = model('name').define((_, { use }) => {
      use(test);

      return {
        state: 1,
      };
    });

    expect(() => createStore().use(test)).toThrow(Error);
  });

  test('use mltiple model with primitive state get error', () => {
    const test = model('name').define({
      state: 1,
    });

    expect(() => createStore().use(test, count1Model)).toThrow(Error);
  });
});
