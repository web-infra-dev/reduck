import { createStore, model } from '..';

const count1Model = model('count1').define({
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
});

const count2Model = model('count2').define({
  state: {
    value: 1,
  },
  actions: {
    add1(state) {
      return {
        ...state,
        // FIXME: ESlint 校验时，无法正确获取参数 state 的类型信息，识别为 any
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        value: state.value + 1,
      };
    },
  },
});

describe('test subscribe', () => {
  test('subsribe should works for simple model', () => {
    const store = createStore();

    const [, actions, subscribe] = store.use(count1Model);
    const fn = jest.fn();

    subscribe(() => {
      fn();
    });

    actions.add();

    expect(fn).toBeCalledTimes(1);
  });

  test('subscribe should works for multiple model', () => {
    const store = createStore();

    const [, actions, subscribe] = store.use([count1Model, count2Model]);

    const fn = jest.fn();

    subscribe(() => {
      fn();
    });

    actions.add();

    expect(fn).toBeCalledTimes(1);
    expect(store.getState()).toEqual({
      count1: {
        value: 2,
      },
      count2: {
        value: 1,
      },
    });

    actions.add1();

    expect(fn).toBeCalledTimes(2);

    expect(store.getState()).toEqual({
      count1: {
        value: 2,
      },
      count2: {
        value: 2,
      },
    });
  });

  test('unsubsribe should works', () => {
    const store = createStore();

    const [, actions, subscribe] = store.use(count1Model);
    const fn = jest.fn();

    const unsubsribe = subscribe(() => {
      fn();
    });

    actions.add();

    expect(fn).toBeCalledTimes(1);

    unsubsribe();

    expect(fn).toBeCalledTimes(1);
  });
});
