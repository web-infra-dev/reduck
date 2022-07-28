import { expectType } from 'tsd';
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
    sub(state, n: number) {
      return {
        ...state,
        value: state.value - n,
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
    sub1(state, n: number) {
      return {
        ...state,
        value: state.value - n,
      };
    },
  },
});
type State = {
  one: number;
  two: number;
};
describe('test selector', () => {
  const store = createStore();

  test('select state should works', () => {
    const [state] = store.use(count1Model, count2Model, (state1, state2) => ({
      one: state1.value,
      two: state2.value,
    }));
    expectType<State>(state);
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
          oneSub: actions1.sub,
          twoSub: actions2.sub1,
        }),
      );

    const [state, actions] = use();
    expectType<State>(state);
    expectType<{
      oneAdd: () => void;
      twoAdd: () => void;
      oneSub: (n: number) => void;
      twoSub: (n: number) => void;
    }>(actions);
  });
});
