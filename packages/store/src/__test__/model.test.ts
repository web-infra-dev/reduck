import { model, createStore } from '..';

interface State {
  value: number;
}

const countModel = model<State>('counter').define({
  state: {
    value: 1,
  },
  actions: {
    add(state: State) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
  },
});

const count2Model = model<State>('counter2').define({
  state: {
    value: 1,
  },
  actions: {
    add2(state: State) {
      return {
        ...state,
        value: state.value + 1,
      };
    },
  },
});

let store = createStore();

describe('test model', () => {
  beforeEach(() => {
    store = createStore();
  });

  test('model can be used by store', () => {
    store.use(countModel);
    expect(store.getState()).toEqual({
      counter: {
        value: 1,
      },
    });
  });

  test('model(name) will return a new model', () => {
    store.use(countModel('counter1'));
    expect(store.getState()).toEqual({
      counter1: {
        value: 1,
      },
    });

    store.use(countModel('counter1'))[1].add();
    expect(store.getState()).toEqual({
      counter1: {
        value: 2,
      },
    });
  });

  test(`someModel('a') and someModel('a') should return same reference model`, () => {
    expect(countModel('1')).toBe(countModel('1'));
  });

  test('unmount model when store only has mounted single model', () => {
    const [, actions, subscribe] = store.use(countModel);
    const mockFn = jest.fn();
    subscribe(mockFn);

    actions.add();
    expect(store.getState()).toEqual({
      counter: {
        value: 2,
      },
    });
    expect(mockFn).toBeCalledTimes(1);

    store.unmount(countModel);
    expect(store.getState().counter).toBeUndefined();

    mockFn.mockClear();
    actions.add();
    expect(mockFn).toBeCalledTimes(0);

    const [, newActions, newSubscribe] = store.use(countModel);
    newSubscribe(mockFn);
    newActions.add();
    expect(mockFn).toBeCalledTimes(1);
    expect(store.getState()).toEqual({
      counter: {
        value: 2,
      },
    });
  });

  test('unmount model when store has mounted multiple models', () => {
    const [, actions, subscribe] = store.use(countModel);
    const [, count2Actions, count2Subscribe] = store.use(count2Model);

    const countCbFn = jest.fn();
    const count2CbFn = jest.fn();
    subscribe(countCbFn);
    count2Subscribe(count2CbFn);

    actions.add();
    expect(store.getState()).toEqual({
      counter: {
        value: 2,
      },
      counter2: {
        value: 1,
      },
    });
    expect(countCbFn).toBeCalledTimes(1);
    expect(count2CbFn).toBeCalledTimes(0);

    store.unmount(countModel);
    expect(store.getState().counter).toBeUndefined();

    count2Actions.add2();
    expect(count2CbFn).toBeCalledTimes(1);

    expect(store.getState()).toEqual({
      counter2: {
        value: 2,
      },
    });

    countCbFn.mockClear();
    count2CbFn.mockClear();

    actions.add();
    expect(countCbFn).toBeCalledTimes(0);
    expect(count2CbFn).toBeCalledTimes(0);

    const [, newActions, newSubscribe] = store.use(countModel);
    newSubscribe(countCbFn);
    newActions.add();
    expect(countCbFn).toBeCalledTimes(1);
    expect(count2CbFn).toBeCalledTimes(0);

    count2Actions.add2();
    expect(count2CbFn).toBeCalledTimes(1);

    expect(store.getState()).toEqual({
      counter: {
        value: 2,
      },
      counter2: {
        value: 3,
      },
    });
  });
});
