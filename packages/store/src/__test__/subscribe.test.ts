import { createStore, model } from '..';

interface State {
  value: number;
}

const count1Model = model<State>('count1').define({
  state: {
    value: 1,
  },
  actions: {
    add(state) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
  },
});

const count2Model = model<State>('count2').define({
  state: {
    value: 1,
  },
  computed: {
    sum: [
      count1Model,
      (state, state2) => {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return state.value + state2.value;
      },
    ],
  },
  actions: {
    add1(state) {
      return {
        ...state,
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

  test('subscribe should works for computed property depending on other models', () => {
    const store = createStore();

    const [, action] = store.use(count1Model);
    const [state2, , subscribe] = store.use(count2Model);

    const fn = jest.fn();
    subscribe(() => {
      fn();
    });

    expect(fn).toBeCalledTimes(0);
    action.add();
    expect(fn).toBeCalledTimes(1);
    const [updateState2] = store.use(count2Model);
    // state from use is immutable
    expect(state2.sum).toBe(2);
    expect(updateState2.sum).toBe(3);
  });

  test('unsubscribe should works', () => {
    const store = createStore();

    const [, actions, subscribe] = store.use(count1Model);
    const fn = jest.fn();

    const unsubscribe = subscribe(() => {
      fn();
    });

    actions.add();

    expect(fn).toBeCalledTimes(1);

    unsubscribe();

    expect(fn).toBeCalledTimes(1);
  });
});
