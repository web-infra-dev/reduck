import { model, createStore } from '..';

const countModel = model<{ value: number }>('counter').define({
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

const store = createStore();

describe('test model', () => {
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
      counter: {
        value: 1,
      },
      counter1: {
        value: 1,
      },
    });

    store.use(countModel('counter1'))[1].add();
    expect(store.getState()).toEqual({
      counter: {
        value: 1,
      },
      counter1: {
        value: 2,
      },
    });
  });

  test(`someModel('a') and someModel('a') should return same reference model`, () => {
    expect(countModel('1')).toBe(countModel('1'));
  });
});
