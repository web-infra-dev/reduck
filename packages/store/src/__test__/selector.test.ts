import { createStore, model } from '..';

const count1Model = model('count1').define({
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

const count2Model = model('count2').define({
  state: {
    value: 10,
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

describe('test selector', () => {
  const store = createStore();

  test('select state should works', () => {
    const [state] = store.use(count1Model, count2Model, (state1, state2) => ({
      one: state1.value,
      two: state2.value,
    }));

    expect(state).toEqual({ one: 1, two: 10 });
  });

  test('select actions should works', () => {
    const use = () =>
      store.use(
        count1Model,
        count2Model,
        (state1, state2) => ({
          one: state1.value,
          two: state2.value,
        }),
        (actions1, actions2) => ({
          oneAdd: actions1.add,
          twoAdd: actions2.add1,
        }),
      );

    const [state, actions] = use();

    expect(state).toEqual({ one: 1, two: 10 });

    actions.oneAdd();

    expect(use()[0]).toEqual({ one: 2, two: 10 });

    actions.twoAdd();

    expect(use()[0]).toEqual({ one: 2, two: 11 });
  });
});
